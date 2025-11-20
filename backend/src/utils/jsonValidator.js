// Normaliza string removendo vírgulas finais e corrigindo quebras de linha
function corrigirJsonComum(jsonString) {
    let corrigido = jsonString.trim();
    
    corrigido = corrigido.replace(/,\s*(}|])/g, '$1');
    corrigido = corrigido.replace(/\\n/g, '\n');

    return corrigido;
}

// Localiza e converte bloco JSON dentro de string arbitrária
export function extrairJson(textoCompleto) {
    console.log("Recebido para extração de JSON:", textoCompleto);

    const inicioJson = textoCompleto.indexOf('{');
    const fimJson = textoCompleto.lastIndexOf('}');

    // Valida existência dos delimitadores do objeto
    if (inicioJson === -1 || fimJson === -1) {
        throw new Error("Não foi encontrado JSON válido no texto.");
    }

    // Extrai apenas o segmento correspondente ao objeto JSON
    const jsonStringBruta = textoCompleto.substring(inicioJson, fimJson + 1);

    const jsonCorrigido = corrigirJsonComum(jsonStringBruta);

    try {
        // Executa parse após sanitização
        return JSON.parse(jsonCorrigido);
    } catch (error) {
        console.error("Erro ao analisar JSON corrigido:", jsonCorrigido);
        console.error("Erro original:", error);
        throw new Error("JSON extraído está inválido.");
    }
}