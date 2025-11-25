export const promptPlanoEnsino = `
Sua única tarefa é analisar o texto abaixo, que representa um **Plano de Ensino**, e retornar um objeto JSON estruturado de forma completa, seguindo a estrutura específica abaixo.
A sua resposta DEVE ser APENAS o objeto JSON, sem nenhum texto, comentário ou explicação adicional antes ou depois dele.

Estrutura para categoria: "Plano de Ensino"
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

REGRAS GERAIS ADICIONAIS:
1. Ignore ruídos de OCR, repetições ou trechos duplicados; priorize nomes, datas, códigos e dados de validação.
2. O campo 'resumo_geral_ia' deve conter uma frase curta explicando o tipo e o propósito do documento, incluindo informações chave como instituição, disciplina, curso e período letivo. Preencha mesmo se outros campos forem nulos.
3. Considere a instrução adicional do usuário: "\${promptUsuario}". Se for "Nenhuma", ignore.
4. Datas devem seguir o formato ISO (AAAA-MM-DD), se possível. Caso contrário, use o formato encontrado. Se não houver data, use \`null\`. Use 'null' para campos não encontrados e '[]' para listas vazias.

Texto do Plano de Ensino a ser analisado:
"""
\${textoParaAnalise}
"""

Lembre-se: sua resposta FINAL deve ser APENAS o objeto JSON completo.
`;