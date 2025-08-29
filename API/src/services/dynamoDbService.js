import dotenv from 'dotenv';
dotenv.config(); // Carrega variáveis do .env

import { DynamoDBClient, PutItemCommand, UpdateItemCommand, ScanCommand, DeleteItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
const tableName = process.env.DYNAMODB_TABLE_NAME;

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
 * Busca documentos no DynamoDB com filtros, ordenação e paginação.
 */
export async function buscarDocumentos(termoBusca, categoria, sortOrder = 'desc', limit = 10, exclusiveStartKey = null) {
    const allMatchingDocuments = [];
    let lastEvaluatedKey = exclusiveStartKey;

    do {
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
            ExclusiveStartKey: lastEvaluatedKey,
        };

        if (filterExpressions.length > 0) {
            params.FilterExpression = filterExpressions.join(" AND ");
            params.ExpressionAttributeValues = marshall(expressionValues);
        }

        try {
            const command = new ScanCommand(params);
            const { Items, LastEvaluatedKey } = await dynamoDbClient.send(command);
            
            if (Items) {
                const documents = Items.map(item => unmarshall(item));
                allMatchingDocuments.push(...documents);
            }
            
            lastEvaluatedKey = LastEvaluatedKey;

        } catch (error) {
            console.error("Erro ao buscar documentos no DynamoDB:", error);
            throw new Error("Falha ao buscar documentos.");
        }
    } while (allMatchingDocuments.length < limit && lastEvaluatedKey);

    allMatchingDocuments.sort((a, b) => {
        const dateA = new Date(a.uploadedTimeStamp);
        const dateB = new Date(b.uploadedTimeStamp);
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    });

    const documentosParaPagina = allMatchingDocuments.slice(0, limit);
    const proximoToken = allMatchingDocuments.length > limit ? lastEvaluatedKey : null;

    return {
        documentos: documentosParaPagina,
        lastEvaluatedKey: proximoToken
    };
}

/**
 * Apaga os metadados de um documento do DynamoDB.
 */
export async function apagarMetadados(doc_uuid) {
    const command = new DeleteItemCommand({
        TableName: tableName,
        Key: marshall({ doc_uuid }),
    });

    try {
        await dynamoDbClient.send(command);
        console.log(`Metadados apagados com sucesso do DynamoDB para o doc_uuid: ${doc_uuid}`);
    } catch (error) {
        console.error("Erro ao apagar metadados do DynamoDB:", error);
        throw new Error("Falha ao apagar os metadados do documento.");
    }
}

/**
 * Lista todas as categorias únicas do DynamoDB.
 */
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