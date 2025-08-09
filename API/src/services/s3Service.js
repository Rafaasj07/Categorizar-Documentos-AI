
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid'; 
import path from 'path';

// Configura o cliente S3
const s3Client = new S3Client({});
// Função para fazer o upload de um arquivo para o S3
export async function uploadParaS3(fileBuffer, originalName) {
    // Pega a extensão do arquivo original
    const fileExtension = path.extname(originalName);
    
    // Cria uma chave única para o objeto no S3 para evitar conflitos de nome
    const s3Key = `documentos/${uuidv4()}${fileExtension}`;

    // Monta o comando de upload
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME, 
        Key: s3Key,                         
        Body: fileBuffer,                    
        ContentType: 'application/pdf'      
    });

    try {
        // Envia o comando para o S3
        await s3Client.send(command);
        console.log(`Arquivo salvo com sucesso no S3 com a chave: ${s3Key}`);
        
        // Retorna a chave e o nome do bucket para serem salvos no DynamoDB
        return { 
            s3Key, 
            bucketName: process.env.S3_BUCKET_NAME 
        };
    } catch (error) {
        console.error("Erro ao fazer upload para o S3:", error);
        throw new Error("Falha no upload do arquivo para o S3.");
    }
}