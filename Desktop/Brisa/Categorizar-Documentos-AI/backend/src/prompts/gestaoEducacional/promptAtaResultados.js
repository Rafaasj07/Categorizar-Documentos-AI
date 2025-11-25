export const promptAtaResultados = `
Sua única tarefa é analisar o texto abaixo, que representa uma **Ata de Resultados Acadêmicos**, e retornar um objeto JSON estruturado de forma completa, seguindo a estrutura específica abaixo.
A sua resposta DEVE ser APENAS o objeto JSON, sem nenhum texto, comentário ou explicação adicional antes ou depois dele.

Estrutura para categoria: "Ata de Resultados"
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

REGRAS GERAIS ADICIONAIS:
1. Ignore ruídos de OCR, repetições ou trechos duplicados; priorize nomes, datas, códigos e dados de validação.
2. O campo 'resumo_geral_ia' deve conter uma frase curta explicando o tipo e o propósito do documento, incluindo informações chave como instituição, curso (se aplicável) e data da reunião. Preencha mesmo se outros campos forem nulos.
3. Considere a instrução adicional do usuário: "\${promptUsuario}". Se for "Nenhuma", ignore.
4. Datas devem seguir o formato ISO (AAAA-MM-DD), se possível. Caso contrário, use o formato encontrado. Se não houver data, use \`null\`. Use 'null' para campos não encontrados e '[]' para listas vazias.

Texto da Ata de Resultados a ser analisado:
"""
\${textoParaAnalise}
"""

Lembre-se: sua resposta FINAL deve ser APENAS o objeto JSON completo.
`;