export const promptRegimentoInterno = `
Sua única tarefa é analisar o texto abaixo, que representa um **Regimento Interno Educacional**, e retornar um objeto JSON estruturado de forma completa, seguindo a estrutura específica abaixo.
A sua resposta DEVE ser APENAS o objeto JSON, sem nenhum texto, comentário ou explicação adicional antes ou depois dele.

Estrutura para categoria: "Regimento Interno"
{
  "categoria": "Regimento Interno",
  "metadados": {
    "instituicao": { "nome": null, "cnpj": null, "endereco": null, "data_publicacao": null },
    "versao": null,
    "estrutura_organizacional": { "orgaos_deliberativos": [], "orgaos_executivos": [], "orgaos_consultivos": [], "departamentos": [], "setores_administrativos": [] },
    "disposicoes_preliminares": { "finalidade": null, "abrangencia": null, "vigencia": null },
    "direitos_e_deveres": { "discentes": [], "docentes": [], "tecnicos_administrativos": [] },
    "regime_disciplinar": { "infracoes": [], "penalidades": [], "processo_disciplinar": null },
    "gestao_academica": { "matricula": null, "avaliacao": null, "frequencia": null, "certificacao": null },
    "gestao_administrativa": { "contratacao": null, "lotacao": null, "promocao": null, "aposentadoria": null },
    "normas_referenciadas": [],
    "data_aprovacao": null,
    "autoridade_aprovacao": { "nome": null, "cargo": null, "assinatura_digital": null },
    "autenticidade": { "url_validacao": null, "codigo_validacao": null, "qr_code": null },
    "observacoes": null,
    "resumo_geral_ia": "Regimento Interno que estabelece as normas de organização, funcionamento e disciplina da instituição educacional [nome da instituição, se encontrada]."
  }
}

REGRAS GERAIS ADICIONAIS:
1. Ignore ruídos de OCR, repetições ou trechos duplicados; priorize nomes, datas, códigos e dados de validação.
2. O campo 'resumo_geral_ia' deve conter uma frase curta explicando o tipo e o propósito do documento, incluindo informações chave como instituição e data (se houver). Preencha mesmo se outros campos forem nulos.
3. Considere a instrução adicional do usuário: "\${promptUsuario}". Se for "Nenhuma", ignore.
4. Datas devem seguir o formato ISO (AAAA-MM-DD), se possível. Caso contrário, use o formato encontrado. Se não houver data, use \`null\`. Use 'null' para campos não encontrados e '[]' para listas vazias.

Texto do Regimento Interno a ser analisado:
"""
\${textoParaAnalise}
"""

Lembre-se: sua resposta FINAL deve ser APENAS o objeto JSON completo.
`;