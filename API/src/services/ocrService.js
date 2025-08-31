import { TextractClient, DetectDocumentTextCommand } from "@aws-sdk/client-textract";

const textractClient = new TextractClient({ region: process.env.AWS_REGION });

// Função de alto nível para extrair texto de uma imagem.
export async function extractTextFromImage(imageBuffer) {
    return await extractTextWithTextract(imageBuffer);
}

/**
 * Função interna que chama o AWS Textract e trata a resposta.
 * @param {Buffer} imageBuffer - Buffer da imagem a ser analisada.
 * @returns {Promise<string>} O texto extraído da imagem.
 */
async function extractTextWithTextract(imageBuffer) {
    // Inicia o log indicando o começo do processo de OCR.
    console.log("[OCR] Processando imagem com AWS Textract...");
    try {
        const command = new DetectDocumentTextCommand({
            Document: {
                Bytes: imageBuffer,
            },
        });

        // Envia a requisição para a API do Textract.
        const response = await textractClient.send(command);
        
        // Filtra os blocos de resposta para obter apenas as linhas de texto.
        const lines = response.Blocks.filter(block => block.BlockType === 'LINE');

        if (lines.length > 0) {
            // Junta todas as linhas de texto em uma única string.
            const extractedText = lines.map(line => line.Text).join(' ');
            console.log(`[OCR] Sucesso: Texto extraído.`);
            return extractedText;
        }

        // Se nenhuma linha for encontrada, informa no log.
        console.log("[OCR] Nenhum texto detectado na imagem.");
        return "";

    } catch (error) {
        // Log de erro mais limpo, focando na mensagem principal.
        console.error(`[OCR] Falha ao processar a imagem: ${error.name}`);
        // Propaga o erro para ser tratado no controller.
        throw new Error("Falha no serviço de OCR ao processar a imagem.");
    }
}