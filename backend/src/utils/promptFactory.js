// Gera string de prompt formatada para IA com base em configurações e regras
export const criarPrompt = ({
  tipoDocumento = '',
  definicao = '',
  estrutura = {},
  regrasEspecificas = []
}) => {
  // Formata estrutura e regras para inserção no template
  const estruturaJson = JSON.stringify(estrutura, null, 2);
  const regrasFormatadas = regrasEspecificas.map(r => `- ${r}`).join('\n');

  // Define texto introdutório baseado na presença do tipo de documento
  const introducao = tipoDocumento 
    ? `Sua única tarefa é analisar o texto abaixo, que representa um **${tipoDocumento}**, e retornar um objeto JSON estruturado de forma completa.`
    : `Sua única tarefa é analisar o texto abaixo e retornar um objeto JSON estruturado de forma completa.`;

  // Retorna o prompt final concatenando instruções, estrutura JSON e variáveis de substituição
  return `
${introducao}
A sua resposta DEVE ser APENAS o objeto JSON, sem nenhum texto, comentário ou explicação adicional antes ou depois dele.

${definicao}

Estrutura obrigatória do JSON de saída:
${estruturaJson}

REGRAS GERAIS:
1. Retorne SEMPRE a estrutura JSON completa. Campos não encontrados devem ser \`null\` e listas vazias \`[]\`.
2. Datas devem seguir o formato ISO (AAAA-MM-DD), se possível.
3. Considere a instrução adicional do usuário: "\${promptUsuario}". Se for "Nenhuma", ignore.
4. Ignore ruídos de OCR, repetições ou trechos duplicados.
${regrasFormatadas}

Texto a ser analisado:
"""
\${textoParaAnalise}
"""

Lembre-se: sua resposta FINAL deve ser APENAS o objeto JSON completo.
`;
};