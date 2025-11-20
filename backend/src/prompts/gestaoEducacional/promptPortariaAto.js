import { criarPrompt } from '../../utils/promptFactory.js';

const estrutura = {
  categoria: "Portaria ou Ato",
  metadados: {
    identificacao_ato: { numero: null, ano: null, data_publicacao: null, data_eficacia: null, ementa: null },
    instituicao: { nome: null, cnpj: null, endereco: null },
    autoridade_expeditora: { nome: null, cargo: null, competencia_legal: null, assinatura_digital: null },
    fundamentacao_legal: [],
    finalidade_objetivos: { finalidade_geral: null, objetivos_especificos: [] },
    dispositivos_principais: {
      designacoes_nomeacoes: [],
      comissoes_criadas: [],
      procedimentos_estabelecidos: [],
      prazos_estipulados: [],
      condicoes_estabelecidas: []
    },
    vigencia_temporal: { data_inicio: null, data_termino: null, condicoes_renovacao: null },
    publicacao_divulgacao: { meio_publicacao: null, data_publicacao: null, url_publicacao: null },
    normas_referenciadas: [],
    revogacao_alteracao: { portarias_revogadas: [], dispositivos_alterados: [], condicoes_revogacao: null },
    autenticidade: { url_validacao: null, codigo_validacao: null, qr_code: null },
    observacoes: null,
    resumo_geral_ia: null
  }
};

const regras = [
  "O campo 'resumo_geral_ia' deve incluir número, ano, ementa, autoridade e instituição."
];

export const promptPortariaAto = criarPrompt({
  tipoDocumento: "Portaria ou Ato Administrativo Educacional",
  estrutura,
  regrasEspecificas: regras
});