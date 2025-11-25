import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

dotenv.config();

// Configura cliente S3 apontando para o Cloudflare R2
const r2Client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT_URL,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY,
    },
});

//Realiza upload do arquivo para o bucket R2 
export async function uploadParaR2(fileBuffer, originalName) {
    const fileExtension = path.extname(originalName);
    const storageKey = `documentos/${uuidv4()}${fileExtension}`;
    const bucketName = process.env.R2_BUCKET_NAME;

    try {
        const command = new PutObjectCommand({
            Bucket: bucketName,
            Key: storageKey,
            Body: fileBuffer,
            ContentType: 'application/pdf'
        });

        await r2Client.send(command);
        return { storageKey, bucketName };
    } catch (error) {
        console.error("Erro no upload R2:", error);
        throw new Error("Falha no upload do arquivo.");
    }
}

//Remove objeto especificado do bucket R2
export async function apagarDoR2(bucketName, storageKey) {
    try {
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: storageKey
        });
        await r2Client.send(command);
    } catch (error) {
        console.error("Erro ao apagar do R2:", error);
        throw new Error("Falha ao apagar o arquivo.");
    }
}

//Recupera stream de leitura do arquivo armazenado no R2
export async function getObjectStreamFromR2(bucketName, storageKey) {
    try {
        const command = new GetObjectCommand({
            Bucket: bucketName,
            Key: storageKey
        });
        const response = await r2Client.send(command);
        return response.Body;
    } catch (error) {
        console.error("Erro ao obter stream do R2:", error);
        throw new Error("Falha ao buscar o arquivo.");
    }
}