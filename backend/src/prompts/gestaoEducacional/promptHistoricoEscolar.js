import { criarPrompt } from '../../utils/promptFactory.js';

const estrutura = {
  categoria: "Histórico Escolar",
  metadados: {
    instituicao: {
      nome: null,
      cnpj: null,
      endereco: null,
      codigo_emec: null,
      responsavel_emissao: { nome: null, cargo: null, assinatura_digital: null }
    },
    aluno: {
      nome: null,
      cpf: null,
      matricula: null,
      curso: null,
      nivel_ensino: null,
      modalidade: null,
      periodo_letivo: null
    },
    data_emissao: null,
    disciplinas: [],
    resumo_final: {
      media_geral: null,
      total_carga_horaria: null,
      situacao_geral: null
    },
    assinaturas: [],
    autenticidade: {
      url_validacao: null,
      codigo_validacao: null,
      carimbo: null,
      qr_code: null
    },
    observacoes: null,
    resumo_geral_ia: null
  }
};

const regras = [
  "O campo 'resumo_geral_ia' deve explicar tipo, propósito, instituição, aluno e curso.",
  "Extraia a lista de disciplinas com suas respectivas notas e situações."
];

export const promptHistoricoEscolar = criarPrompt({
  tipoDocumento: "Histórico Escolar",
  estrutura,
  regrasEspecificas: regras
});