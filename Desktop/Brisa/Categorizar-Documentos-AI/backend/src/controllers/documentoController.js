import { extrairTextoPdfComBiblioteca } from '../services/pdfjsService.js';
import { v4 as uuidv4 } from 'uuid';
import { uploadParaMinIO, apagarDoMinIO } from '../services/minioService.js';
import { registrarMetadados, atualizarMetadados, atualizarApenasMetadadosIA } from '../services/mongoDbService.js';
import { invocarIA } from "../services/openRouterService.js";
import { extractTextFromImage } from '../services/ocrService.js';
import Documento from '../models/Document.js';

import { promptPadrao } from '../prompts/promptPadrao.js';
import { promptNotaFiscal } from '../prompts/promptNotaFiscal.js';
import { promptCartorio } from '../prompts/promptCartorio.js';
import { promptSEI } from '../prompts/promptSEI.js';
import { promptDiploma } from '../prompts/gestaoEducacional/promptDiploma.js';
import { promptHistoricoEscolar } from '../prompts/gestaoEducacional/promptHistoricoEscolar.js';
import { promptAtaResultados } from '../prompts/gestaoEducacional/promptAtaResultados.js';
import { promptCertificado } from '../prompts/gestaoEducacional/promptCertificado.js';
import { promptPlanoEnsino } from '../prompts/gestaoEducacional/promptPlanoEnsino.js';
import { promptRegimentoInterno } from '../prompts/gestaoEducacional/promptRegimentoInterno.js';
import { promptPortariaAto } from '../prompts/gestaoEducacional/promptPortariaAto.js';
import { promptRegistroMatricula } from '../prompts/gestaoEducacional/promptRegistroMatricula.js';
import { promptDocEducacionalGenerico } from '../prompts/gestaoEducacional/promptDocEducacionalGenerico.js';

// Formata a string da categoria (Ex: "nota fiscal" -> "Nota Fiscal").
const padronizarCategoria = (categoria) => {
    if (!categoria || typeof categoria !== 'string') return "Indefinida";
    const partePrincipal = categoria.split(/[\/(]/)[0].trim();
    return partePrincipal.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
        .replace(/[^a-zA-Z0-9\sáéíóúâêîôûàèìòùãõçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ]+$/, '').trim();
};

const MAX_CHUNK_SIZE = 15000;

// Divide um texto longo em pedaços (chunks) de tamanho fixo.
function criarChunks(texto) {
    if (!texto || texto.length <= MAX_CHUNK_SIZE) return [texto || ''];
    const chunks = [];
    for (let i = 0; i < texto.length; i += MAX_CHUNK_SIZE) {
        chunks.push(texto.substring(i, i + MAX_CHUNK_SIZE));
    }
    console.log(`Texto dividido em ${chunks.length} chunks.`);
    return chunks;
}

// Remove linhas duplicadas ou vazias de um array de strings.
function removerLinhasDuplicadas(linhas) {
    if (!Array.isArray(linhas)) return [];
    const vistos = new Set();
    const resultado = [];
    for (const linha of linhas) {
        const linhaStr = String(linha || '').trim();
        // Lógica para normalizar e verificar duplicatas
        if (linhaStr && linhaStr.length > 1) {
            const linhaNormalizada = linhaStr.toLowerCase().replace(/\s+/g, ' ');
            if (!vistos.has(linhaNormalizada)) {
                vistos.add(linhaNormalizada);
                resultado.push(linhaStr);
            }
        }
    }
    return resultado;
}

/**
 * Processa o upload de um arquivo, extrai texto (PDF + OCR),
 * envia para IA para categorização e salva o resultado.
 */
export const categorizarComArquivo = async (req, res) => {
    const doc_uuid = uuidv4();
    let minioInfo = null; 

    try {
        // Valida se um arquivo foi realmente enviado na requisição.
        if (!req.file) {
            return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
        }

        const { contextoSelecionado, subContextoSelecionado, promptUsuario } = req.body;
        const instrucaoUsuario = promptUsuario || "Nenhuma";

        let originalFilenameUtf8 = req.file.originalname;
        // Tenta corrigir problemas de encoding no nome original do arquivo (Latin1 -> UTF-8).
        try {
            const regexEncodingIncorreto = /[ÃÂ][\u0080-\u00FF]/u; 
            
            // Detecta e corrige encoding Latin1 para UTF-8 no nome do arquivo.
            if (regexEncodingIncorreto.test(originalFilenameUtf8)) {
                console.log(`[${doc_uuid}] Encoding incorreto detectado: ${originalFilenameUtf8}`);
                originalFilenameUtf8 = Buffer.from(originalFilenameUtf8, 'latin1').toString('utf-8');
                console.log(`[${doc_uuid}] Nome corrigido: ${originalFilenameUtf8}`);
            }
        } catch (encError) {
            console.warn(`[${doc_uuid}] Falha ao corrigir encoding: ${encError.message}`);
            originalFilenameUtf8 = req.file.originalname; 
        }
        
        // 1. Envia o buffer do arquivo para o MinIO (storage).
        minioInfo = await uploadParaMinIO(req.file.buffer, originalFilenameUtf8); 
        console.log(`[${doc_uuid}] Arquivo salvo no MinIO: ${minioInfo.minioKey}`);

        // 2. Cria um registro inicial para o documento no MongoDB.
        const metadadosIniciais = {
            doc_uuid, minioKey: minioInfo.minioKey, bucketName: minioInfo.bucketName,
            fileName: originalFilenameUtf8, 
            fileSize: req.file.size, contentType: req.file.mimetype, userId: req.user.id,
            uploadedTimeStamp: new Date(), status: "UPLOADED"
        };
        await registrarMetadados(metadadosIniciais);
        console.log(`[${doc_uuid}] Metadados iniciais registrados.`);

        // Define o status do documento como "em processamento".
        await atualizarMetadados(doc_uuid, "PROCESSING", null);

        // 3. Extrai texto e imagens (por página) do buffer do PDF.
        console.log(`[${doc_uuid}] Extraindo conteúdo do PDF...`);
        const extracaoPorPagina = await extrairTextoPdfComBiblioteca(req.file.buffer);
        console.log(`[${doc_uuid}] Extração PDF concluída (${extracaoPorPagina.length} pág).`);

        let textoConsolidadoArray = [];
        let contadorImagens = 0;
        
        // 4. Itera sobre as páginas para processar imagens com OCR.
        for (const pagina of extracaoPorPagina) {
            if (pagina.embeddedText) textoConsolidadoArray.push(pagina.embeddedText);
            
            // Verifica se a página contém imagens para OCR.
            if (pagina.images && pagina.images.length > 0) {
                contadorImagens += pagina.images.length;
                for (const imgBuffer of pagina.images) {
                    try {
                        // Extrai texto da imagem usando OCR.
                        const textoOcr = await extractTextFromImage(imgBuffer);
                        if (textoOcr) textoConsolidadoArray.push(textoOcr);
                    } catch (ocrError) {
                        console.error(`[${doc_uuid}] Erro OCR pág ${pagina.pageNumber}: ${ocrError.message}`);
                    }
                }
            }
        }
        console.log(`[${doc_uuid}] OCR concluído (${contadorImagens} imagens).`);

        // 5. Limpa e consolida o texto extraído (PDF + OCR).
        const textoBruto = textoConsolidadoArray.join('\n');
        const linhasUnicas = removerLinhasDuplicadas(textoBruto.split('\n'));
        const textosLimpos = linhasUnicas.join('\n');
        
        // Divide o texto em chunks, caso seja muito longo.
        const chunks = criarChunks(textosLimpos);
        const textoParaAnalise = chunks[0]; 
        console.log(`[${doc_uuid}] Texto preparado (${textoParaAnalise.length} chars).`);

       // Se o texto for muito curto, define como "Não Identificado" e encerra.
        if (!textoParaAnalise || textoParaAnalise.length < 10) {
            console.warn(`[${doc_uuid}] Texto muito curto. Classificando como 'Não Identificado'.`);
            
            const resultadoPadrao = { 
                categoria: "Não Identificado",
                metadados: { 
                    resumo_geral_ia: "Texto extraído insuficiente para análise." 
                }
            };
            
            // Atualiza o DB com o resultado padrão.
            await atualizarMetadados(doc_uuid, "PROCESSED", resultadoPadrao);

            const responseData = {
                ...metadadosIniciais,
                resultadoIa: resultadoPadrao,
                status: "PROCESSED"
            };
            return res.json(responseData);
        }

        // 6. Seleciona o prompt da IA baseado no contexto/subcontexto da requisição.
        console.log(`[${doc_uuid}] Contexto: ${contextoSelecionado || 'Padrão'}${subContextoSelecionado ? ` / ${subContextoSelecionado}` : ''}`);
        let promptBase;
        let categoriasExistentes = []; 

        // Lógica de seleção de prompt com base no contexto.
        if (contextoSelecionado === 'Gestão Educacional') {
            // Seleciona prompt específico para Gestão Educacional.
            switch (subContextoSelecionado) { 
                case 'Diploma': promptBase = promptDiploma; break;
                case 'Histórico Escolar': promptBase = promptHistoricoEscolar; break;
                case 'Ata de Resultados': promptBase = promptAtaResultados; break;
                case 'Certificado': promptBase = promptCertificado; break;
                case 'Plano de Ensino': promptBase = promptPlanoEnsino; break;
                case 'Regimento Interno': promptBase = promptRegimentoInterno; break;
                case 'Portaria ou Ato': promptBase = promptPortariaAto; break;
                case 'Registro de Matrícula': promptBase = promptRegistroMatricula; break;
                default: promptBase = promptDocEducacionalGenerico; break; 
            }
        } else { 
            // Lógica para contextos gerais.
            switch (contextoSelecionado) {
                case 'Nota Fiscal': promptBase = promptNotaFiscal; break;
                case 'Cartório': promptBase = promptCartorio; break;
                case 'SEI': promptBase = promptSEI; break;
                case 'Padrão':
                default: 
                    try {
                        // Busca categorias únicas para usar no prompt Padrão.
                        categoriasExistentes = await Documento.distinct('resultadoIa.categoria').exec();
                        categoriasExistentes = categoriasExistentes.filter(c => c && c !== 'Indefinida' && c !== 'Não Identificado');
                    } catch (dbError) { /* Log erro */ }
                    promptBase = promptPadrao;
                    break;
            }
        }

        // Monta o prompt final injetando o texto e instruções do usuário.
        const promptFinal = typeof promptBase === 'function' 
            ? promptBase.replace(/\$\{promptUsuario\}/g, instrucaoUsuario).replace(/\$\{categoriasExistentes\}/g, JSON.stringify(categoriasExistentes)).replace(/\$\{textoParaAnalise\}/g, textoParaAnalise)
            : promptBase.replace(/\$\{promptUsuario\}/g, instrucaoUsuario).replace(/\$\{textoParaAnalise\}/g, textoParaAnalise);

        // 7. Envia o prompt final para o serviço da IA.
        console.log(`[${doc_uuid}] Enviando para análise da IA...`);
        const respostaJson = await invocarIA(promptFinal);
        console.log(`[${doc_uuid}] Resposta da IA recebida.`);

        // 8. Padroniza a string da categoria retornada pela IA.
        if (respostaJson && respostaJson.categoria) {
            respostaJson.categoria = padronizarCategoria(respostaJson.categoria);
            console.log(`[${doc_uuid}] Categoria padronizada: ${respostaJson.categoria}`);
        } else { 
            // Se a IA falhar em retornar uma categoria, define como "Indefinida".
            console.warn(`[${doc_uuid}] Categoria não retornada pela IA. Usando 'Indefinida'.`);
            if (!respostaJson) respostaJson = { metadados: {} };
            respostaJson.categoria = "Indefinida";
            if (!respostaJson.metadados) respostaJson.metadados = {};
            respostaJson.metadados.resumo_geral_ia = respostaJson.metadados.resumo_geral_ia || "A IA não determinou a categoria.";
        }

        // 9. Atualiza o MongoDB com o status "PROCESSED" e os resultados da IA.
        await atualizarMetadados(doc_uuid, "PROCESSED", respostaJson);
        console.log(`[${doc_uuid}] Metadados atualizados como PROCESSED.`);

        // 10. Retorna o JSON da IA para o cliente.
        const responseData = {
            ...metadadosIniciais,
            resultadoIa: respostaJson,
            status: "PROCESSED"
        };
        res.json(responseData); 

    } catch (error) { // Tratamento principal de erros do processo
        console.error(`[${doc_uuid}] Erro GERAL no controller: ${error.message}`);
        // Tenta marcar o documento como "FAILED" no DB
        try { await atualizarMetadados(doc_uuid, "FAILED", { erro: error.message || "Erro desconhecido." }); } catch (dbError) { /* Log erro crítico */ }
        
        // Se o upload no MinIO ocorreu, tenta reverter (apagar o arquivo).
        if (minioInfo) { try { await apagarDoMinIO(minioInfo.bucketName, minioInfo.minioKey); } catch (minioError) { /* Log erro MinIO */ } }
        
        // Retorna erro 500 (Internal Server Error) para o cliente.
        res.status(500).json({ erro: `Erro ao processar o arquivo: ${error.message || 'Erro interno.'}` });
    }
};

/**
 * Controller (Admin) para atualizar manualmente os metadados (resultadoIa) de um documento.
 */
export const atualizarMetadadosController = async (req, res) => {
    const { doc_uuid } = req.params;
    const { novoResultadoIa } = req.body; 

    try {
        // Valida se os dados necessários foram enviados.
        if (!novoResultadoIa) {
            return res.status(400).json({ erro: 'Dados de metadados ausentes.' });
        }

        // Chama o serviço que atualiza apenas o campo 'resultadoIa'.
        await atualizarApenasMetadadosIA(doc_uuid, novoResultadoIa);
        
        console.log(`[${doc_uuid}] Metadados atualizados manualmente pelo Admin.`);
        res.status(200).json({ mensagem: 'Metadados atualizados com sucesso.' });
        
    } catch (error) {
        // Tratamento de erro geral do controller.
        console.error(`[${doc_uuid}] Erro GERAL no controller de atualização: ${error.message}`);
        res.status(500).json({ erro: `Erro ao atualizar metadados: ${error.message}` });
    }
};