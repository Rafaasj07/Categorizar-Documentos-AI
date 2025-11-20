import { criarPrompt } from '../utils/promptFactory.js';

const definicao = `
DEFINIÇÃO: Documentos do SEI são registros oficiais gerados ou tramitados dentro da plataforma SEI.
Determine a categoria específica (Ofício SEI, Despacho SEI, Memorando SEI, etc.) baseada no conteúdo.
`;

const estrutura = {
  categoria: "...",
  metadados: {
    numero_documento: null,
    numero_sei: null,
    numero_processo_sei: null,
    orgao_emissor: null,
    data_documento: null,
    destinatario: null,
    interessado: null,
    assunto: null,
    signatarios: [],
    codigo_verificador: null,
    codigo_crc: null,
    url_verificacao: null,
    referencia: null,
    resumo_geral_ia: null
  }
};

const regras = [
  "O campo 'numero_documento' deve conter a identificação formal (Ex: Ofício nº 123/2025).",
  "O campo 'numero_sei' é o identificador numérico interno (Ex: 81279714).",
  "Foque na extração da estrutura administrativa (cabeçalhos, rodapés, assinaturas)."
];

export const promptSEI = criarPrompt({
  tipoDocumento: "Documento do SEI",
  definicao,
  estrutura,
  regrasEspecificas: regras
});