import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';

// Função auxiliar para criar uma pequena pausa.
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Função principal para extrair o conteúdo de um arquivo PDF.
export async function extrairTextoPdfComBiblioteca(dataBuffer) {
    const uint8Array = new Uint8Array(dataBuffer);

    // Carrega o documento PDF a partir dos dados do arquivo.
    const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        standardFontDataUrl: './node_modules/pdfjs-dist/standard_fonts/',
    });

    const doc = await loadingTask.promise;
    const pagesData = [];

    // Itera sobre cada página do documento.
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        let embeddedText = '';
        let images = [];

        // Tenta extrair o texto que já está em formato de texto no PDF.
        try {
            const textContent = await page.getTextContent();
            embeddedText = textContent?.items?.map(item => item.str).join(' ') || '';
        } catch (error) {
            console.warn(`Aviso: Falha ao extrair texto embutido da página ${i}.`);
        }

        // Tenta encontrar e extrair as imagens da página.
        try {
            const operatorList = await page.getOperatorList();
            const imageKeys = new Set();

            // Percorre as operações de renderização da página em busca de imagens.
            for (let j = 0; j < operatorList.fnArray.length; j++) {
                if (operatorList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
                    const key = operatorList.argsArray[j][0];
                    if (key && !imageKeys.has(key)) {
                        imageKeys.add(key);

                        // Processa os dados da imagem encontrada.
                        try {
                            let imgData;
                            try {
                                imgData = await page.objs.get(key);
                            } catch (e) {
                                // Tenta novamente após uma pequena pausa se a imagem ainda não carregou.
                                if (e.message.includes("resolved yet")) {
                                    await sleep(150);
                                    imgData = await page.objs.get(key);
                                } else {
                                    continue;
                                }
                            }

                            // Se a imagem for válida, converte-a para o formato PNG.
                            if (imgData && imgData.data) {
                                const canvas = createCanvas(imgData.width, imgData.height);
                                const ctx = canvas.getContext('2d');
                                const imageData = ctx.createImageData(imgData.width, imgData.height);
                                imageData.data.set(imgData.data);
                                ctx.putImageData(imageData, 0, 0);
                                images.push(canvas.toBuffer('image/png'));
                            }
                        } catch (e) {
                            console.warn(`Aviso: Não foi possível processar a imagem '${key}' na página ${i} após nova tentativa.`);
                        }
                    }
                }
            }
        } catch (error) {
            console.warn(`Aviso: Falha ao extrair a lista de imagens da página ${i}.`);
        }

        // Armazena o texto e as imagens extraídas da página.
        pagesData.push({
            pageNumber: i,
            embeddedText,
            images,
        });
    }

    // Retorna os dados de todas as páginas.
    return pagesData;
}