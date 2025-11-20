import { criarPrompt } from '../../utils/promptFactory.js';

const estrutura = {
  categoria: "Diploma",
  metadados: {
    numero_diploma: null,
    processo_mec: null,
    instituicao: {
      nome: null,
      cnpj: null,
      mantenedora: null,
      endereco: null,
      codigo_emec: null,
      credenciamento_mec: []
    },
    curso_detalhes: {
      nome: null,
      codigo_emec: null,
      portaria_reconhecimento: null,
      processo_reconhecimento: null,
      grau_conferido: null
    },
    aluno: {
      nome: null,
      nacionalidade: null,
      naturalidade: null,
      data_nascimento: null,
      documento_identidade: { numero: null, orgao_emissor: null },
      cpf: null,
      data_conclusao: null,
      data_colacao: null
    },
    registro: {
      livro: null,
      folha: null,
      numero_registro: null,
      data_registro: null,
      responsavel_registro: { nome: null, cpf: null, setor: null }
    },
    autoridades_assinantes: [],
    autenticidade: {
      url_validacao: null,
      codigo_validacao: null,
      assinaturas_digitais: []
    },
    local_emissao: null,
    data_emissao: null,
    fundamentacao_legal: [],
    observacoes: null,
    resumo_geral_ia: null
  }
};

const regras = [
  "O campo 'resumo_geral_ia' deve incluir instituição, aluno, curso e data.",
  "Priorize a extração precisa de códigos de registro e dados do aluno."
];

export const promptDiploma = criarPrompt({
  tipoDocumento: "Diploma Educacional",
  estrutura,
  regrasEspecificas: regras
});