import { v4 as uuidv4 } from 'uuid'; // Gera IDs únicos
import { uploadParaS3, gerarUrlDownload, apagarDoS3 } from '../services/s3Service.js'; // Funções para S3
import { registrarMetadados, atualizarMetadados, buscarDocumentos, apagarMetadados, listarCategoriasUnicas } from '../services/dynamoDbService.js'; // Funções para DynamoDB
import { invocarBedrock } from "../services/bedrockService.js"; // Chama IA Bedrock
import { extrairTextoComTextract } from '../services/textractService.js'; // Extrai texto do PDF

// Padroniza a categoria para Title Case e remove lixo
const padronizarCategoria = (categoria) => {
    if (!categoria || typeof categoria !== 'string') {
        return "Indefinida"; // Valor padrão se inválida
    }
    const partePrincipal = categoria.split('/')[0].trim(); // Pega texto antes da barra
    // Converte cada palavra para "PrimeiraMaiúscula"
    return partePrincipal.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

// Controller principal: categoriza documento com IA
export const categorizarComArquivo = async (req, res) => {
    const doc_uuid = uuidv4(); // ID único do documento
    try {
        if (!req.file) { // Verifica se enviaram arquivo
            return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
        }

        // Upload do PDF para S3
        const { s3Key, bucketName } = await uploadParaS3(req.file.buffer, req.file.originalname);

        // Salva metadados iniciais no DynamoDB
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

        // Extrai texto do PDF usando Textract
        const textoDoPdf = await extrairTextoComTextract(bucketName, s3Key);

        // Busca categorias já existentes para sugerir à IA
        const categoriasExistentes = await listarCategoriasUnicas();
        const instrucaoCategorias = categoriasExistentes.length > 0
            ? `Considere reutilizar uma das seguintes categorias existentes se for apropriado: [${categoriasExistentes.join(', ')}].`
            : "Como não há categorias preexistentes, crie uma nova categoria apropriada.";

        // Instrução extra do usuário (opcional)
        const { promptUsuario } = req.body;

        // Monta prompt final para Bedrock
        const promptFinal = `
Você é um modelo de linguagem especializado em análise documental avançada.
Analise o seguinte texto extraído de um documento PDF e execute as tarefas abaixo com precisão:

1.  **Classificação**: Atribua ao documento uma única e concisa categoria. ${instrucaoCategorias} Se precisar criar uma nova, use o formato Title Case (Ex: "Contrato de Aluguel", "Fatura de Energia", "Prova de Legislação"). Evite o uso de barras "/".
2.  **Extração de Metadados**: Extraia os principais metadados do texto. Para campos não encontrados, use o valor \`null\`.

---
Texto extraído do documento:
"""
${textoDoPdf}
"""
Instrução adicional do usuário: "${promptUsuario || "Nenhuma"}"

Responda EXCLUSIVAMENTE no formato JSON com a estrutura exata abaixo:
{
  "categoria": "Uma Categoria Única e Padronizada",
  "metadados": {
    "titulo": "Título identificado ou null",
    "autor": "Nome do autor identificado ou null",
    "data": "Data principal no formato DD-MM-YYYY ou null",
    "palavrasChave": ["palavra-chave1", "palavra-chave2"],
    "resumo": "Resumo objetivo de até 3 frases do conteúdo principal."
  }
}
`;
        
        // Chama IA Bedrock para classificar documento
        const respostaJson = await invocarBedrock(promptFinal);
        
        // Padroniza categoria antes de salvar
        if (respostaJson.categoria) {
            respostaJson.categoria = padronizarCategoria(respostaJson.categoria);
        }

        // Atualiza DynamoDB com resultado da IA
        await atualizarMetadados(doc_uuid, "PROCESSED", respostaJson);

        // Envia resposta para o frontend
        res.json(respostaJson);

    } catch (error) {
        console.error(`Erro no controller para o doc_uuid: ${doc_uuid}`, error); // Log do erro
        await atualizarMetadados(doc_uuid, "FAILED", { erro: error.message }); // Marca como falho
        res.status(500).json({ erro: 'Erro ao processar o arquivo com a IA.' }); // Resposta de erro
    }
};

// Controller para buscar documentos com filtros
export const buscarDocumentosController = async (req, res) => {
    try {
        const { termo, categoria, sortOrder, limit, nextToken } = req.query; // Filtros da busca
        const exclusiveStartKey = nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString('utf-8')) : null;
        const limitNumber = limit ? parseInt(limit, 10) : 10;

        // Busca no DynamoDB
        const { documentos, lastEvaluatedKey } = await buscarDocumentos(
            termo,
            categoria,
            sortOrder,
            limitNumber,
            exclusiveStartKey
        );

        // Prepara token da próxima página
        const nextTokenString = lastEvaluatedKey 
            ? Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64') 
            : null;

        // Retorna documentos e token de paginação
        res.json({
            documentos,
            nextToken: nextTokenString
        });
    } catch (error) {
        console.error(`Erro no controller de busca:`, error); // Log de erro
        res.status(500).json({ erro: 'Erro ao buscar os documentos.' }); // Resposta de erro
    }
};

// Controller para gerar link de download seguro
export const downloadDocumentoController = async (req, res) => {
    try {
        const { bucket, key } = req.query; // Pega parâmetros
        if (!bucket || !key) {
            return res.status(400).json({ erro: 'Parâmetros inválidos para o download.' });
        }
        const downloadUrl = await gerarUrlDownload(bucket, key); // Gera link temporário
        res.json({ downloadUrl }); // Retorna para o frontend
    } catch (error) {
        console.error(`Erro no controller de download:`, error); // Log de erro
        res.status(500).json({ erro: 'Erro ao gerar o link de download.' }); // Resposta de erro
    }
};

// Controller para apagar documentos do S3 e DynamoDB
export const apagarDocumentoController = async (req, res) => {
    const { documentos } = req.body; // Lista de documentos recebida

    if (!documentos || !Array.isArray(documentos) || documentos.length === 0) {
        return res.status(400).json({ erro: 'Nenhum documento selecionado para apagar.' });
    }

    try {
        // Monta promessas de exclusão para cada documento
        const promessasDeExclusao = documentos.map(doc => {
            if (doc.bucketName && doc.s3Key && doc.doc_uuid) {
                return Promise.all([
                    apagarDoS3(doc.bucketName, doc.s3Key), // Remove do S3
                    apagarMetadados(doc.doc_uuid) // Remove do DynamoDB
                ]);
            }
            return Promise.resolve(); // Se inválido, ignora
        });

        await Promise.all(promessasDeExclusao); // Executa tudo em paralelo
        res.status(200).json({ mensagem: 'Documentos selecionados foram apagados com sucesso.' });
    } catch (error) {
        console.error(`Erro no controller de exclusão em lote:`, error); // Log de erro
        res.status(500).json({ erro: 'Erro ao apagar os documentos.' }); // Resposta de erro
    }
};

// Controller para listar categorias únicas
export const listarCategoriasController = async (req, res) => {
    try {
        const categorias = await listarCategoriasUnicas(); // Busca no DynamoDB
        res.json(categorias); // Retorna categorias
    } catch (error) {
        console.error(`Erro no controller de categorias:`, error); // Log de erro
        res.status(500).json({ erro: 'Erro ao listar as categorias.' }); // Resposta de erro
    }
};