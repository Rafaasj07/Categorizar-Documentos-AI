// Importa os serviços necessários para o processo de categorização.
import { extrairTextoPdfComBiblioteca } from '../services/pdfjsService.js';
import { v4 as uuidv4 } from 'uuid';
import { uploadParaS3 } from '../services/s3Service.js';
import { registrarMetadados, atualizarMetadados, listarCategoriasUnicas } from '../services/dynamoDbService.js';
import { invocarBedrock } from "../services/bedrockService.js";
import { extractTextFromImage } from '../services/ocrService.js';

// --- Funções Auxiliares ---

// Formata uma string de categoria, deixando a primeira letra de cada palavra maiúscula.
const padronizarCategoria = (categoria) => {
    // Retorna "Indefinida" se a categoria for inválida.
    if (!categoria || typeof categoria !== 'string') return "Indefinida";
    // Pega apenas a parte principal da categoria (antes de qualquer '/') e formata.
    const partePrincipal = categoria.split('/')[0].trim();
    return partePrincipal.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

// Define o tamanho máximo de cada pedaço de texto a ser enviado para a IA.
const MAX_CHUNK_SIZE = 15000;

// Divide um texto longo em pedaços (chunks) menores.
function criarChunks(texto) {
    // Se o texto for menor que o limite, retorna o texto inteiro em um array.
    if (!texto || texto.length <= MAX_CHUNK_SIZE) return [texto || ''];
    // Cria os pedaços de texto e os armazena em um array.
    const chunks = [];
    for (let i = 0; i < texto.length; i += MAX_CHUNK_SIZE) {
        chunks.push(texto.substring(i, i + MAX_CHUNK_SIZE));
    }
    return chunks;
}

// Remove linhas de texto duplicadas de um array.
function removerLinhasDuplicadas(linhas) {
    // Verifica se a entrada é um array válido para evitar erros.
    if (!Array.isArray(linhas)) {
        console.error('CRÍTICO: A função removerLinhasDuplicadas recebeu um valor que não é um array.');
        return []; // Retorna um array vazio para não quebrar a aplicação.
    }
    const vistos = new Set(); // Armazena as linhas já vistas para evitar duplicatas.
    const resultado = [];
    for (const linha of linhas) {
        const linhaStr = String(linha || '').trim(); // Garante que a linha seja uma string.
        if (linhaStr) {
            const linhaNormalizada = linhaStr.toLowerCase(); // Compara em minúsculas para ser mais preciso.
            if (!vistos.has(linhaNormalizada)) {
                vistos.add(linhaNormalizada);
                resultado.push(linhaStr);
            }
        }
    }
    return resultado;
}

// --- Controller Principal ---

// Função principal que orquestra todo o processo de categorização de um arquivo.
export const categorizarComArquivo = async (req, res) => {
    // Gera um ID único para o documento.
    const doc_uuid = uuidv4();
    try {
        // Valida se um arquivo foi realmente enviado.
        if (!req.file) {
            return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
        }

        // 1. Envia o arquivo para o armazenamento na nuvem (S3).
        const { s3Key, bucketName } = await uploadParaS3(req.file.buffer, req.file.originalname);
        console.log(`Arquivo salvo no S3 com a chave: ${s3Key}`);

        // 2. Prepara e salva os metadados iniciais do documento no banco de dados (DynamoDB).
        const metadadosIniciais = { doc_uuid, s3Key, bucketName, fileName: req.file.originalname, fileSize: req.file.size, contentType: req.file.mimetype, userId: "user-placeholder-id", uploadedTimeStamp: new Date().toISOString(), status: "UPLOADED" };
        await registrarMetadados(metadadosIniciais);

        // 3. Inicia a extração de conteúdo do arquivo PDF.
        console.log("Iniciando extração de texto do PDF...");
        const extracaoPorPagina = await extrairTextoPdfComBiblioteca(req.file.buffer);

        // 4. Junta o texto de todas as páginas e imagens em um só lugar.
        let textoConsolidadoArray = [];
        for (const pagina of extracaoPorPagina) {
            console.log(`- Processando Página ${pagina.pageNumber}/${extracaoPorPagina.length}...`);
            // Adiciona o texto embutido no PDF.
            if (pagina.embeddedText) {
                textoConsolidadoArray.push(pagina.embeddedText);
            }
            // Se houver imagens, extrai o texto delas (OCR).
            if (pagina.images && pagina.images.length > 0) {
                for (const imgBuffer of pagina.images) {
                    const textoOcr = await extractTextFromImage(imgBuffer);
                    if (textoOcr) {
                        textoConsolidadoArray.push(textoOcr);
                    }
                }
            }
        }
        console.log("Extração de texto concluída.");

        // 5. Converte o array de textos em uma única string e limpa duplicatas.
        const textoBruto = textoConsolidadoArray.join(' ');
        const linhasDoTexto = textoBruto.split('\n');
        const linhasUnicas = removerLinhasDuplicadas(linhasDoTexto);
        const textosLimpos = linhasUnicas.join(' ');

        // 6. Pega o primeiro pedaço do texto limpo para ser analisado pela IA.
        const chunks = criarChunks(textosLimpos);
        const textoParaAnalise = chunks[0];

        // 7. Monta as instruções (prompt) para a IA, incluindo o texto a ser analisado.
        const { promptUsuario } = req.body;
        const promptFinal = `
        Você é um analista de documentos sênior, especializado em extrair informações estruturadas de textos complexos com altíssima precisão.

        Sua única tarefa é analisar o texto abaixo e retornar um objeto JSON.
        A sua resposta DEVE ser APENAS o objeto JSON, sem nenhum texto, comentário ou explicação adicional.

        Estrutura obrigatória do JSON:
        {
        "categoria": "...",
        "metadados": {
            "titulo": "...",
            "autor": "...",
            "data": "...",
            "palavrasChave": [...],
            "resumo": "..."
        }
        }

        REGRAS CRÍTICAS:
        1. Estrutura Obrigatória: Você DEVE sempre retornar a estrutura JSON completa, incluindo o objeto "metadados" e todos os seus campos.
        2. Tratamento de Campos Vazios: Se você não encontrar informação suficiente no texto para preencher um campo (como "titulo", "autor", "data", "resumo" ou "palavrasChave"), o valor desse campo DEVE ser null (sem aspas). 
        - Se não houver palavras-chave, retorne um array vazio [].
        - NÃO omita nenhum campo.
        3. Categoria:
        - Atribua a categoria mais específica possível.
        - Use Title Case (Ex: "Contrato de Aluguel").
        - Se o texto for muito curto ou sem sentido para definir uma categoria, use "Não Identificado".
        - Exemplos:
            * Texto sobre aluguel de imóvel -> Categoria: "Contrato de Aluguel"
            * Texto com consumo de energia elétrica -> Categoria: "Fatura de Energia"
            * Texto detalhando a compra de produtos com impostos (ICMS, IPI) -> Categoria: "Nota Fiscal"
            * Documento com atas de reunião corporativa -> Categoria: "Ata de Reunião"
            * Texto apresentando resultados financeiros trimestrais de uma empresa -> Categoria: "Relatório Financeiro"
        4. Extração de Metadados:
        - resumo: Deve ser objetivo e capturar a essência do documento.
        - data: Procure a data principal do documento.
        - palavrasChave: Extraia até 5 termos relevantes.
        - Se não encontrar valores, preencha com null (ou [] no caso de palavrasChave).
        5. Instrução do Usuário: Considere esta instrução adicional: "${promptUsuario || "Nenhuma"}".
        6. Ruído e Repetição: O texto pode conter muitas repetições ou ruídos do OCR. Ignore-os e foque na extração do conteúdo principal.

        Exemplo de retorno para um texto de baixa qualidade:
        {
        "categoria": "Não Identificado",
        "metadados": {
            "titulo": null,
            "autor": null,
            "data": null,
            "palavrasChave": [],
            "resumo": "O texto fornecido era muito curto ou de baixa qualidade para permitir uma extração de metadados."
        }
        }

        ---
        Texto a ser Analisado:
        """
        ${textoParaAnalise}
        """
        ---
        Lembre-se: sua resposta final deve ser apenas o JSON.
        `;

        // 8. Envia o prompt para a IA (Bedrock) e aguarda a resposta.
        console.log("Enviando texto para análise do Amazon Bedrock...");
        const respostaJson = await invocarBedrock(promptFinal);

        // 9. Padroniza o nome da categoria recebida da IA.
        if (respostaJson.categoria) {
            respostaJson.categoria = padronizarCategoria(respostaJson.categoria);
        }

        // 10. Atualiza os dados do documento no banco de dados com o resultado da IA.
        await atualizarMetadados(doc_uuid, "PROCESSED", respostaJson);
        console.log("Metadados atualizados com sucesso no DynamoDB.");

        // 11. Retorna a resposta da IA para o frontend.
        res.json(respostaJson);

    } catch (error) {
        // Em caso de erro, registra o problema e atualiza o status do documento para "FAILED".
        console.error(`Erro no controller para o doc_uuid: ${doc_uuid}`, error);
        await atualizarMetadados(doc_uuid, "FAILED", { erro: error.message });
        res.status(500).json({ erro: 'Erro ao processar o arquivo com a IA.' });
    }
};