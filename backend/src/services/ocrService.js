import tesseract from "node-tesseract-ocr"

// Define configurações do Tesseract (idioma português e modos de engine)
const config = {
  lang: "por",
  oem: 3,
  psm: 3,
}

// Extrai texto de imagem via OCR retornando string limpa
export async function extractTextFromImage(imageBuffer) {
  try {
    // Executa reconhecimento de caracteres utilizando a configuração definida
    const text = await tesseract.recognize(imageBuffer, config)
    return text.trim();
  } catch (error) {
    console.error(`[OCR] Falha ao processar a imagem com Tesseract: ${error.message}`)
    throw new Error("Falha no serviço de OCR ao processar a imagem.");
  }
}