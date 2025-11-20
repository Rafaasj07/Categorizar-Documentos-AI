import { criarPrompt } from '../../utils/promptFactory.js';

const estrutura = {
  categoria: "Plano de Ensino",
  metadados: {
    instituicao: { nome: null, cnpj: null, endereco: null, curso: null, periodo_letivo: null, nivel_ensino: null, modalidade: null },
    disciplina: { nome: null, codigo: null, carga_horaria: null, creditos: null, periodo: null },
    docente_responsavel: { nome: null, cpf: null, titulação: null, email: null, assinatura_digital: null },
    ementa: null,
    objetivos_gerais: null,
    objetivos_especificos: [],
    competencias_habilidades: [],
    conteudos_programaticos: [],
    metodologia: null,
    criterios_avaliacao: null,
    instrumentos_avaliacao: [],
    bibliografia_basica: [],
    bibliografia_complementar: [],
    data_aprovacao: null,
    coordenacao: { nome: null, cargo: null, assinatura_digital: null },
    autenticidade: { url_validacao: null, codigo_validacao: null, qr_code: null },
    observacoes: null,
    resumo_geral_ia: null
  }
};

const regras = [
  "O campo 'resumo_geral_ia' deve incluir instituição, disciplina, curso e período letivo."
];

export const promptPlanoEnsino = criarPrompt({
  tipoDocumento: "Plano de Ensino",
  estrutura,
  regrasEspecificas: regras
});