import { criarPrompt } from '../utils/promptFactory.js';

const definicao = `
DEFINIÇÃO: Documentos de cartório são instrumentos públicos ou privados autenticados que formalizam atos jurídicos.
Analise o texto e defina o campo "categoria" com o tipo mais preciso (ex: Certidão de Nascimento, Escritura Pública, Procuração Pública).
`;

const estrutura = {
  categoria: "...",
  metadados: {
    tipo_ato_especifico: null,
    cartorio_responsavel: {
      nome_oficial: null,
      comarca: null,
      endereco: null,
      oficial_responsavel: null,
      codigo_cns: null
    },
    numero_livro: null,
    numero_folha: null,
    numero_termo_ou_registro: null,
    data_ato: null,
    data_emissao_documento: null,
    partes_envolvidas: [],
    objeto_principal: null,
    valor_negocio: null,
    selo_digital_ou_fisico: null,
    dados_imovel: {
      matricula: null,
      endereco_completo: null,
      descricao_imovel: null
    },
    observacoes_averbacoes: null,
    resumo_geral_ia: null
  }
};

const regras = [
  "Extraia nomes completos e CPFs/CNPJs com precisão.",
  "O campo 'resumo_geral_ia' deve conter uma frase curta explicando a categoria, partes principais e data.",
  "Identifique claramente o Tabelião ou Oficial responsável."
];

export const promptCartorio = criarPrompt({
  tipoDocumento: "Documento de Cartório",
  definicao,
  estrutura,
  regrasEspecificas: regras
});