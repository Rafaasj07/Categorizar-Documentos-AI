import tesseract from "node-tesseract-ocr"

// Configurações para o Tesseract, definindo o idioma como português.
const config = {
  lang: "por",
  oem: 3,
  psm: 3,
}

// Função que recebe uma imagem e retorna o texto contido nela.
export async function extractTextFromImage(imageBuffer) {
  console.log("[OCR] Processando imagem com Tesseract...");
  try {
    // Usa a biblioteca para reconhecer o texto na imagem.
    const text = await tesseract.recognize(imageBuffer, config)
    console.log("[OCR] Sucesso: Texto extraído.")
    // Retorna o texto extraído, removendo espaços extras.
    return text.trim();
  } catch (error) {
    // Em caso de falha, registra o erro e lança uma exceção.
    console.error(`[OCR] Falha ao processar a imagem com Tesseract: ${error.message}`)
    throw new Error("Falha no serviço de OCR ao processar a imagem.");
  }
}