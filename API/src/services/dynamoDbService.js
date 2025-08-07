
// Importa os comandos PutItem e UpdateItem e a função para formatar o JSON
import { DynamoDBClient, PutItemCommand, UpdateItemCommand } from "@aws-sdk/client-dynamodb";
import { marshall } from "@aws-sdk/util-dynamodb";

// Configura o cliente DynamoDB
const dynamoDbClient = new DynamoDBClient({});



//função para registrar os metadados INICIAIS de um documento.
 
export async function registrarMetadados(metadata) {
    const command = new PutItemCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Item: marshall(metadata), 
    });
    try {
        await dynamoDbClient.send(command);
        console.log(`Metadados registrados com sucesso para o doc_uuid: ${metadata.doc_uuid}`);
    } catch (error) {
        console.error("Erro ao registrar metadados no DynamoDB:", error);
        throw new Error("Falha ao registrar informações do documento.");
    }
}


export async function atualizarMetadados(doc_uuid, novoStatus, resultadoIa) {
    const command = new UpdateItemCommand({
        TableName: process.env.DYNAMODB_TABLE_NAME,
        Key: marshall({ doc_uuid }),
        UpdateExpression: "SET #status = :newStatus, #resultadoIa = :iaResult",
        ExpressionAttributeNames: {
            "#status": "status",
            "#resultadoIa": "resultadoIa"
        },
        ExpressionAttributeValues: marshall({
            ":newStatus": novoStatus,
            ":iaResult": resultadoIa
        })
    });

    try {
        await dynamoDbClient.send(command);
        console.log(`Status atualizado com sucesso para o doc_uuid: ${doc_uuid}`);
    } catch (error) {
        console.error("Erro ao atualizar status no DynamoDB:", error);
    }
}