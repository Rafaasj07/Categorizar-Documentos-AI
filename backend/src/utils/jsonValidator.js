// Tenta corrigir erros comuns em uma string JSON, como espaços extras ou vírgulas.
function corrigirJsonComum(jsonString) {
    let corrigido = jsonString.trim();
    
    // Remove vírgulas extras no final de objetos ou arrays.
    corrigido = corrigido.replace(/,\s*(}|])/g, '$1');

    // Converte caracteres de nova linha para o formato correto.
    corrigido = corrigido.replace(/\\n/g, '\n');

    return corrigido;
}

// Extrai uma string JSON de um texto maior e a converte em um objeto.
export function extrairJson(textoCompleto) {
    console.log("Recebido para extração de JSON:", textoCompleto);

    // Encontra o início e o fim do objeto JSON no texto.
    const inicioJson = textoCompleto.indexOf('{');
    const fimJson = textoCompleto.lastIndexOf('}');

    // Se não encontrar um JSON, lança um erro.
    if (inicioJson === -1 || fimJson === -1) {
        throw new Error("Não foi encontrado JSON válido no texto.");
    }

    // Isola a string que parece ser o JSON.
    const jsonStringBruta = textoCompleto.substring(inicioJson, fimJson + 1);

    // Aplica as correções na string.
    const jsonCorrigido = corrigirJsonComum(jsonStringBruta);

    try {
        // Tenta converter a string corrigida em um objeto JSON.
        return JSON.parse(jsonCorrigido);
    } catch (error) {
        // Se a conversão falhar, exibe o erro e lança uma exceção.
        console.error("Erro ao analisar JSON corrigido:", jsonCorrigido);
        console.error("Erro original:", error);
        throw new Error("JSON extraído está inválido.");
    }
}