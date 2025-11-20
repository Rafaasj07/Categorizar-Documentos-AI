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

// Normaliza a string de categoria removendo caracteres especiais e formatando capitulação
const padronizarCategoria = (categoria) => {
    if (!categoria || typeof categoria !== 'string') return "Indefinida";
    const partePrincipal = categoria.split(/[\/(]/)[0].trim();
    return partePrincipal.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase())
        .replace(/[^a-zA-Z0-9\sáéíóúâêîôûàèìòùãõçÁÉÍÓÚÂÊÎÔÛÀÈÌÒÙÃÕÇ]+$/, '').trim();
};

const MAX_CHUNK_SIZE = 15000;

// Divide strings longas em pedaços menores baseados no tamanho máximo permitido
function criarChunks(texto) {
    if (!texto || texto.length <= MAX_CHUNK_SIZE) return [texto || ''];
    const chunks = [];
    for (let i = 0; i < texto.length; i += MAX_CHUNK_SIZE) {
        chunks.push(texto.substring(i, i + MAX_CHUNK_SIZE));
    }
    return chunks;
}

// Filtra o array de strings removendo entradas duplicadas ou vazias
function removerLinhasDuplicadas(linhas) {
    if (!Array.isArray(linhas)) return [];
    const vistos = new Set();
    const resultado = [];
    for (const linha of linhas) {
        const linhaStr = String(linha || '').trim();
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

// Processa upload de arquivo, extrai texto (OCR/PDF), envia para IA e salva resultados
export const categorizarComArquivo = async (req, res) => {
    const doc_uuid = uuidv4();
    let minioInfo = null; 

    try {
        if (!req.file) {
            return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
        }

        const { contextoSelecionado, subContextoSelecionado, promptUsuario } = req.body;
        const instrucaoUsuario = promptUsuario || "Nenhuma";
        let originalFilenameUtf8 = req.file.originalname;

        // Corrige codificação do nome do arquivo de Latin1 para UTF-8 se necessário
        try {
            const regexEncodingIncorreto = /[ÃÂ][\u0080-\u00FF]/u; 
            if (regexEncodingIncorreto.test(originalFilenameUtf8)) {
                originalFilenameUtf8 = Buffer.from(originalFilenameUtf8, 'latin1').toString('utf-8');
            }
        } catch (encError) {
            originalFilenameUtf8 = req.file.originalname; 
        }
        
        // Realiza upload para o MinIO e registra metadados iniciais no MongoDB
        minioInfo = await uploadParaMinIO(req.file.buffer, originalFilenameUtf8); 

        const metadadosIniciais = {
            doc_uuid, minioKey: minioInfo.minioKey, bucketName: minioInfo.bucketName,
            fileName: originalFilenameUtf8, 
            fileSize: req.file.size, contentType: req.file.mimetype, userId: req.user.id,
            uploadedTimeStamp: new Date(), status: "UPLOADED"
        };
        await registrarMetadados(metadadosIniciais);
        await atualizarMetadados(doc_uuid, "PROCESSING", null);

        // Extrai texto e imagens do PDF processado
        const extracaoPorPagina = await extrairTextoPdfComBiblioteca(req.file.buffer);

        let textoConsolidadoArray = [];
        let tamanhoTextoAtual = 0; 
        
        // Itera sobre páginas acumulando texto e executando OCR em imagens se necessário
        for (const pagina of extracaoPorPagina) {
            if (pagina.embeddedText) {
                textoConsolidadoArray.push(pagina.embeddedText);
                tamanhoTextoAtual += pagina.embeddedText.length;
            }
            
            if (tamanhoTextoAtual > MAX_CHUNK_SIZE) break; 

            if (pagina.images && pagina.images.length > 0) {
                for (const imgBuffer of pagina.images) {
                    try {
                        const textoOcr = await extractTextFromImage(imgBuffer);
                        if (textoOcr) {
                            textoConsolidadoArray.push(textoOcr);
                            tamanhoTextoAtual += textoOcr.length;
                        }
                        if (tamanhoTextoAtual > MAX_CHUNK_SIZE) break;
                    } catch (ocrError) {
                        console.error(`Erro OCR pág ${pagina.pageNumber}: ${ocrError.message}`);
                    }
                }
            }
            if (tamanhoTextoAtual > MAX_CHUNK_SIZE) break;
        }

        // Consolida texto extraído e remove duplicatas para limpeza
        const textoBruto = textoConsolidadoArray.join('\n');
        const linhasUnicas = removerLinhasDuplicadas(textoBruto.split('\n'));
        const textosLimpos = linhasUnicas.join('\n');
        
        let textoParaAnalise = textosLimpos;

        // Aplica estratégia de corte para textos muito longos (início + fim) para otimizar tokenização
        if (textosLimpos.length > MAX_CHUNK_SIZE) {
            const inicio = textosLimpos.substring(0, 10000);
            const fim = textosLimpos.substring(textosLimpos.length - 5000);
            textoParaAnalise = `${inicio}\n\n... [CONTEÚDO CENTRAL EXTENSO OMITIDO PARA OTIMIZAÇÃO] ...\n\n${fim}`;
        }

       // Retorna erro se o texto extraído for insuficiente para análise
        if (!textoParaAnalise || textoParaAnalise.length < 10) {
            const resultadoPadrao = { 
                categoria: "Não Identificado",
                metadados: { resumo_geral_ia: "Texto extraído insuficiente para análise." }
            };
            await atualizarMetadados(doc_uuid, "PROCESSED", resultadoPadrao);
            return res.json({ ...metadadosIniciais, resultadoIa: resultadoPadrao, status: "PROCESSED" });
        }

        // Seleciona o prompt adequado baseando-se no contexto e subcontexto informados
        let promptBase;
        let categoriasExistentes = []; 

        if (contextoSelecionado === 'Gestão Educacional') {
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
            switch (contextoSelecionado) {
                case 'Nota Fiscal': promptBase = promptNotaFiscal; break;
                case 'Cartório': promptBase = promptCartorio; break;
                case 'SEI': promptBase = promptSEI; break;
                case 'Padrão':
                default: 
                    try {
                        categoriasExistentes = await Documento.distinct('resultadoIa.categoria').exec();
                        categoriasExistentes = categoriasExistentes.filter(c => c && c !== 'Indefinida' && c !== 'Não Identificado');
                    } catch (dbError) {}
                    promptBase = promptPadrao;
                    break;
            }
        }

        // Monta o prompt final com variáveis e invoca o serviço de IA
        const promptFinal = typeof promptBase === 'function' 
            ? promptBase.replace(/\$\{promptUsuario\}/g, instrucaoUsuario).replace(/\$\{categoriasExistentes\}/g, JSON.stringify(categoriasExistentes)).replace(/\$\{textoParaAnalise\}/g, textoParaAnalise)
            : promptBase.replace(/\$\{promptUsuario\}/g, instrucaoUsuario).replace(/\$\{textoParaAnalise\}/g, textoParaAnalise);

        const respostaJson = await invocarIA(promptFinal);

        // Padroniza a resposta da IA e trata casos de falha na categorização
        if (respostaJson && respostaJson.categoria) {
            respostaJson.categoria = padronizarCategoria(respostaJson.categoria);
        } else { 
            if (!respostaJson) respostaJson = { metadados: {} };
            respostaJson.categoria = "Indefinida";
            if (!respostaJson.metadados) respostaJson.metadados = {};
            respostaJson.metadados.resumo_geral_ia = respostaJson.metadados.resumo_geral_ia || "A IA não determinou a categoria.";
        }

        await atualizarMetadados(doc_uuid, "PROCESSED", respostaJson);

        res.json({
            ...metadadosIniciais,
            resultadoIa: respostaJson,
            status: "PROCESSED"
        }); 

    } catch (error) {
        // Em caso de erro, remove o arquivo do MinIO e atualiza status para falha
        try { await atualizarMetadados(doc_uuid, "FAILED", { erro: error.message || "Erro desconhecido." }); } catch (dbError) {}
        if (minioInfo) { try { await apagarDoMinIO(minioInfo.bucketName, minioInfo.minioKey); } catch (minioError) {} }
        res.status(500).json({ erro: `Erro ao processar o arquivo: ${error.message || 'Erro interno.'}` });
    }
};

// Endpoint administrativo para atualização manual dos metadados da IA
export const atualizarMetadadosController = async (req, res) => {
    const { doc_uuid } = req.params;
    const { novoResultadoIa } = req.body; 

    try {
        if (!novoResultadoIa) return res.status(400).json({ erro: 'Dados de metadados ausentes.' });
        await atualizarApenasMetadadosIA(doc_uuid, novoResultadoIa);
        res.status(200).json({ mensagem: 'Metadados atualizados com sucesso.' });
    } catch (error) {
        res.status(500).json({ erro: `Erro ao atualizar metadados: ${error.message}` });
    }
};