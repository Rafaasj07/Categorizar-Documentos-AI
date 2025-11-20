import { criarPrompt } from '../utils/promptFactory.js';

const estrutura = {
  categoria: "...",
  metadados: {
    titulo: "...",
    autor: "...",
    data: "...",
    palavrasChave: [],
    resumo: "..."
  }
};

const regras = [
  "Atribua a categoria mais específica possível. Use Title Case (Ex: 'Contrato de Aluguel').",
  "Considere fortemente reutilizar uma das seguintes categorias existentes, se aplicável: [\${categoriasExistentes}].",
  "Se o texto for muito curto ou sem sentido para definir uma categoria, use 'Não Identificado'.",
  "O campo 'resumo' deve ser objetivo.",
  "O campo 'palavrasChave' deve conter até 5 termos relevantes."
];

export const promptPadrao = criarPrompt({
  estrutura,
  regrasEspecificas: regras
});