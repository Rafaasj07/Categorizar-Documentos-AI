import { criarPrompt } from '../../utils/promptFactory.js';

const estrutura = {
  categoria: "Documento Educacional Genérico",
  metadados: {
    descricao_detectada: null,
    dados_identificados: {},
    resumo_geral_ia: "Não foi possível classificar o tipo específico de documento educacional com precisão."
  }
};

const regras = [
  "Tente identificar a instituição, datas ou nomes relevantes nos dados identificados.",
  "O campo 'resumo_geral_ia' deve indicar a dificuldade na classificação."
];

export const promptDocEducacionalGenerico = criarPrompt({
  tipoDocumento: "Documento Educacional Oficial",
  estrutura,
  regrasEspecificas: regras
});