export const promptNotaFiscal = `
Sua única tarefa é analisar o texto abaixo, que representa uma Nota Fiscal Eletrônica (NF-e ou NFC-e), e retornar um objeto JSON.
A sua resposta DEVE ser APENAS o objeto JSON, sem nenhum texto, comentário ou explicação adicional antes ou depois dele.

Definição: Uma Nota Fiscal Eletrônica (NF-e modelo 55 ou NFC-e modelo 65) é um documento digital que registra uma operação de circulação de mercadorias ou prestação de serviços, com validade jurídica garantida por assinatura digital e autorização do Fisco.

Estrutura obrigatória do JSON de saída (extraia o máximo de campos possível, use null se não encontrar):
{
  "categoria": "Nota Fiscal",
  "metadados": {
    "tipo_documento": null,
    "chave_acesso": null,
    "numero_nf": null,
    "serie_nf": null,
    "modelo_nf": null,
    "data_emissao": null,
    "data_saida_entrada": null,
    "tipo_operacao": null,
    "forma_pagamento": null,
    "natureza_operacao": null,
    "tipo_emissao": null,
    "ambiente": null,
    "finalidade_emissao": null,
    "processo_emissao": null,
    "versao_processo": null,
    "emitente": {
      "cnpj_cpf": null,
      "nome_razao_social": null,
      "nome_fantasia": null,
      "logradouro": null,
      "numero": null,
      "complemento": null,
      "bairro": null,
      "codigo_municipio": null,
      "nome_municipio": null,
      "uf": null,
      "cep": null,
      "codigo_pais": null,
      "nome_pais": null,
      "fone": null,
      "ie": null,
      "ie_st": null,
      "im": null,
      "cnae": null,
      "crt": null
    },
    "destinatario": {
      "cnpj_cpf": null,
      "idEstrangeiro": null,
      "nome_razao_social": null,
      "logradouro": null,
      "numero": null,
      "complemento": null,
      "bairro": null,
      "codigo_municipio": null,
      "nome_municipio": null,
      "uf": null,
      "cep": null,
      "codigo_pais": null,
      "nome_pais": null,
      "fone": null,
      "ie": null,
      "isuf": null,
      "email": null
    },
    "valores_totais": {
      "total_bc_icms": null,
      "total_icms": null,
      "total_icms_desonerado": null,
      "total_fcp_uf_dest": null,
      "total_icms_uf_dest": null,
      "total_icms_uf_remet": null,
      "total_fcp": null,
      "total_bc_icms_st": null,
      "total_icms_st": null,
      "total_fcp_st": null,
      "total_fcp_st_ret": null,
      "total_produtos_servicos": null,
      "total_frete": null,
      "total_seguro": null,
      "total_desconto": null,
      "total_ii": null,
      "total_ipi": null,
      "total_ipi_devolvido": null,
      "total_pis": null,
      "total_cofins": null,
      "total_outras_despesas": null,
      "total_nf": null,
      "total_tributos_aproximado": null
    },
    "itens": [],
    "transporte": {
        "modalidade_frete": null,
        "transportador": {
            "cnpj_cpf": null,
            "nome_razao_social": null,
            "ie": null,
            "endereco": null,
            "nome_municipio": null,
            "uf": null
        },
        "veiculo": {
            "placa": null,
            "uf": null,
            "rntc": null
        },
        "volumes": {
            "quantidade": null,
            "especie": null,
            "marca": null,
            "numeracao": null,
            "peso_liquido": null,
            "peso_bruto": null
        }
    },
    "cobranca": {
        "fatura": {
            "numero": null,
            "valor_original": null,
            "valor_desconto": null,
            "valor_liquido": null
        },
        "duplicatas": []
    },
    "informacoes_adicionais": {
        "info_fisco": null,
        "info_complementar": null
    },
    "resumo_geral_ia": null
  }
}

REGRAS CRÍTICAS PARA EXTRAÇÃO:
1.  **Estrutura Obrigatória:** SEMPRE retorne a estrutura JSON completa definida acima. O campo "categoria" DEVE ser sempre "Nota Fiscal". Se um grupo inteiro (como "transporte" ou "cobranca") não estiver presente no documento, retorne o objeto do grupo com todos os seus campos internos como \`null\`.
2.  **Dados Prioritários:** Foque em extrair com precisão os campos listados na estrutura. Preencha o máximo de campos possível.
3.  **Tratamento de Campos Vazios:** Se a informação para um campo específico (string, número, data) não for encontrada no texto, o valor desse campo DEVE ser \`null\` (sem aspas). Para arrays como "itens" ou "duplicatas", se nenhum for encontrado, retorne um array vazio \`[]\`. NÃO omita nenhum campo da estrutura JSON.
4.  **Resumo Geral:** Gere um resumo conciso do propósito principal da nota fiscal (venda de produtos, prestação de serviço, etc.) no campo "resumo_geral_ia".
5.  **Instrução Adicional:** Considere esta instrução do usuário: "\${promptUsuario}". Se for "Nenhuma", ignore.
6.  **Ruído e Repetição:** O texto pode conter ruídos do OCR ou repetições. Concentre-se em extrair as informações relevantes e ignore o ruído.
7.  **Exemplo de Retorno Mínimo (Texto de Baixa Qualidade):** É a própria estrutura acima com todos os valores como \`null\` ou \`[]\`, exceto "categoria", e com um "resumo_geral_ia" indicando a impossibilidade de extração.

---
Texto da Nota Fiscal a ser Analisado:
"""
\${textoParaAnalise}
"""
---
Lembre-se: Sua resposta final DEVE ser APENAS o objeto JSON completo.
`;
