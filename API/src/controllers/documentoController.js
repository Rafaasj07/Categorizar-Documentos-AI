import { v4 as uuidv4 } from 'uuid'; // Gera IDs únicos
import { uploadParaS3, gerarUrlDownload, apagarDoS3 } from '../services/s3Service.js'; // Funções para S3
import {
    registrarMetadados,
    atualizarMetadados,
    buscarDocumentos,
    apagarMetadados,
    listarCategoriasUnicas,
    registrarCorrecaoCategoria,
    buscarExemplosDeCorrecao
} from '../services/dynamoDbService.js'; // Funções para DynamoDB
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

// Função para dividir texto em pedaços (chunks)
const MAX_CHUNK_SIZE = 15000; // Defina um tamanho máximo seguro para o prompt

function criarChunks(texto) {
    if (texto.length <= MAX_CHUNK_SIZE) {
        return [texto];
    }
    const chunks = [];
    for (let i = 0; i < texto.length; i += MAX_CHUNK_SIZE) {
        chunks.push(texto.substring(i, i + MAX_CHUNK_SIZE));
    }
    return chunks;
}


// Controller principal: categoriza documento com IA (VERSÃO MELHORADA)
export const categorizarComArquivo = async (req, res) => {
    const doc_uuid = uuidv4();
    try {
        if (!req.file) {
            return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
        }

        const { s3Key, bucketName } = await uploadParaS3(req.file.buffer, req.file.originalname);

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

        const textoDoPdf = await extrairTextoComTextract(bucketName, s3Key);

        const chunks = criarChunks(textoDoPdf);
        if (chunks.length > 1) {
            console.log(`Documento muito longo. Analisando o primeiro de ${chunks.length} chunks.`);
        }
        const textoParaAnalise = chunks[0];

        const categoriasExistentes = await listarCategoriasUnicas();
        const exemplosDeCorrecao = await buscarExemplosDeCorrecao();

        const instrucaoCategorias = categoriasExistentes.length > 0
            ? `Considere reutilizar uma das seguintes categorias existentes: [${categoriasExistentes.join(', ')}].`
            : "Como não há categorias preexistentes, crie uma nova categoria apropriada.";

        const exemplosFormatados = exemplosDeCorrecao.map(ex => `- Texto começando com "${ex.texto.substring(0, 50)}..." -> Categoria: "${ex.categoria}"`).join('\n');

        const { promptUsuario } = req.body;

        const promptFinal = `
            Você é um analista de documentos sênior, especializado em extrair informações estruturadas de textos complexos com altíssima precisão.

            Sua Missão:
            Analise o texto fornecido e retorne um objeto JSON com a seguinte estrutura. NÃO inclua nenhuma explicação ou texto fora do objeto JSON.

            Estrutura de Resposta JSON Exigida:
            {
            "categoria": "A categoria mais apropriada em formato Title Case",
            "scoreConfianca": 0.95,
            "metadados": {
                "titulo": "O título principal do documento ou null",
                "autor": "O autor principal, se identificado, ou null",
                "data": "A data mais relevante no formato DD-MM-YYYY ou null",
                "palavrasChave": ["lista", "de", "termos", "relevantes"],
                "resumo": "Um resumo executivo de 2 a 3 frases sobre o propósito do documento."
            }
            }

            Diretrizes e Regras:
            1. Categorização:
            * Atribua a categoria mais específica possível.
            * Use o formato Title Case (Ex: "Contrato de Prestação de Serviços").
            * ${instrucaoCategorias}
            ---
            * **Use estes exemplos de correções humanas como guia principal:**
                ${exemplosFormatados || "Nenhum exemplo de correção disponível."}
            ---
            * Se não houver exemplos de correções, use estes exemplos gerais como guia:
                - Texto sobre aluguel de imóvel -> Categoria: "Contrato de Aluguel"
                - Texto com consumo de energia elétrica -> Categoria: "Fatura de Energia"
                - Texto detalhando a compra de produtos com impostos (ICMS, IPI) -> Categoria: "Nota Fiscal"
                - Documento com atas de uma reunião corporativa -> Categoria: "Ata de Reunião"
                - Texto apresentando resultados financeiros trimestrais de uma empresa -> Categoria: "Relatório Financeiro"

            2. Score de Confiança: Avalie sua certeza sobre a categoria (1.0 = certeza absoluta).

            3. Extração de Metadados:
            * resumo: Deve ser objetivo e capturar a essência do documento.
            * data: Procure a data principal do documento.
            * palavrasChave: Extraia até 5 termos que definam o documento.
            * Se um campo não for encontrado, o valor DEVE ser \`null\`.

            Instrução Adicional do Usuário: "${promptUsuario || "Nenhuma"}"

            ---
            Texto a ser Analisado:
            """
            ${textoParaAnalise}
            """
            `;

        const respostaJson = await invocarBedrock(promptFinal);

        if (respostaJson.categoria) {
            respostaJson.categoria = padronizarCategoria(respostaJson.categoria);
        }

        await atualizarMetadados(doc_uuid, "PROCESSED", respostaJson);

        res.json(respostaJson);

    } catch (error) {
        console.error(`Erro no controller para o doc_uuid: ${doc_uuid}`, error);
        await atualizarMetadados(doc_uuid, "FAILED", { erro: error.message });
        res.status(500).json({ erro: 'Erro ao processar o arquivo com a IA.' });
    }
};

// Controller para corrigir categoria
export const corrigirCategoriaController = async (req, res) => {
    const { doc_uuid, categoriaCorrigida, textoCompleto } = req.body;

    if (!doc_uuid || !categoriaCorrigida) {
        return res.status(400).json({ erro: 'ID do documento e a categoria corrigida são obrigatórios.' });
    }

    try {
        await registrarCorrecaoCategoria(doc_uuid, categoriaCorrigida, textoCompleto || null);
        res.status(200).json({ mensagem: 'Correção registrada com sucesso.' });
    } catch (error) {
        console.error('Erro ao registrar correção:', error);
        res.status(500).json({ erro: 'Falha ao salvar a correção.' });
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