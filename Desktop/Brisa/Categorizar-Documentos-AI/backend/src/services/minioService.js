import dotenv from 'dotenv';
dotenv.config();
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Configura a conexão com o container do MinIO no Docker.
// Este cliente único é o correto para todas as operações.
const minioClient = new Minio.Client({
    endPoint: process.env.MINIO_ENDPOINT,
    port: parseInt(process.env.MINIO_PORT, 10), 
    useSSL: process.env.MINIO_USE_SSL === 'true', 
    accessKey: process.env.MINIO_ACCESS_KEY,
    secretKey: process.env.MINIO_SECRET_KEY
});


// Envia um arquivo para o armazenamento.
export async function uploadParaMinIO(fileBuffer, originalName) {
    const fileExtension = path.extname(originalName);
    const minioKey = `documentos/${uuidv4()}${fileExtension}`;
    const bucketName = process.env.MINIO_BUCKET_NAME;

    try {
        await minioClient.putObject(bucketName, minioKey, fileBuffer, {
            'Content-Type': 'application/pdf'
        });
        console.log(`Arquivo salvo com sucesso no MinIO com a chave: ${minioKey}`);
        return { minioKey, bucketName };
    } catch (error) {
        console.error("Erro ao fazer upload para o MinIO:", error);
        throw new Error("Falha no upload do arquivo para o MinIO.");
    }
}

// Apaga um arquivo do armazenamento no MinIO.
export async function apagarDoMinIO(bucketName, minioKey) {
    try {
        await minioClient.removeObject(bucketName, minioKey);
        console.log(`Arquivo apagado com sucesso do MinIO: ${minioKey}`);
    } catch (error) {
        console.error("Erro ao apagar objeto do MinIO:", error);
        throw new Error("Falha ao apagar o arquivo do MinIO.");
    }
}

// Verifica se o bucket de armazenamento existe e, se não, o cria.
export async function criarBucketSeNaoExistir() {
    const bucketName = process.env.MINIO_BUCKET_NAME;
    try {
        const existe = await minioClient.bucketExists(bucketName);
        if (!existe) {
            await minioClient.makeBucket(bucketName);
            console.log(`Bucket "${bucketName}" criado com sucesso.`);
        } else {
            console.log(`Bucket "${bucketName}" já existe.`);
        }
    } catch (error) {
        console.error('Erro ao criar o bucket:', error);
        process.exit(1);
    }
}

// Busca um arquivo do MinIO e o retorna como um stream legível.
export async function getObjectStreamFromMinIO(bucketName, minioKey) {
    try {
        const stream = await minioClient.getObject(bucketName, minioKey);
        console.log(`Stream do arquivo ${minioKey} obtido com sucesso.`);
        return stream;
    } catch (error) {
        console.error("Erro ao obter stream do objeto no MinIO:", error);
        throw new Error("Falha ao buscar o arquivo no MinIO.");
    }
}