import { criarPrompt } from '../../utils/promptFactory.js';

const estrutura = {
  categoria: "Ata de Resultados",
  metadados: {
    instituicao: { nome: null, cnpj: null, endereco: null, curso: null, nivel_ensino: null },
    periodo_letivo: null,
    reuniao: { data: null, local: null, tipo: null, presidente: { nome: null, cargo: null } },
    participantes: [],
    alunos_resultados: [],
    resumo_geral: {
      total_alunos: null,
      total_aprovados: null,
      total_reprovados: null,
      percentual_aprovacao: null
    },
    assinaturas: [],
    autenticidade: { url_validacao: null, codigo_validacao: null, qr_code: null, carimbo: null },
    observacoes: null,
    resumo_geral_ia: null
  }
};

const regras = [
  "O campo 'resumo_geral_ia' deve conter informações chave como instituição, curso e data da reunião.",
  "Extraia a lista de alunos e seus resultados finais."
];

export const promptAtaResultados = criarPrompt({
  tipoDocumento: "Ata de Resultados Acadêmicos",
  estrutura,
  regrasEspecificas: regras
});