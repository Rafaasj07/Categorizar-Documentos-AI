import dotenv from 'dotenv';
dotenv.config(); // Carrega variáveis do .env

import { DynamoDBClient, PutItemCommand, UpdateItemCommand, ScanCommand } from "@aws-sdk/client-dynamodb";
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
        Key: marshall({ doc_uuid }), // Chave primária para identificar item
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
 * Busca documentos no DynamoDB.
 * @param {string} [termoBusca] - Termo para filtro (opcional).
 * @returns {Promise<Array>} - Lista de documentos encontrados, ordenados pela data.
 */
export async function buscarDocumentos(termoBusca) {
    let params;
    if (termoBusca) {
        // Aplica filtro para buscar por nome, categoria ou resumo
        params = {
            TableName: tableName,
            FilterExpression: "contains(fileName, :termo) or contains(resultadoIa.categoria, :termo) or contains(resultadoIa.metadados.resumo, :termo)",
            ExpressionAttributeValues: marshall({ ":termo": termoBusca })
        };
    } else {
        // Busca todos os documentos (scan completo)
        params = {
            TableName: tableName
        };
    }

    try {
        const command = new ScanCommand(params);
        const { Items } = await dynamoDbClient.send(command);

        // Converte e ordena documentos por data de upload (mais recente primeiro)
        const documentos = Items.map(item => unmarshall(item));
        documentos.sort((a, b) => new Date(b.uploadedTimeStamp) - new Date(a.uploadedTimeStamp));

        console.log(`Busca por "${termoBusca || 'todos'}" encontrou ${documentos.length} resultados.`);
        return documentos;
    } catch (error) {
        console.error("Erro ao buscar documentos no DynamoDB:", error);
        throw new Error("Falha ao buscar documentos.");
    }
}
