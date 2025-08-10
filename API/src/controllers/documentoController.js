import { v4 as uuidv4 } from 'uuid'; // Gera IDs únicos para cada documento
import { uploadParaS3, gerarUrlDownload } from '../services/s3Service.js'; // Funções para S3: upload, gerar link de download e apagar
import { registrarMetadados, atualizarMetadados, buscarDocumentos } from '../services/dynamoDbService.js'; // Operações no DynamoDB
import { invocarBedrock } from "../services/bedrockService.js"; // Chama a IA do Bedrock
import { extrairTextoComTextract } from '../services/textractService.js'; // Extrai texto do PDF com Amazon Textract

/**
 * Controller principal: Orquestra todo o processo de análise de um documento.
 * Recebe o arquivo, salva no S3, extrai o texto com Textract, analisa com Bedrock
 * e guarda os resultados no DynamoDB.
 */
export const categorizarComArquivo = async (req, res) => {
    const doc_uuid = uuidv4(); // Cria um ID único para rastrear todo o processo.
    try {
        // 1. Valida se um arquivo foi realmente enviado na requisição.
        if (!req.file) {
            return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
        }

        // 2. Envia o arquivo PDF para o armazenamento no Amazon S3.
        const { s3Key, bucketName } = await uploadParaS3(req.file.buffer, req.file.originalname);

        // 3. Salva um registro inicial no DynamoDB com os metadados básicos do arquivo.
        const metadadosIniciais = {
            doc_uuid, s3Key, bucketName,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            contentType: req.file.mimetype,
            userId: "user-placeholder-id",
            uploadedTimeStamp: new Date().toISOString(),
            status: "UPLOADED"
        };
        await registrarMetadados(metadadosIniciais);

        // 4. Usa o Amazon Textract para extrair todo o conteúdo de texto do PDF que está no S3.
        const textoDoPdf = await extrairTextoComTextract(bucketName, s3Key);

        // 5. Pega a instrução adicional (opcional) enviada pelo usuário no formulário.
        const { promptUsuario } = req.body;

        // 6. Prompt final e mais robusto ajustado pela Flávia.
        const promptFinal = `
Você é um modelo de linguagem especializado em análise documental avançada.
Analise cuidadosamente o seguinte conteúdo extraído de um documento PDF e execute as tarefas abaixo com precisão:
1. Classifique o documento em uma categoria geral apropriada (por exemplo: Contrato, Fatura, Proposta, Relatório, Certificado, etc.), justificando a escolha com base no conteúdo.
2. Extraia os principais metadados identificáveis no texto, considerando elementos contextuais e estruturais do documento.
3. Para dados não presentes no texto, atribua o valor null explicitamente.
---
Texto extraído do documento:
"""
${textoDoPdf}
"""
Instrução adicional do usuário: "${promptUsuario || "Nenhuma"}"

Responda EXCLUSIVAMENTE no formato JSON com a estrutura exata abaixo, mantendo a consistência dos tipos de dados:
{
  "categoria": "Categoria identificada (ex: Contrato)",
  "metadados": {
    "titulo": "Título identificado no texto ou null",
    "autor": "Nome do autor identificado ou null",
    "data": "Data principal do documento no formato DD-MM-YYYY ou null",
    "palavrasChave": ["palavra-chave1", "palavra-chave2", ...],
    "resumo": "Resumo objetivo de até 3 frases do conteúdo principal"
  }
}
Importante:
- Mantenha a estrutura JSON conforme especificado.
- Utilize null para campos não identificados.
- As palavras-chave devem ser relevantes e representativas do conteúdo.
- O resumo deve ser conciso e capturar a essência do documento.
`;
        
        // 7. Envia o prompt para o Amazon Bedrock e aguarda a resposta em JSON.
        const respostaJson = await invocarBedrock(promptFinal);

        // 8. Atualiza o registro no DynamoDB com o resultado da IA e muda o status para "PROCESSED".
        await atualizarMetadados(doc_uuid, "PROCESSED", respostaJson);

        // 9. Envia o resultado final da análise de volta para o frontend.
        res.json(respostaJson);

    } catch (error) {
        // Em caso de qualquer falha no processo, registra o erro e envia uma resposta de erro 500.
        console.error(`Erro no controller para o doc_uuid: ${doc_uuid}`, error);
        res.status(500).json({ erro: 'Erro ao processar o arquivo com a IA.' });
    }
};

/**
 * Controller para buscar documentos. Se um termo de busca for fornecido, ele filtra os resultados.
 * Caso contrário, retorna todos os documentos recentes.
 */
export const buscarDocumentosController = async (req, res) => {
    try {
        const { termo } = req.query; // Pega o termo de busca da URL (ex: /buscar?termo=contrato)
        const resultados = await buscarDocumentos(termo); // Chama a função de busca no serviço do DynamoDB.
        res.json(resultados); // Retorna a lista de documentos encontrados.
    } catch (error) {
        console.error(`Erro no controller de busca:`, error);
        res.status(500).json({ erro: 'Erro ao buscar os documentos.' });
    }
};

/**
 * Controller para gerar um link de download seguro e temporário para um arquivo no S3.
 */
export const downloadDocumentoController = async (req, res) => {
    try {
        const { bucket, key } = req.query; // Pega o nome do bucket e a chave do arquivo da URL.
        if (!bucket || !key) {
            return res.status(400).json({ erro: 'Parâmetros inválidos para o download.' });
        }
        const downloadUrl = await gerarUrlDownload(bucket, key); // Gera a URL pré-assinada.
        res.json({ downloadUrl }); // Envia a URL de volta para o frontend.
    } catch (error) {
        console.error(`Erro no controller de download:`, error);
        res.status(500).json({ erro: 'Erro ao gerar o link de download.' });
    }
};