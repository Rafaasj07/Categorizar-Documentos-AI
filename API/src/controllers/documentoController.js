import { v4 as uuidv4 } from 'uuid';
import { uploadParaS3 } from '../services/s3Service.js';
import { registrarMetadados, atualizarMetadados } from '../services/dynamoDbService.js';
import { invocarBedrock } from "../services/bedrockService.js";
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';


async function extrairTextoDoPdf(dataBuffer) {
    // Converte o buffer do multer (req.file.buffer) para Uint8Array, que é o formato esperado pela lib
    const uint8Array = new Uint8Array(dataBuffer);

    // Abre o documento PDF a partir do buffer
    const doc = await pdfjsLib.getDocument(uint8Array).promise;

    let textoCompleto = '';

    // Percorre todas as páginas do PDF
    for (let i = 1; i <= doc.numPages; i++) {
        const pagina = await doc.getPage(i); // Obtém a página atual
        const conteudo = await pagina.getTextContent(); // Extrai o conteúdo da página

        // Concatena o texto de cada item da página, separando por espaços
        textoCompleto += conteudo.items.map(item => item.str).join(' ');
    }

    // Retorna o texto completo extraído do PDF
    return textoCompleto;
}

export const categorizarComArquivo = async (req, res) => {
    try {
        
        if (!req.file) {
            return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
        }
        const doc_uuid = uuidv4();
        
        console.log(`[${doc_uuid}] Iniciando upload para o S3...`);
        const { s3Key, bucketName } = await uploadParaS3(req.file.buffer, req.file.originalname);
        
        console.log(`[${doc_uuid}] Registrando metadados iniciais no DynamoDB...`);
        const metadadosIniciais = {
            doc_uuid,
            s3Key,
            bucketName,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            contentType: req.file.mimetype,
            userId: "user-placeholder-id",
            uploadedTimeStamp: new Date().toISOString(),
            status: "UPLOADED"
        };
        await registrarMetadados(metadadosIniciais);
   
        console.log(`[${doc_uuid}] Extraindo texto do PDF...`);
        const textoDoPdf = await extrairTextoDoPdf(req.file.buffer);

        const { promptUsuario } = req.body;

        const promptFinal = `
Você é um modelo de linguagem especializado em análise documental.
Analise o seguinte conteúdo extraído de um documento PDF e realize as seguintes tarefas:
1. Classifique o documento em uma categoria geral (por exemplo: Contrato, Fatura, Proposta, Relatório, Certificado, etc.).
2. Extraia os principais metadados que puder identificar no texto.
3. Se algum dado não estiver presente no texto, utilize o valor null.
---
Texto extraído do documento:
"""
${textoDoPdf}
"""
Instrução adicional do usuário (opcional):
"${promptUsuario || "Nenhuma"}"
Responda SOMENTE no formato JSON com a seguinte estrutura exata:
{
  "categoria": "ex: Contrato",
  "metadados": {
    "titulo": "Título identificado no texto, ou null",
    "autor": "Nome do autor, se presente, ou null",
    "data": "Data principal do documento, ou null",
    "palavrasChave": ["palavra1", "palavra2", ...],
    "resumo": "Um resumo objetivo com até 3 frases do conteúdo"
  }
}
`;
   // Envia o prompt para o modelo da AWS Bedrock e aguarda a resposta
        const respostaJson = await invocarBedrock(promptFinal);

        console.log(`[${doc_uuid}] Atualizando status para PROCESSED no DynamoDB...`);
        await atualizarMetadados(doc_uuid, "PROCESSED", respostaJson);

        // Retorna o JSON gerado pela IA como resposta da API
        res.json(respostaJson);

    } catch (error) {
        // Em caso de erro, mostra no console e retorna erro 500 ao cliente
        console.error("Erro no controller:", error);
        res.status(500).json({ erro: 'Erro ao processar o arquivo com a IA.' });
    }
};