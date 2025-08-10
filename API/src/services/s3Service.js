import dotenv from 'dotenv';
dotenv.config(); // Carrega variáveis do .env

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"; // Para URLs pré-assinadas
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const s3Client = new S3Client({ region: process.env.AWS_REGION }); // Cliente S3 configurado

// Faz upload do arquivo para o bucket S3
export async function uploadParaS3(fileBuffer, originalName) {
    const fileExtension = path.extname(originalName); // Extensão do arquivo
    const s3Key = `documentos/${uuidv4()}${fileExtension}`; // Gera chave única no bucket
    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: s3Key,
        Body: fileBuffer,
        ContentType: 'application/pdf' // Define tipo do arquivo
    });

    try {
        await s3Client.send(command); // Envia arquivo para S3
        console.log(`Arquivo salvo com sucesso no S3 com a chave: ${s3Key}`);
        return { s3Key, bucketName: process.env.S3_BUCKET_NAME };
    } catch (error) {
        console.error("Erro ao fazer upload para o S3:", error);
        throw new Error("Falha no upload do arquivo para o S3.");
    }
}

// Gera URL pré-assinada para download temporário do arquivo
export async function gerarUrlDownload(bucketName, s3Key) {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: s3Key,
    });

    try {
        // URL válida por 1 hora
        const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
        console.log(`URL de download gerada para a chave: ${s3Key}`);
        return url;
    } catch (error) {
        console.error("Erro ao gerar URL pré-assinada:", error);
        throw new Error("Não foi possível gerar o link para download.");
    }
}
