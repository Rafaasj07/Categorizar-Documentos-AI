export const promptRegistroMatricula = `
Sua única tarefa é analisar o texto abaixo, que representa um **Registro de Matrícula**, e retornar um objeto JSON estruturado de forma completa, seguindo a estrutura específica abaixo.
A sua resposta DEVE ser APENAS o objeto JSON, sem nenhum texto, comentário ou explicação adicional antes ou depois dele.

Estrutura para categoria: "Registro de Matrícula"
{
  "categoria": "Registro de Matrícula",
  "metadados": {
    "instituicao": { "nome": null, "cnpj": null, "endereco": null, "telefone": null, "email": null },
    "estudante": { "nome": null, "cpf": null, "rg": null, "data_nascimento": null, "email": null, "telefone": null, "endereco": null, "nome_mae": null, "nome_pai": null },
    "matricula": { "numero_matricula": null, "data_matricula": null, "periodo_letivo": null, "curso": null, "modalidade": null, "turno": null, "status_matricula": null },
    "disciplinas_matriculadas": [], // { nome, codigo, turma }
    "financeiro": { "valor_matricula": null, "valor_mensalidade": null, "forma_pagamento": null, "dia_vencimento": null, "status_pagamento": null, "observacoes_financeiras": null },
    "documentacao_apresentada": [],
    "historico_academico": { "instituicao_anterior": null, "curso_anterior": null, "ano_conclusao": null, "transferencia": null },
    "responsavel_legal": { "nome": null, "cpf": null, "parentesco": null, "telefone": null },
    "data_emissao": null,
    "secretaria_academica": { "responsavel": null, "cargo": null, "assinatura_digital": null },
    "autenticidade": { "codigo_validacao": null, "url_validacao": null, "qr_code": null, "hash_documento": null },
    "observacoes": null,
    "resumo_geral_ia": "Registro de matrícula do estudante [nome] no curso [curso] para o período [periodo_letivo]."
  }
}

REGRAS GERAIS ADICIONAIS:
1. Ignore ruídos de OCR, repetições ou trechos duplicados; priorize nomes, datas, códigos e dados de validação.
2. O campo 'resumo_geral_ia' deve conter uma frase curta explicando o tipo e o propósito do documento, incluindo informações chave como estudante, curso e período letivo. Preencha mesmo se outros campos forem nulos.
3. Considere a instrução adicional do usuário: "\${promptUsuario}". Se for "Nenhuma", ignore.
4. Datas devem seguir o formato ISO (AAAA-MM-DD), se possível. Caso contrário, use o formato encontrado. Se não houver data, use \`null\`. Use 'null' para campos não encontrados e '[]' para listas vazias.

Texto do Registro de Matrícula a ser analisado:
"""
\${textoParaAnalise}
"""

Lembre-se: sua resposta FINAL deve ser APENAS o objeto JSON completo.
`;