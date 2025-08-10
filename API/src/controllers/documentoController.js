import { v4 as uuidv4 } from 'uuid'; // Gera IDs únicos para cada documento
import { uploadParaS3, gerarUrlDownload } from '../services/s3Service.js'; // Funções para enviar arquivos ao S3 e gerar link de download
import { registrarMetadados, atualizarMetadados, buscarDocumentos } from '../services/dynamoDbService.js'; // Operações no DynamoDB
import { invocarBedrock } from "../services/bedrockService.js"; // Chama IA do Bedrock
import { extrairTextoComTextract } from '../services/textractService.js'; // Extrai texto do PDF com Amazon Textract

// Controller para receber, processar e categorizar documento
export const categorizarComArquivo = async (req, res) => {
    const doc_uuid = uuidv4(); // ID único para rastrear o documento
    try {
        if (!req.file) { // Valida se um arquivo foi enviado
            return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
        }

        console.log(`[${doc_uuid}] Iniciando upload para o S3...`);
        const { s3Key, bucketName } = await uploadParaS3(req.file.buffer, req.file.originalname); // Faz upload para o S3

        console.log(`[${doc_uuid}] Registrando metadados iniciais no DynamoDB...`);
        const metadadosIniciais = { // Dados básicos do arquivo
            doc_uuid, s3Key, bucketName,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            contentType: req.file.mimetype,
            userId: "user-placeholder-id", 
            uploadedTimeStamp: new Date().toISOString(),
            status: "UPLOADED"
        };
        await registrarMetadados(metadadosIniciais); // Salva metadados no DynamoDB

        console.log(`[${doc_uuid}] Extraindo texto do documento com Amazon Textract...`);
        const textoDoPdf = await extrairTextoComTextract(bucketName, s3Key); // Extrai o texto do arquivo

        const { promptUsuario } = req.body; // Entrada extra do usuário para IA

        // Prompt detalhado para a IA classificar e extrair informações
        const promptFinal = `
Você é um modelo de linguagem especializado em análise documental...
...
`;

        const respostaJson = await invocarBedrock(promptFinal); // IA retorna a categorização e metadados

        console.log(`[${doc_uuid}] Atualizando status para PROCESSED no DynamoDB...`);
        await atualizarMetadados(doc_uuid, "PROCESSED", respostaJson); // Atualiza status no banco

        res.json(respostaJson); // Retorna resposta para o cliente
    } catch (error) {
        console.error(`Erro no controller para o doc_uuid: ${doc_uuid}`, error);
        res.status(500).json({ erro: 'Erro ao processar o arquivo com a IA.' });
    }
};

// Controller para buscar documentos no DynamoDB
export const buscarDocumentosController = async (req, res) => {
    try {
        const { termo } = req.query; // Parâmetro de busca opcional
        const resultados = await buscarDocumentos(termo); // Busca no banco
        res.json(resultados); // Retorna lista encontrada
    } catch (error) {
        console.error(`Erro no controller de busca:`, error);
        res.status(500).json({ erro: 'Erro ao buscar os documentos.' });
    }
};

// Controller para gerar link de download de documento no S3
export const downloadDocumentoController = async (req, res) => {
    try {
        const { bucket, key } = req.query; // Nome do bucket e chave do arquivo
        if (!bucket || !key) { // Valida parâmetros
            return res.status(400).json({ erro: 'Parâmetros inválidos para o download.' });
        }
        const downloadUrl = await gerarUrlDownload(bucket, key); // Gera URL temporária
        res.json({ downloadUrl }); // Retorna para o cliente
    } catch (error) {
        console.error(`Erro no controller de download:`, error);
        res.status(500).json({ erro: 'Erro ao gerar o link de download.' });
    }
};
