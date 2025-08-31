import dotenv from 'dotenv';
dotenv.config(); // Carrega variáveis do .env

import { DynamoDBClient, PutItemCommand, UpdateItemCommand, ScanCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.DYNAMODB_TABLE_NAME;

/**
 * Normaliza uma string, removendo acentos e convertendo para minúsculas.
 * @param {string} str A string para normalizar.
 * @returns {string} A string normalizada.
 */
const normalizeString = (str) => {
  if (!str || typeof str !== 'string') {
    return '';
  }
  return str
    .normalize("NFD") // Separa os acentos das letras
    .replace(/[\u0300-\u036f]/g, "") // Remove os acentos
    .toLowerCase(); // Converte para minúsculas
};

// Registra metadados do documento no DynamoDB
export async function registrarMetadados(metadata) {
    const command = new PutItemCommand({
        TableName: tableName,
        Item: marshall(metadata),
    });
    try {
        await dynamoDbClient.send(command);
    } catch (error) {
        console.error("Erro ao registrar metadados no DynamoDB:", error);
        throw new Error("Falha ao registrar informações do documento.");
    }
}

// Atualiza status e resultado da IA no documento especificado
export async function atualizarMetadados(doc_uuid, novoStatus, resultadoIa) {
    const command = new UpdateItemCommand({
        TableName: tableName,
        Key: marshall({ doc_uuid }),
        UpdateExpression: "SET #status = :newStatus, #resultadoIa = :iaResult",
        ExpressionAttributeNames: { "#status": "status", "#resultadoIa": "resultadoIa" },
        ExpressionAttributeValues: marshall({ ":newStatus": novoStatus, ":iaResult": resultadoIa })
    });
    try {
        await dynamoDbClient.send(command);
    } catch (error) {
        console.error("Erro ao atualizar status no DynamoDB:", error);
    }
}

/**
 * Busca documentos no DynamoDB, aplicando filtros e ordenação em memória
 * de forma insensível a acentos e maiúsculas/minúsculas.
 */
export async function buscarDocumentos(termoBusca, categoria, sortOrder = 'desc', limit = 10, exclusiveStartKey = null) {
    const pageOffset = exclusiveStartKey ? parseInt(Buffer.from(exclusiveStartKey, 'base64').toString('utf-8')) : 0;
    
    let allDocuments = [];
    let lastEvaluatedKeyFromScan = null;

    // 1. Escaneia a tabela inteira para buscar todos os documentos
    do {
        const params = {
            TableName: tableName,
            ExclusiveStartKey: lastEvaluatedKeyFromScan,
        };

        try {
            const command = new ScanCommand(params);
            const { Items, LastEvaluatedKey } = await dynamoDbClient.send(command);
            
            if (Items) {
                allDocuments.push(...Items.map(item => unmarshall(item)));
            }
            
            lastEvaluatedKeyFromScan = LastEvaluatedKey;

        } catch (error) {
            console.error("Erro ao escanear documentos no DynamoDB:", error);
            throw new Error("Falha ao buscar documentos.");
        }
    } while (lastEvaluatedKeyFromScan);

    // 2. Filtra os resultados em memória (case-insensitive e accent-insensitive)
    const normalizedTermo = normalizeString(termoBusca);
    const normalizedCategoria = normalizeString(categoria);

    const filteredDocuments = allDocuments.filter(doc => {
        const nomeArquivo = normalizeString(doc.fileName);
        const resumo = normalizeString(doc.resultadoIa?.metadados?.resumo);
        const categoriaDoc = normalizeString(doc.resultadoIa?.categoria);

        let matchTermo = true;
        if (normalizedTermo) {
            matchTermo = nomeArquivo.includes(normalizedTermo) ||
                         resumo.includes(normalizedTermo) ||
                         categoriaDoc.includes(normalizedTermo);
        }

        let matchCategoria = true;
        if (normalizedCategoria) {
            matchCategoria = categoriaDoc.includes(normalizedCategoria);
        }
        
        return matchTermo && matchCategoria;
    });

    // 3. Ordena os documentos filtrados
    filteredDocuments.sort((a, b) => {
        const dateA = new Date(a.uploadedTimeStamp);
        const dateB = new Date(b.uploadedTimeStamp);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    // 4. Aplica a paginação
    const startIndex = pageOffset;
    const endIndex = startIndex + limit;
    const documentosParaPagina = filteredDocuments.slice(startIndex, endIndex);

    let nextToken = null;
    if (endIndex < filteredDocuments.length) {
        nextToken = Buffer.from(endIndex.toString()).toString('base64');
    }

    return {
        documentos: documentosParaPagina,
        nextToken: nextToken
    };
}

// Apaga os metadados de um documento do DynamoDB.
export async function apagarMetadados(doc_uuid) {
    const command = new DeleteItemCommand({
        TableName: tableName,
        Key: marshall({ doc_uuid }),
    });
    try {
        await dynamoDbClient.send(command);
    } catch (error) {
        console.error("Erro ao apagar metadados do DynamoDB:", error);
        throw new Error("Falha ao apagar os metadados do documento.");
    }
}

// Lista todas as categorias únicas do DynamoDB.
export async function listarCategoriasUnicas() {
    const params = {
        TableName: tableName,
        ProjectionExpression: "resultadoIa.categoria",
    };
    try {
        const command = new ScanCommand(params);
        const { Items } = await dynamoDbClient.send(command);
        const categoriasUnicas = new Set();
        Items.map(item => unmarshall(item)).forEach(doc => {
            if (doc.resultadoIa && doc.resultadoIa.categoria) {
                categoriasUnicas.add(doc.resultadoIa.categoria);
            }
        });
        return Array.from(categoriasUnicas).sort();
    } catch (error) {
        console.error("Erro ao listar categorias únicas no DynamoDB:", error);
        throw new Error("Falha ao listar categorias.");
    }
}