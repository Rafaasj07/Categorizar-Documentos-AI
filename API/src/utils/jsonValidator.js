/**
 * Corrige problemas comuns em uma string JSON, como espaços extras e vírgulas finais.
 * @param {string} jsonString - JSON em formato de texto que pode conter erros simples.
 * @returns {string} JSON corrigido, pronto para ser convertido em objeto.
 */
function corrigirJsonComum(jsonString) {
    // Remove espaços, quebras de linha e caracteres invisíveis no começo e fim
    let corrigido = jsonString.trim();

    // Remove vírgulas extras antes de '}' ou ']' para evitar erro de sintaxe
    corrigido = corrigido.replace(/,\s*(}|])/g, '$1');

    // Substitui sequências '\n' (barra invertida + n) por quebras de linha reais
    // Isso evita erros se a string JSON usar \n dentro de valores
    corrigido = corrigido.replace(/\\n/g, '\n');

    return corrigido;
}

/**
 * Extrai um objeto JSON de um texto, corrige erros comuns e faz o parse.
 * @param {string} textoCompleto - Texto que contém o JSON misturado com outros caracteres.
 * @returns {object} Objeto JSON convertido a partir do texto corrigido.
 * @throws {Error} Se o JSON não for encontrado ou for inválido após correção.
 */
export function extrairJson(textoCompleto) {
    console.log("Recebido para extração de JSON:", textoCompleto);

    // Procura início e fim do JSON pelo primeiro '{' e último '}'
    const inicioJson = textoCompleto.indexOf('{');
    const fimJson = textoCompleto.lastIndexOf('}');

    // Se não achar um JSON válido, lança erro
    if (inicioJson === -1 || fimJson === -1) {
        throw new Error("Não foi encontrado JSON válido no texto.");
    }

    // Extrai o JSON bruto do texto
    const jsonStringBruta = textoCompleto.substring(inicioJson, fimJson + 1);

    // Aplica correções simples no JSON extraído
    const jsonCorrigido = corrigirJsonComum(jsonStringBruta);

    try {
        // Tenta converter a string JSON para objeto
        return JSON.parse(jsonCorrigido);
    } catch (error) {
        console.error("Erro ao analisar JSON corrigido:", jsonCorrigido);
        console.error("Erro original:", error);
        throw new Error("JSON extraído está inválido.");
    }
}
