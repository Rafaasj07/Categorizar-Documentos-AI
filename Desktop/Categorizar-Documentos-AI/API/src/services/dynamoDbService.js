import dotenv from 'dotenv';
dotenv.config(); // Carrega variáveis do .env

import { DynamoDBClient, PutItemCommand, UpdateItemCommand, ScanCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION }); // Cliente DynamoDB configurado
const tableName = process.env.DYNAMODB_TABLE_NAME; // Nome da tabela no .env

// Registra metadados do documento no DynamoDB
export async function registrarMetadados(metadata) {
    const command = new PutItemCommand({
        TableName: tableName,
        Item: marshall(metadata), // Converte objeto JS para formato DynamoDB
    });
    try {
        await dynamoDbClient.send(command); // Envia comando ao DynamoDB
    } catch (error) {
        console.error("Erro ao registrar metadados no DynamoDB:", error); // Log de erro
        throw new Error("Falha ao registrar informações do documento."); // Lança erro
    }
}

// Atualiza status e resultado da IA no documento especificado
export async function atualizarMetadados(doc_uuid, novoStatus, resultadoIa) {
    const command = new UpdateItemCommand({
        TableName: tableName,
        Key: marshall({ doc_uuid }), // Chave primária
        UpdateExpression: "SET #status = :newStatus, #resultadoIa = :iaResult",
        ExpressionAttributeNames: { "#status": "status", "#resultadoIa": "resultadoIa" },
        ExpressionAttributeValues: marshall({ ":newStatus": novoStatus, ":iaResult": resultadoIa }) // Valores novos
    });
    try {
        await dynamoDbClient.send(command); // Executa atualização
    } catch (error) {
        console.error("Erro ao atualizar status no DynamoDB:", error); // Log de erro
    }
}

/**
 * Busca documentos no DynamoDB, com filtros, ordenação e paginação.
 */
export async function buscarDocumentos(termoBusca, categoria, sortOrder = 'desc', limit = 10, exclusiveStartKey = null) {
    const filterExpressions = [];
    const expressionValues = {};

    // Filtro por termo de busca no nome ou resumo
    if (termoBusca) {
        filterExpressions.push("(contains(fileName, :termo) or contains(resultadoIa.metadados.resumo, :termo))");
        expressionValues[":termo"] = termoBusca;
    }

    // Filtro por categoria única, se fornecida
    if (categoria) {
        filterExpressions.push("resultadoIa.categoria = :categoria");
        expressionValues[":categoria"] = categoria;
    }

    const params = {
        TableName: tableName,
        Limit: limit,
    };

    if (filterExpressions.length > 0) {
        params.FilterExpression = filterExpressions.join(" AND "); // Junta filtros com AND
        params.ExpressionAttributeValues = marshall(expressionValues); // Converte valores
    }
    
    if (exclusiveStartKey) {
        params.ExclusiveStartKey = exclusiveStartKey; // Paginação
    }

    try {
        const command = new ScanCommand(params);
        const { Items, LastEvaluatedKey } = await dynamoDbClient.send(command);
        const documentos = Items.map(item => unmarshall(item)); // Converte de volta para JS

        // Ordena documentos pela data de upload
        documentos.sort((a, b) => {
            const dateA = new Date(a.uploadedTimeStamp);
            const dateB = new Date(b.uploadedTimeStamp);
            return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
        });

        return {
            documentos,
            lastEvaluatedKey: LastEvaluatedKey // Token para próxima página
        };
    } catch (error) {
        console.error("Erro ao buscar documentos no DynamoDB:", error);
        throw new Error("Falha ao buscar documentos."); // Lança erro
    }
}

/**
 * Apaga os metadados de um documento do DynamoDB.
 */
export async function apagarMetadados(doc_uuid) {
    const command = new DeleteItemCommand({
        TableName: tableName,
        Key: marshall({ doc_uuid }), // Chave primária do documento
    });

    try {
        await dynamoDbClient.send(command); // Executa exclusão
        console.log(`Metadados apagados com sucesso do DynamoDB para o doc_uuid: ${doc_uuid}`);
    } catch (error) {
        console.error("Erro ao apagar metadados do DynamoDB:", error); // Log de erro
        throw new Error("Falha ao apagar os metadados do documento."); // Lança erro
    }
}

/**
 * Lista todas as categorias únicas do DynamoDB.
 */
export async function listarCategoriasUnicas() {
    const params = {
        TableName: tableName,
        ProjectionExpression: "resultadoIa.categoria", // Retorna apenas categoria
    };

    try {
        const command = new ScanCommand(params);
        const { Items } = await dynamoDbClient.send(command);

        const categoriasUnicas = new Set();
        Items.map(item => unmarshall(item)).forEach(doc => {
            if (doc.resultadoIa && doc.resultadoIa.categoria) {
                categoriasUnicas.add(doc.resultadoIa.categoria); // Adiciona categoria única
            }
        });

        return Array.from(categoriasUnicas).sort(); // Converte para array e ordena
    } catch (error) {
        console.error("Erro ao listar categorias únicas no DynamoDB:", error);
        throw new Error("Falha ao listar categorias."); // Lança erro
    }
}