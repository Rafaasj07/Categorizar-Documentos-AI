import dotenv from 'dotenv';
dotenv.config();
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

// Configura a conexão com o container do MinIO no Docker.
const minioClient = new Minio.Client({
    endPoint: 'minio',
    port: 9000,
    useSSL: false,
    accessKey: 'minioadmin',
    secretKey: 'minioadmin'
});

// Envia um arquivo para o armazenamento.
export async function uploadParaMinIO(fileBuffer, originalName) {
    // Cria um nome de arquivo único para evitar sobreposição.
    const fileExtension = path.extname(originalName);
    const minioKey = `documentos/${uuidv4()}${fileExtension}`;
    const bucketName = process.env.MINIO_BUCKET_NAME;

    try {
        // Envia o objeto para o bucket no MinIO.
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

// Gera um link de download temporário e seguro para um arquivo.
export async function gerarUrlDownloadMinIO(bucketName, minioKey) {
    try {
        // O link gerado expira em 1 hora (3600 segundos).
        const url = await minioClient.presignedGetObject(bucketName, minioKey, 3600);
        console.log(`URL de download gerada para a chave: ${minioKey}`);
        return url;
    } catch (error) {
        console.error("Erro ao gerar URL pré-assinada do MinIO:", error);
        throw new Error("Não foi possível gerar o link para download.");
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

// Verifica se o bucket (pasta principal) de armazenamento existe e, se não, o cria.
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
        // Se não conseguir criar o bucket, a aplicação é encerrada.
        console.error('Erro ao criar o bucket:', error);
        process.exit(1);
    }
}