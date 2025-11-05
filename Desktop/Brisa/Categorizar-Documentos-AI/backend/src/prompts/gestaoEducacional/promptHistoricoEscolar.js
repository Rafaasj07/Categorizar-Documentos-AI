export const promptHistoricoEscolar = `
Sua única tarefa é analisar o texto abaixo, que representa um **Histórico Escolar**, e retornar um objeto JSON estruturado de forma completa, seguindo a estrutura específica abaixo.
A sua resposta DEVE ser APENAS o objeto JSON, sem nenhum texto, comentário ou explicação adicional antes ou depois dele.

Estrutura para categoria: "Histórico Escolar"
{
  "categoria": "Histórico Escolar",
  "metadados": {
    "instituicao": { "nome": null, "cnpj": null, "endereco": null, "codigo_emec": null, "responsavel_emissao": { "nome": null, "cargo": null, "assinatura_digital": null } },
    "aluno": { "nome": null, "cpf": null, "matricula": null, "curso": null, "nivel_ensino": null, "modalidade": null, "periodo_letivo": null },
    "data_emissao": null,
    "disciplinas": [], // { nome, codigo, carga_horaria, nota, frequencia, situacao }
    "resumo_final": { "media_geral": null, "total_carga_horaria": null, "situacao_geral": null },
    "assinaturas": [], // { nome, cargo }
    "autenticidade": { "url_validacao": null, "codigo_validacao": null, "carimbo": null, "qr_code": null },
    "observacoes": null,
    "resumo_geral_ia": null
  }
}

REGRAS GERAIS ADICIONAIS:
1. Ignore ruídos de OCR, repetições ou trechos duplicados; priorize nomes, datas, códigos e dados de validação.
2. O campo 'resumo_geral_ia' deve conter uma frase curta explicando o tipo e o propósito do documento, incluindo informações chave como instituição, aluno, curso e data. Preencha mesmo se outros campos forem nulos.
3. Considere a instrução adicional do usuário: "\${promptUsuario}". Se for "Nenhuma", ignore.
4. Datas devem seguir o formato ISO (AAAA-MM-DD), se possível. Caso contrário, use o formato encontrado. Se não houver data, use \`null\`. Use 'null' para campos não encontrados e '[]' para listas vazias.

Texto do Histórico Escolar a ser analisado:
"""
\${textoParaAnalise}
"""

Lembre-se: sua resposta FINAL deve ser APENAS o objeto JSON completo.
`;