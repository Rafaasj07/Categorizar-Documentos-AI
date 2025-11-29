import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import { createCanvas } from 'canvas';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Processa buffer PDF extraindo texto e imagens de cada página
export async function extrairTextoPdfComBiblioteca(dataBuffer) {
    const uint8Array = new Uint8Array(dataBuffer);

    // Carrega documento PDF definindo caminho para fontes padrão
    const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        standardFontDataUrl: './node_modules/pdfjs-dist/standard_fonts/',
    });

    const doc = await loadingTask.promise;
    const pagesData = [];

    // Itera por todas as páginas do documento para extração
    for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        let embeddedText = '';
        let images = [];

        // Tenta extrair conteúdo textual da camada da página
        try {
            const textContent = await page.getTextContent();
            embeddedText = textContent?.items?.map(item => item.str).join(' ') || '';
        } catch (error) {
            console.warn(`Aviso: Falha ao extrair texto embutido da página ${i}.`);
        }

        // Busca lista de operadores para identificar imagens renderizadas
        try {
            const operatorList = await page.getOperatorList();
            const imageKeys = new Set();

            // Percorre operações gráficas filtrando objetos de imagem
            for (let j = 0; j < operatorList.fnArray.length; j++) {
                if (operatorList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
                    const key = operatorList.argsArray[j][0];
                    if (key && !imageKeys.has(key)) {
                        imageKeys.add(key);

                        try {
                            let imgData;
                            // Tenta obter objeto da imagem com retry para carregamento assíncrono
                            try {
                                imgData = await page.objs.get(key);
                            } catch (e) {
                                if (e.message.includes("resolved yet")) {
                                    await sleep(150);
                                    imgData = await page.objs.get(key);
                                } else {
                                    continue;
                                }
                            }

                            // Converte dados de pixel para PNG usando Canvas
                            if (imgData && imgData.data) {
                                const width = imgData.width;
                                const height = imgData.height;

                                const canvas = createCanvas(width, height);
                                const ctx = canvas.getContext('2d');
                                const imageData = ctx.createImageData(width, height);

                                // Ajusta os canais de cor para garantir formato RGBA compatível com o Canvas
                                const srcData = imgData.data;
                                const destData = imageData.data;

                                if (srcData.length === width * height * 4) {
                                    destData.set(srcData);
                                } else if (srcData.length === width * height * 3) {
                                    for (let k = 0, j = 0; k < srcData.length; k += 3, j += 4) {
                                        destData[j] = srcData[k];
                                        destData[j + 1] = srcData[k + 1];
                                        destData[j + 2] = srcData[k + 2];
                                        destData[j + 3] = 255;
                                    }
                                } else if (srcData.length === width * height) {
                                    for (let k = 0, j = 0; k < srcData.length; k++, j += 4) {
                                        destData[j] = srcData[k];
                                        destData[j + 1] = srcData[k];
                                        destData[j + 2] = srcData[k];
                                        destData[j + 3] = 255;
                                    }
                                }
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

        pagesData.push({
            pageNumber: i,
            embeddedText,
            images,
        });
    }

    return pagesData;
}