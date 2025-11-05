export const promptPortariaAto = `
Sua única tarefa é analisar o texto abaixo, que representa uma **Portaria ou Ato Administrativo Educacional**, e retornar um objeto JSON estruturado de forma completa, seguindo a estrutura específica abaixo.
A sua resposta DEVE ser APENAS o objeto JSON, sem nenhum texto, comentário ou explicação adicional antes ou depois dele.

Estrutura para categoria: "Portaria ou Ato"
{
  "categoria": "Portaria ou Ato",
  "metadados": {
    "identificacao_ato": { "numero": null, "ano": null, "data_publicacao": null, "data_eficacia": null, "ementa": null },
    "instituicao": { "nome": null, "cnpj": null, "endereco": null },
    "autoridade_expeditora": { "nome": null, "cargo": null, "competencia_legal": null, "assinatura_digital": null },
    "fundamentacao_legal": [],
    "finalidade_objetivos": { "finalidade_geral": null, "objetivos_especificos": [] },
    "dispositivos_principais": { "designacoes_nomeacoes": [], "comissoes_criadas": [], "procedimentos_estabelecidos": [], "prazos_estipulados": [], "condicoes_estabelecidas": [] },
    "vigencia_temporal": { "data_inicio": null, "data_termino": null, "condicoes_renovacao": null },
    "publicacao_divulgacao": { "meio_publicacao": null, "data_publicacao": null, "url_publicacao": null },
    "normas_referenciadas": [],
    "revogacao_alteracao": { "portarias_revogadas": [], "dispositivos_alterados": [], "condicoes_revogacao": null },
    "autenticidade": { "url_validacao": null, "codigo_validacao": null, "qr_code": null },
    "observacoes": null,
    "resumo_geral_ia": "Portaria/Ato nº [numero]/[ano] sobre [ementa resumida], expedida por [autoridade] na instituição [nome]."
  }
}

REGRAS GERAIS ADICIONAIS:
1. Ignore ruídos de OCR, repetições ou trechos duplicados; priorize nomes, datas, códigos e dados de validação.
2. O campo 'resumo_geral_ia' deve conter uma frase curta explicando o tipo e o propósito do documento, incluindo informações chave como número, ano, ementa, autoridade e instituição. Preencha mesmo se outros campos forem nulos.
3. Considere a instrução adicional do usuário: "\${promptUsuario}". Se for "Nenhuma", ignore.
4. Datas devem seguir o formato ISO (AAAA-MM-DD), se possível. Caso contrário, use o formato encontrado. Se não houver data, use \`null\`. Use 'null' para campos não encontrados e '[]' para listas vazias.

Texto da Portaria ou Ato a ser analisado:
"""
\${textoParaAnalise}
"""

Lembre-se: sua resposta FINAL deve ser APENAS o objeto JSON completo.
`;