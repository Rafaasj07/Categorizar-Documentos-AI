export const promptDiploma = `
Sua única tarefa é analisar o texto abaixo, que representa um **Diploma Educacional**, e retornar um objeto JSON estruturado de forma completa, seguindo a estrutura específica abaixo.
A sua resposta DEVE ser APENAS o objeto JSON, sem nenhum texto, comentário ou explicação adicional antes ou depois dele.

Estrutura para categoria: "Diploma"
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

REGRAS GERAIS ADICIONAIS:
1. Ignore ruídos de OCR, repetições ou trechos duplicados; priorize nomes, datas, códigos e dados de validação.
2. O campo 'resumo_geral_ia' deve conter uma frase curta explicando o tipo e o propósito do documento, incluindo informações chave como instituição, aluno, curso e data. Preencha mesmo se outros campos forem nulos.
3. Considere a instrução adicional do usuário: "\${promptUsuario}". Se for "Nenhuma", ignore.
4. Datas devem seguir o formato ISO (AAAA-MM-DD), se possível. Caso contrário, use o formato encontrado. Se não houver data, use \`null\`. Use 'null' para campos não encontrados e '[]' para listas vazias.

Texto do Diploma a ser analisado:
"""
\${textoParaAnalise}
"""

Lembre-se: sua resposta FINAL deve ser APENAS o objeto JSON completo.
`;