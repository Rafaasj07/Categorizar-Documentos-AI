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

        pagesData.push({
            pageNumber: i,
            embeddedText,
            images,
        });
    }

    return pagesData;
}