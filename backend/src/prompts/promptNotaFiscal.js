import { criarPrompt } from '../utils/promptFactory.js';

const definicao = `Definição: Uma Nota Fiscal Eletrônica (NF-e modelo 55 ou NFC-e modelo 65) é um documento digital que registra uma operação de circulação de mercadorias ou prestação de serviços.`;

const estrutura = {
  categoria: "Nota Fiscal",
  metadados: {
    tipo_documento: null,
    chave_acesso: null,
    numero_nf: null,
    serie_nf: null,
    modelo_nf: null,
    data_emissao: null,
    data_saida_entrada: null,
    tipo_operacao: null,
    forma_pagamento: null,
    natureza_operacao: null,
    tipo_emissao: null,
    ambiente: null,
    finalidade_emissao: null,
    emitente: {
      cnpj_cpf: null,
      nome_razao_social: null,
      nome_fantasia: null,
      logradouro: null,
      numero: null,
      bairro: null,
      municipio: null,
      uf: null,
      cep: null,
      fone: null,
      ie: null
    },
    destinatario: {
      cnpj_cpf: null,
      nome_razao_social: null,
      logradouro: null,
      numero: null,
      bairro: null,
      municipio: null,
      uf: null,
      cep: null,
      ie: null
    },
    valores_totais: {
      total_bc_icms: null,
      total_icms: null,
      total_produtos_servicos: null,
      total_frete: null,
      total_seguro: null,
      total_desconto: null,
      total_ipi: null,
      total_pis: null,
      total_cofins: null,
      total_outras_despesas: null,
      total_nf: null
    },
    itens: [],
    transporte: {
      modalidade_frete: null,
      transportador: {
        cnpj_cpf: null,
        nome_razao_social: null,
        ie: null,
        municipio: null,
        uf: null
      },
      veiculo: {
        placa: null,
        uf: null
      },
      volumes: {
        quantidade: null,
        especie: null,
        peso_bruto: null,
        peso_liquido: null
      }
    },
    cobranca: {
      fatura: {
        numero: null,
        valor_original: null,
        valor_liquido: null
      },
      duplicatas: []
    },
    informacoes_adicionais: {
      info_fisco: null,
      info_complementar: null
    },
    resumo_geral_ia: null
  }
};

const regras = [
  "O campo 'categoria' DEVE ser sempre 'Nota Fiscal'.",
  "Se um grupo inteiro (como transporte ou cobranca) não estiver presente, retorne o objeto com campos nulos.",
  "Gere um resumo conciso do propósito principal da nota no campo 'resumo_geral_ia'."
];

export const promptNotaFiscal = criarPrompt({
  tipoDocumento: "Nota Fiscal Eletrônica",
  definicao,
  estrutura,
  regrasEspecificas: regras
});