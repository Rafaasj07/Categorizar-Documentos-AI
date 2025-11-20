import { criarPrompt } from '../../utils/promptFactory.js';

const estrutura = {
  categoria: "Regimento Interno",
  metadados: {
    instituicao: { nome: null, cnpj: null, endereco: null, data_publicacao: null },
    versao: null,
    estrutura_organizacional: {
      orgaos_deliberativos: [],
      orgaos_executivos: [],
      orgaos_consultivos: [],
      departamentos: [],
      setores_administrativos: []
    },
    disposicoes_preliminares: { finalidade: null, abrangencia: null, vigencia: null },
    direitos_e_deveres: { discentes: [], docentes: [], tecnicos_administrativos: [] },
    regime_disciplinar: { infracoes: [], penalidades: [], processo_disciplinar: null },
    gestao_academica: { matricula: null, avaliacao: null, frequencia: null, certificacao: null },
    gestao_administrativa: { contratacao: null, lotacao: null, promocao: null, aposentadoria: null },
    normas_referenciadas: [],
    data_aprovacao: null,
    autoridade_aprovacao: { nome: null, cargo: null, assinatura_digital: null },
    autenticidade: { url_validacao: null, codigo_validacao: null, qr_code: null },
    observacoes: null,
    resumo_geral_ia: null
  }
};

const regras = [
  "O campo 'resumo_geral_ia' deve resumir o propósito do regimento e a instituição."
];

export const promptRegimentoInterno = criarPrompt({
  tipoDocumento: "Regimento Interno Educacional",
  estrutura,
  regrasEspecificas: regras
});