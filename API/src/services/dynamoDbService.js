import dotenv from 'dotenv';
dotenv.config(); // Carrega variáveis do .env

import { DynamoDBClient, PutItemCommand, UpdateItemCommand, ScanCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.DYNAMODB_TABLE_NAME;
const correcoesTableName = process.env.DYNAMODB_CORRECOES_TABLE_NAME;

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

// Busca documentos no DynamoDB com filtros, ordenação e paginação.
export async function buscarDocumentos(termoBusca, categoria, sortOrder = 'desc', limit = 10, exclusiveStartKey = null) {
    const filterExpressions = [];
    const expressionValues = {};

    if (termoBusca) {
        filterExpressions.push("(contains(fileName, :termo) or contains(resultadoIa.metadados.resumo, :termo))");
        expressionValues[":termo"] = termoBusca;
    }

    if (categoria) {
        filterExpressions.push("resultadoIa.categoria = :categoria");
        expressionValues[":categoria"] = categoria;
    }

    const params = {
        TableName: tableName,
        Limit: limit,
        ExclusiveStartKey: exclusiveStartKey,
    };

    if (filterExpressions.length > 0) {
        params.FilterExpression = filterExpressions.join(" AND ");
        params.ExpressionAttributeValues = marshall(expressionValues);
    }

    try {
        const command = new ScanCommand(params);
        const { Items, LastEvaluatedKey } = await dynamoDbClient.send(command);

        let documents = [];
        if (Items) {
            documents = Items.map(item => unmarshall(item));
        }

        documents.sort((a, b) => {
            const dateA = new Date(a.uploadedTimeStamp);
            const dateB = new Date(b.uploadedTimeStamp);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        return {
            documentos: documents,
            lastEvaluatedKey: LastEvaluatedKey
        };

    } catch (error) {
        console.error("Erro ao buscar documentos no DynamoDB:", error);
        throw new Error("Falha ao buscar documentos.");
    }
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

// Salva a correção de categoria feita por um usuário
export async function registrarCorrecaoCategoria(doc_uuid, categoriaCorrigida, textoCompleto) {
    const command = new PutItemCommand({
        TableName: correcoesTableName,
        Item: marshall({
            correcao_uuid: doc_uuid,
            categoriaCorrigida: categoriaCorrigida,
            // Armazena um trecho do texto para ser usado como exemplo no prompt
            trechoTexto: textoCompleto ? textoCompleto.substring(0, 2000) : "Texto não fornecido",
            timestamp: new Date().toISOString(),
        }),
    });
    try {
        await dynamoDbClient.send(command);
    } catch (error) {
        console.error("Erro ao registrar correção no DynamoDB:", error);
    }
}

/**
 * Busca no DynamoDB as correções mais recentes feitas por usuários
 * para usar como exemplos ("few-shot") no prompt da IA.
 */
export async function buscarExemplosDeCorrecao(limit = 5) {
    console.log("Buscando exemplos de correções no DynamoDB...");
    const params = {
        TableName: correcoesTableName,
        // Limitar a quantidade de itens escaneados pode ser uma otimização,
        // mas a ordenação posterior garante que pegaremos os mais recentes.
    };

    try {
        const command = new ScanCommand(params);
        const { Items } = await dynamoDbClient.send(command);

        if (!Items || Items.length === 0) {
            return [];
        }

        // Converte os itens do DynamoDB para objetos JS
        const correcoes = Items.map(item => unmarshall(item));

        // Ordena as correções pela data (timestamp) para pegar as mais recentes
        correcoes.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // Pega apenas o número de exemplos definido pelo limite (padrão: 5)
        const exemplosRecentes = correcoes.slice(0, limit);

        // Mapeia para o formato que o prompt espera: { texto, categoria }
        return exemplosRecentes.map(ex => ({
            texto: ex.trechoTexto,
            categoria: ex.categoriaCorrigida
        }));

    } catch (error) {
        console.error("Erro ao buscar exemplos de correção no DynamoDB:", error);
        // Em caso de erro, retorna um array vazio para não quebrar a aplicação
        return [];
    }
}