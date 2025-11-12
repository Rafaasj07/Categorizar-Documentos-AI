export const promptDocEducacionalGenerico = `
Sua única tarefa é analisar o texto abaixo, que representa um **Documento Educacional Oficial** que não se encaixa claramente nas categorias específicas, e retornar um objeto JSON estruturado de forma completa, seguindo a estrutura específica abaixo.
A sua resposta DEVE ser APENAS o objeto JSON, sem nenhum texto, comentário ou explicação adicional antes ou depois dele.

Estrutura para categoria: "Documento Educacional Genérico"
{
  "categoria": "Documento Educacional Genérico",
  "metadados": {
    "descricao_detectada": null, // Descreva brevemente o que parece ser o documento
    "dados_identificados": {}, // Coloque aqui quaisquer dados soltos identificados (chave: valor)
    "resumo_geral_ia": "Não foi possível classificar o tipo específico de documento educacional com precisão."
  }
}

REGRAS GERAIS ADICIONAIS:
1. Ignore ruídos de OCR, repetições ou trechos duplicados. Tente identificar a instituição, datas ou nomes relevantes.
2. O campo 'resumo_geral_ia' deve indicar a dificuldade na classificação.
3. Considere a instrução adicional do usuário: "\${promptUsuario}". Se for "Nenhuma", ignore.
4. Use 'null' para campos não encontrados.

Texto do Documento Educacional a ser analisado:
"""
\${textoParaAnalise}
"""

Lembre-se: sua resposta FINAL deve ser APENAS o objeto JSON completo.
`;