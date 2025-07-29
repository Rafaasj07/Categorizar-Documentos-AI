// Importa a função que chama o modelo de IA da AWS Bedrock
import { invocarBedrock } from "../services/bedrockService.js";

// Importa a biblioteca para leitura de PDFs
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';

// A linha que configura o 'worker' do pdfjs foi removida intencionalmente
// Isso evita erro no Node.js, já que não há suporte a Web Workers no ambiente de backend

// Função para extrair o texto de um arquivo PDF
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

// Função controller para lidar com o upload do PDF e enviar para a IA categorizar
export const categorizarComArquivo = async (req, res) => {
    try {
        // Verifica se um arquivo foi enviado
        if (!req.file) {
            return res.status(400).json({ erro: 'Nenhum arquivo enviado.' });
        }

        // Extrai o texto do PDF usando a função anterior
        const textoDoPdf = await extrairTextoDoPdf(req.file.buffer);

        // Pega um texto opcional enviado pelo usuário no corpo da requisição
        const { promptUsuario } = req.body;

        // Monta o prompt que será enviado à IA da Bedrock
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

        // Retorna o JSON gerado pela IA como resposta da API
        res.json(respostaJson);

    } catch (error) {
        // Em caso de erro, mostra no console e retorna erro 500 ao cliente
        console.error("Erro no controller:", error);
        res.status(500).json({ erro: 'Erro ao processar o arquivo com a IA.' });
    }
};
