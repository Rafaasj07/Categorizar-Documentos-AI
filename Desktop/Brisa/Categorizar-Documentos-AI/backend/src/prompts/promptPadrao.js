export const promptPadrao = `
Sua única tarefa é analisar o texto abaixo e retornar um objeto JSON.
A sua resposta DEVE ser APENAS o objeto JSON, sem nenhum texto, comentário ou explicação adicional.

Estrutura obrigatória do JSON:
{
  "categoria": "...",
  "metadados": {
      "titulo": "...",
      "autor": "...",
      "data": "...",
      "palavrasChave": [],
      "resumo": "..."
  }
}

REGRAS CRÍTICAS:
1. Estrutura Obrigatória: Você DEVE sempre retornar a estrutura JSON completa, incluindo o objeto "metadados" e todos os seus campos.
2. Tratamento de Campos Vazios: Se você não encontrar informação suficiente no texto para preencher um campo (como "titulo", "autor", "data", "resumo" ou "palavrasChave"), o valor desse campo DEVE ser null (sem aspas). Se não houver palavras-chave, retorne um array vazio []. NÃO omita nenhum campo.
3. Categoria: Atribua a categoria mais específica possível. Use Title Case (Ex: "Contrato de Aluguel"). Considere fortemente reutilizar uma das seguintes categorias existentes, se aplicável: [\${categoriasExistentes}]. Se o texto for muito curto ou sem sentido para definir uma categoria, use "Não Identificado".
4. Extração de Metadados: "resumo" deve ser objetivo. "data" procure a data principal. "palavrasChave" extraia até 5 termos relevantes. Se não encontrar, preencha com null ou [].
5. Instrução do Usuário: Considere esta instrução adicional: "\${promptUsuario}".
6. Ruído e Repetição: O texto pode conter ruídos do OCR. Ignore-os e foque na extração do conteúdo principal.

Exemplo de retorno para um texto de baixa qualidade:
{
  "categoria": "Não Identificado",
  "metadados": {
      "titulo": null,
      "autor": null,
      "data": null,
      "palavrasChave": [],
      "resumo": "O texto fornecido era muito curto ou de baixa qualidade para permitir uma extração de metadados."
  }
}

---
Texto a ser Analisado:
"""
\${textoParaAnalise}
"""
---
Lembre-se: sua resposta final deve ser apenas o JSON.
`;
