import { criarPrompt } from '../../utils/promptFactory.js';

const estrutura = {
  categoria: "Registro de Matrícula",
  metadados: {
    instituicao: { nome: null, cnpj: null, endereco: null, telefone: null, email: null },
    estudante: {
      nome: null,
      cpf: null,
      rg: null,
      data_nascimento: null,
      email: null,
      telefone: null,
      endereco: null,
      nome_mae: null,
      nome_pai: null
    },
    matricula: {
      numero_matricula: null,
      data_matricula: null,
      periodo_letivo: null,
      curso: null,
      modalidade: null,
      turno: null,
      status_matricula: null
    },
    disciplinas_matriculadas: [],
    financeiro: {
      valor_matricula: null,
      valor_mensalidade: null,
      forma_pagamento: null,
      dia_vencimento: null,
      status_pagamento: null,
      observacoes_financeiras: null
    },
    documentacao_apresentada: [],
    historico_academico: {
      instituicao_anterior: null,
      curso_anterior: null,
      ano_conclusao: null,
      transferencia: null
    },
    responsavel_legal: { nome: null, cpf: null, parentesco: null, telefone: null },
    data_emissao: null,
    secretaria_academica: { responsavel: null, cargo: null, assinatura_digital: null },
    autenticidade: {
      codigo_validacao: null,
      url_validacao: null,
      qr_code: null,
      hash_documento: null
    },
    observacoes: null,
    resumo_geral_ia: null
  }
};

const regras = [
  "O campo 'resumo_geral_ia' deve incluir estudante, curso e período letivo."
];

export const promptRegistroMatricula = criarPrompt({
  tipoDocumento: "Registro de Matrícula",
  estrutura,
  regrasEspecificas: regras
});