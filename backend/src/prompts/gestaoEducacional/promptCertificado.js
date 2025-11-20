import { criarPrompt } from '../../utils/promptFactory.js';

const estrutura = {
  categoria: "Certificado",
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
      curso: null,
      nivel: null,
      modalidade: null,
      data_inicio: null,
      data_conclusao: null
    },
    certificacao: {
      numero_certificado: null,
      carga_horaria_total: null,
      duracao_meses: null,
      data_emissao: null,
      local_emissao: null
    },
    assinaturas: [],
    autenticidade: {
      url_validacao: null,
      codigo_validacao: null,
      qr_code: null,
      carimbo: null
    },
    observacoes: null,
    resumo_geral_ia: null
  }
};

const regras = [
  "O campo 'resumo_geral_ia' deve incluir instituição, aluno, curso/evento e data."
];

export const promptCertificado = criarPrompt({
  tipoDocumento: "Certificado Educacional",
  estrutura,
  regrasEspecificas: regras
});