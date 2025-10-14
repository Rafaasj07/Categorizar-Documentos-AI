import { extrairTextoPdfComBiblioteca } from '../services/pdfjsService.js';
import { v4 as uuidv4 } from 'uuid';
import { uploadParaMinIO } from '../services/minioService.js';
import { registrarMetadados, atualizarMetadados, listarCategoriasUnicas } from '../services/mongoDbService.js';
import { invocarIA } from "../services/openRouterService.js"; // Alterado
import { extractTextFromImage } from '../services/ocrService.js';

// --- Funções Auxiliares para tratar o texto extraído ---

// Garante que o nome da categoria tenha um formato padrão (Ex: "Nota Fiscal").
const padronizarCategoria = (categoria) => {
    if (!categoria || typeof categoria !== 'string') return "Indefinida";
    const partePrincipal = categoria.split('/')[0].trim();
    return partePrincipal.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

// Define um tamanho máximo para os textos enviados à IA.
const MAX_CHUNK_SIZE = 15000;

// Divide textos muito longos em pedaços menores, se necessário.
function criarChunks(texto) {
    if (!texto || texto.length <= MAX_CHUNK_SIZE) return [texto || ''];
    const chunks = [];
    for (let i = 0; i < texto.length; i += MAX_CHUNK_SIZE) {
        chunks.push(texto.substring(i, i + MAX_CHUNK_SIZE));
    }
    return chunks;
}

// Remove linhas de texto duplicadas para limpar os dados antes da análise.
function removerLinhasDuplicadas(linhas) {
    if (!Array.isArray(linhas)) {
        console.error('CRÍTICO: A função removerLinhasDuplicadas recebeu um valor que não é um array.');
        return [];
    }
    const vistos = new Set();
    const resultado = [];
    for (const linha of linhas) {
        const linhaStr = String(linha || '').trim();
        if (linhaStr) {
            const linhaNormalizada = linhaStr.toLowerCase();
            if (!vistos.has(linhaNormalizada)) {
                vistos.add(linhaNormalizada);
                resultado.push(linhaStr);
            }
        }
    }
    return resultado;
}

// --- Controller Principal ---

// Orquestra todo o processo de categorização de um arquivo.
export const categorizarComArquivo = async (req, res) => {
    // Gera um ID único para rastrear o documento durante o processo.
    const doc_uuid = uuidv4();
    try {
        if (!req.file) {
            return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
        }

        // 1. Salva o arquivo no serviço de armazenamento (MinIO).
        const { minioKey, bucketName } = await uploadParaMinIO(req.file.buffer, req.file.originalname);
        console.log(`Arquivo salvo no MinIO com a chave: ${minioKey}`);

        // 2. Salva as informações iniciais do arquivo no banco de dados.
        const metadadosIniciais = {
            doc_uuid,
            minioKey,
            bucketName,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            contentType: req.file.mimetype,
            userId: req.user.id,
            uploadedTimeStamp: new Date(),
            status: "UPLOADED"
        };
        await registrarMetadados(metadadosIniciais);

        // 3. Extrai o conteúdo do PDF, separando texto e imagens.
        console.log("Iniciando extração de texto do PDF...");
        const extracaoPorPagina = await extrairTextoPdfComBiblioteca(req.file.buffer);

        // 4. Processa cada página: junta o texto e usa OCR para ler as imagens.
        let textoConsolidadoArray = [];
        for (const pagina of extracaoPorPagina) {
            console.log(`- Processando Página ${pagina.pageNumber}/${extracaoPorPagina.length}...`);
            if (pagina.embeddedText) {
                textoConsolidadoArray.push(pagina.embeddedText);
            }
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

        // 5. Limpa e prepara o texto final para a IA.
        const textoBruto = textoConsolidadoArray.join(' ');
        const linhasDoTexto = textoBruto.split('\n');
        const linhasUnicas = removerLinhasDuplicadas(linhasDoTexto);
        const textosLimpos = linhasUnicas.join(' ');
        const chunks = criarChunks(textosLimpos);
        const textoParaAnalise = chunks[0];

        // 6. Monta a instrução (prompt) para a IA.
        const { promptUsuario } = req.body;
        console.log("Buscando categorias existentes para o prompt...");
        const categoriasExistentes = await listarCategoriasUnicas();
        let instrucaoCategorias = "Como não há categorias preexistentes, crie uma nova categoria apropriada.";
        if (categoriasExistentes && categoriasExistentes.length > 0) {
            instrucaoCategorias = `Considere fortemente reutilizar uma das seguintes categorias existentes, se aplicável: [${categoriasExistentes.join(', ')}].`;
        }

        // O prompt é uma instrução detalhada que guia a IA para retornar um JSON estruturado.
        const promptFinal = `
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
        - ${instrucaoCategorias} 
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

        // 7. Envia o prompt para o serviço da IA (OpenRouter).
        console.log("Enviando texto para análise da IA...");
        const respostaJson = await invocarIA(promptFinal);

        // 8. Padroniza a categoria recebida da IA.
        if (respostaJson.categoria) {
            respostaJson.categoria = padronizarCategoria(respostaJson.categoria);
        }

        // 9. Atualiza o banco de dados com os resultados da análise.
        await atualizarMetadados(doc_uuid, "PROCESSED", respostaJson);
        console.log("Metadados atualizados com sucesso no MongoDB.");

        // 10. Retorna o JSON com a análise para o frontend.
        res.json(respostaJson);

    } catch (error) {
        // Se qualquer etapa falhar, registra o status de erro no banco.
        console.error(`Erro no controller para o doc_uuid: ${doc_uuid}`, error);
        await atualizarMetadados(doc_uuid, "FAILED", { erro: error.message });
        res.status(500).json({ erro: 'Erro ao processar o arquivo com a IA.' });
    }
};