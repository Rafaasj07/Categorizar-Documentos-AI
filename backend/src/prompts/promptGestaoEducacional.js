export const promptGestaoEducacional = `
Sua única tarefa é analisar o texto abaixo, que representa um **Documento Educacional Oficial**, identificar o tipo mais específico de documento e retornar um objeto JSON estruturado de forma completa, seguindo a estrutura específica para o tipo detectado.
A sua resposta DEVE ser APENAS o objeto JSON, sem nenhum texto, comentário ou explicação adicional antes ou depois dele.

DEFINIÇÃO GERAL:
Documentos educacionais oficiais são registros emitidos por instituições de ensino que comprovam a formação, trajetória ou atos administrativos de estudantes, docentes ou gestores (Diplomas, Históricos, Atas, Certificados, Planos de Ensino, Regimentos, Portarias, Matrículas, etc.).

DETERMINE A CATEGORIA ESPECÍFICA E PREENCHA O JSON CORRESPONDENTE:
Analise o texto e defina o campo "categoria" com o tipo mais preciso, usando uma das seguintes opções: "Diploma", "Histórico Escolar", "Ata de Resultados", "Certificado", "Plano de Ensino", "Regimento Interno", "Portaria ou Ato", "Registro de Matrícula", ou "Documento Educacional Genérico" (se não for possível determinar claramente). Em seguida, preencha a estrutura JSON correspondente abaixo com o máximo de detalhes possível. Use 'null' para campos não encontrados e '[]' para listas vazias.

#### Estrutura para categoria: "Diploma"
\`\`\`json
{
  "categoria": "Diploma",
  "metadados": {
    "numero_diploma": null,
    "processo_mec": null,
    "instituicao": { "nome": null, "cnpj": null, "mantenedora": null, "endereco": null, "codigo_emec": null, "credenciamento_mec": [] },
    "curso_detalhes": { "nome": null, "codigo_emec": null, "portaria_reconhecimento": null, "processo_reconhecimento": null, "grau_conferido": null },
    "aluno": { "nome": null, "nacionalidade": null, "naturalidade": null, "data_nascimento": null, "documento_identidade": { "numero": null, "orgao_emissor": null }, "cpf": null, "data_conclusao": null, "data_colacao": null },
    "registro": { "livro": null, "folha": null, "numero_registro": null, "data_registro": null, "responsavel_registro": { "nome": null, "cpf": null, "setor": null } },
    "autoridades_assinantes": [], // { nome, cargo }
    "autenticidade": { "url_validacao": null, "codigo_validacao": null, "assinaturas_digitais": [] },
    "local_emissao": null,
    "data_emissao": null,
    "fundamentacao_legal": [],
    "observacoes": null,
    "resumo_geral_ia": null
  }
}
\`\`\`

#### Estrutura para categoria: "Histórico Escolar"
\`\`\`json
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
\`\`\`

#### Estrutura para categoria: "Ata de Resultados"
\`\`\`json
{
  "categoria": "Ata de Resultados",
  "metadados": {
    "instituicao": { "nome": null, "cnpj": null, "endereco": null, "curso": null, "nivel_ensino": null },
    "periodo_letivo": null,
    "reuniao": { "data": null, "local": null, "tipo": null, "presidente": { "nome": null, "cargo": null } },
    "participantes": [], // { nome, cargo }
    "alunos_resultados": [], // { nome, matricula, nota_final, situacao }
     "resumo_geral": { "total_alunos": null, "total_aprovados": null, "total_reprovados": null, "percentual_aprovacao": null },
    "assinaturas": [], // { nome, cargo }
    "autenticidade": { "url_validacao": null, "codigo_validacao": null, "qr_code": null, "carimbo": null },
    "observacoes": null,
    "resumo_geral_ia": null
  }
}
\`\`\`

#### Estrutura para categoria: "Certificado"
\`\`\`json
{
  "categoria": "Certificado",
  "metadados": {
    "instituicao": { "nome": null, "cnpj": null, "endereco": null, "codigo_emec": null, "responsavel_emissao": { "nome": null, "cargo": null, "assinatura_digital": null } },
    "aluno": { "nome": null, "cpf": null, "curso": null, "nivel": null, "modalidade": null, "data_inicio": null, "data_conclusao": null },
    "certificacao": { "numero_certificado": null, "carga_horaria_total": null, "duracao_meses": null, "data_emissao": null, "local_emissao": null },
    "assinaturas": [], // { nome, cargo }
    "autenticidade": { "url_validacao": null, "codigo_validacao": null, "qr_code": null, "carimbo": null },
    "observacoes": null,
    "resumo_geral_ia": null
  }
}
\`\`\`

#### Estrutura para categoria: "Plano de Ensino"
\`\`\`json
{
  "categoria": "Plano de Ensino",
  "metadados": {
    "instituicao": { "nome": null, "cnpj": null, "endereco": null, "curso": null, "periodo_letivo": null, "nivel_ensino": null, "modalidade": null },
    "disciplina": { "nome": null, "codigo": null, "carga_horaria": null, "creditos": null, "periodo": null },
    "docente_responsavel": { "nome": null, "cpf": null, "titulação": null, "email": null, "assinatura_digital": null },
    "ementa": null,
    "objetivos_gerais": null,
    "objetivos_especificos": [],
    "competencias_habilidades": [],
    "conteudos_programaticos": [],
    "metodologia": null,
    "criterios_avaliacao": null,
    "instrumentos_avaliacao": [],
    "bibliografia_basica": [],
    "bibliografia_complementar": [],
    "data_aprovacao": null,
    "coordenacao": { "nome": null, "cargo": null, "assinatura_digital": null },
    "autenticidade": { "url_validacao": null, "codigo_validacao": null, "qr_code": null },
    "observacoes": null,
    "resumo_geral_ia": null
  }
}
\`\`\`

#### Estrutura para categoria: "Regimento Interno"
\`\`\`json
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
\`\`\`

#### Estrutura para categoria: "Portaria ou Ato"
\`\`\`json
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
\`\`\`

#### Estrutura para categoria: "Registro de Matrícula"
\`\`\`json
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
\`\`\`

#### Estrutura para categoria: "Documento Educacional Genérico"
\`\`\`json
{
  "categoria": "Documento Educacional Genérico",
  "metadados": {
    "descricao_detectada": null, // Descreva brevemente o que parece ser o documento
    "dados_identificados": {}, // Coloque aqui quaisquer dados soltos identificados
    "resumo_geral_ia": "Não foi possível classificar o tipo específico de documento educacional com precisão."
  }
}
\`\`\`

REGRAS GERAIS ADICIONAIS:
1. Ignore ruídos de OCR, repetições ou trechos duplicados; priorize nomes, datas, códigos e dados de validação.
2. O campo 'resumo_geral_ia' deve conter uma frase curta explicando o tipo e o propósito do documento, incluindo informações chave como instituição, aluno (se aplicável), curso (se aplicável) e data. Preencha mesmo se outros campos forem nulos.
3. Considere a instrução adicional do usuário: "\${promptUsuario}". Se for "Nenhuma", ignore.
4. Datas devem seguir o formato ISO (AAAA-MM-DD), se possível. Caso contrário, use o formato encontrado. Se não houver data, use \`null\`.

Texto do Documento Educacional a ser analisado:
"""
\${textoParaAnalise}
"""

Lembre-se: sua resposta FINAL deve ser APENAS o objeto JSON completo correspondente à categoria detectada.
`;