// Importa a biblioteca principal para manipulação de arquivos PDF.
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
// Importa a biblioteca 'canvas' para renderizar as imagens do PDF em um ambiente Node.js.
import { createCanvas } from 'canvas';

// Cria uma função que pausa a execução por um determinado tempo (em milissegundos).
// É útil para aguardar o carregamento de recursos do PDF.
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Extrai o texto e as imagens de cada página de um arquivo PDF.
 * @param {Buffer} dataBuffer - O conteúdo do PDF em formato de buffer.
 * @returns {Promise<Array<Object>>} Uma lista de objetos, onde cada objeto contém os dados de uma página.
 */
export async function extrairTextoPdfComBiblioteca(dataBuffer) {
    // Converte o buffer de dados do PDF para um formato que a biblioteca pdf.js entende.
    const uint8Array = new Uint8Array(dataBuffer);

    // Inicia o carregamento do documento PDF a partir dos dados fornecidos.
    const loadingTask = pdfjsLib.getDocument({
        data: uint8Array,
        // Define o caminho para as fontes padrão, necessário para a renderização correta do texto.
        standardFontDataUrl: './node_modules/pdfjs-dist/standard_fonts/',
    });

    // Aguarda o documento ser completamente carregado e obtém o objeto do documento.
    const doc = await loadingTask.promise;
    // Cria um array vazio para armazenar os dados de cada página.
    const pagesData = [];

    // Itera sobre cada página do documento.
    for (let i = 1; i <= doc.numPages; i++) {
        // Obtém o objeto da página atual.
        const page = await doc.getPage(i);
        // Inicializa as variáveis para armazenar o texto e as imagens da página.
        let embeddedText = '';
        let images = [];

        // Tenta extrair o texto embutido no PDF.
        try {
            // Pega todo o conteúdo de texto da página.
            const textContent = await page.getTextContent();
            // Junta todos os pedaços de texto em uma única string.
            embeddedText = textContent?.items?.map(item => item.str).join(' ') || '';
        } catch (error) {
            // Se falhar, exibe um aviso no console e continua o processo.
            console.warn(`Aviso: Falha ao extrair texto embutido da página ${i}.`);
        }

        // Tenta extrair as imagens do PDF.
        try {
            // Pega a lista de operações de renderização da página, que inclui as imagens.
            const operatorList = await page.getOperatorList();
            // Usa um Set para garantir que cada imagem seja processada apenas uma vez.
            const imageKeys = new Set();

            // Itera sobre todas as operações de renderização.
            for (let j = 0; j < operatorList.fnArray.length; j++) {
                // Verifica se a operação atual é para desenhar uma imagem.
                if (operatorList.fnArray[j] === pdfjsLib.OPS.paintImageXObject) {
                    // Pega a chave (ID) da imagem.
                    const key = operatorList.argsArray[j][0];
                    // Se a imagem ainda não foi processada, continua.
                    if (key && !imageKeys.has(key)) {
                        imageKeys.add(key);

                        // Tenta processar e converter a imagem.
                        try {
                            let imgData;
                            try {
                                // Tenta obter os dados brutos da imagem.
                                imgData = await page.objs.get(key);
                            } catch (e) {
                                // Se a imagem ainda não carregou, espera um pouco e tenta de novo.
                                if (e.message.includes("resolved yet")) {
                                    await sleep(150);
                                    imgData = await page.objs.get(key);
                                } else {
                                    // Para outros erros, simplesmente pula esta imagem.
                                    continue;
                                }
                            }

                            // Se os dados da imagem foram obtidos com sucesso.
                            if (imgData && imgData.data) {
                                // Cria um "canvas" (área de desenho) com as dimensões da imagem.
                                const canvas = createCanvas(imgData.width, imgData.height);
                                const ctx = canvas.getContext('2d');
                                // Prepara a estrutura para receber os pixels da imagem.
                                const imageData = ctx.createImageData(imgData.width, imgData.height);
                                // Copia os pixels da imagem para o canvas.
                                imageData.data.set(imgData.data);
                                ctx.putImageData(imageData, 0, 0);
                                // Converte o canvas para um buffer no formato PNG e adiciona ao array de imagens.
                                images.push(canvas.toBuffer('image/png'));
                            }
                        } catch (e) {
                            // Se houver erro no processamento da imagem, exibe um aviso.
                            console.warn(`Aviso: Não foi possível processar a imagem '${key}' na página ${i} após nova tentativa.`);
                        }
                    }
                }
            }
        } catch (error) {
            // Se falhar ao obter a lista de operações, exibe um aviso.
            console.warn(`Aviso: Falha ao extrair a lista de imagens da página ${i}.`);
        }

        // Adiciona os dados extraídos da página (número, texto e imagens) ao array de resultados.
        pagesData.push({
            pageNumber: i,
            embeddedText,
            images,
        });
    }

    // Retorna o array com os dados de todas as páginas.
    return pagesData;
}
