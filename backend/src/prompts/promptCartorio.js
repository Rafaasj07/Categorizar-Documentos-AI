export const promptCartorio = `
A sua tarefa consiste em apenas analisar o texto abaixo, que representa um **Documento de Cartório**, identificar automaticamente o tipo de ato e retornar um objeto JSON estruturado de forma completa.
A resposta DEVE ser APENAS o objeto JSON, sem nenhum texto, comentário ou explicação adicional antes ou depois dele.

DEFINIÇÃO GERAL:
Documentos de cartório (serviços notariais e de registro) são instrumentos públicos ou privados autenticados que formalizam atos jurídicos (Certidões de Nascimento/Casamento/Óbito, Escrituras, Procurações, Atas Notariais, Registros de Imóveis, Autenticações, etc.).

DETERMINE A CATEGORIA ESPECÍFICA E PREENCHA O JSON:
Analise o texto e defina o campo "categoria" com o tipo mais preciso:
- Se for Certidão de Nascimento, use "Certidão de Nascimento".
- Se for Certidão de Casamento, use "Certidão de Casamento".
- Se for Certidão de Óbito, use "Certidão de Óbito".
- Se for Escritura Pública (Compra e Venda, Doação, Inventário, Pacto Antenupcial), use "Escritura Pública".
- Se for Procuração Pública, use "Procuração Pública".
- Se for Ata Notarial, use "Ata Notarial".
- Se for Registro de Imóveis (Matrícula, Transcrição, Averbação), use "Registro Imobiliário".
- Se for Reconhecimento de Firma ou Autenticação de Cópia, use "Autenticação/Reconhecimento".
- Caso não se encaixe claramente, use "Outro Ato Cartorário".

Estrutura obrigatória do JSON de saída (use 'null' quando não encontrar; listas vazias quando apropriado):
{
  "categoria": "...", // Preencher conforme acima (Ex: "Certidão de Nascimento", "Escritura Pública")
  "metadados": {
    "tipo_ato_especifico": "...", // Detalhe adicional se houver (Ex: Compra e Venda, Doação, Reconhecimento por Semelhança) - pode ser null
    "cartorio_responsavel": {
      "nome_oficial": null,
      "comarca": null,
      "endereco": null,
      "oficial_responsavel": null, // Nome do tabelião ou registrador
      "codigo_cns": null
    },
    "numero_livro": null,
    "numero_folha": null,
    "numero_termo_ou_registro": null,
    "data_ato": "AAAA-MM-DD", // Data de lavratura/registro
    "data_emissao_documento": "AAAA-MM-DD", // Data de emissão da certidão/traslado
    "partes_envolvidas": [ // Lista de pessoas físicas ou jurídicas envolvidas
      // {
      //   "nome_razao_social": null,
      //   "cpf_cnpj": null,
      //   "qualificacao": null, // Ex: Outorgante, Outorgado, Comprador, Vendedor, Registrando, Pai, Mãe, Nubente, Falecido
      //   "estado_civil": null,
      //   "nacionalidade": null,
      //   "profissao": null,
      //   "endereco": null
      // }
    ],
    "objeto_principal": null, // Breve descrição do objeto do ato (Ex: Compra de imóvel Matrícula X, Nascimento de Y, Procuração para fins Z)
    "valor_negocio": null, // Se aplicável (Ex: Valor da venda, valor da causa)
    "selo_digital_ou_fisico": null, // Número do selo de fiscalização, se houver
    "dados_imovel": { // Preencher se for ato imobiliário
        "matricula": null,
        "endereco_completo": null,
        "descricao_imovel": null
    },
    "observacoes_averbacoes": null, // Outras informações relevantes, averbações, etc.
    "resumo_geral_ia": null // Frase curta explicando categoria, partes principais e data
  }
}

REGRAS GERAIS:
1. Sempre retorne o JSON completo da estrutura definida acima.
2. Campos não encontrados devem ser retornados como \`null\`. Listas sem elementos devem ser \`[]\`.
3. Datas devem seguir o formato ISO (AAAA-MM-DD), se possível. Caso contrário, use o formato encontrado. Se não houver data, use \`null\`.
4. O campo 'resumo_geral_ia' deve conter uma frase curta explicando a categoria do ato, as partes principais (se houver) e a data do ato.
5. Considere a instrução adicional do usuário: \${promptUsuario}. Se for "Nenhuma", ignore.
6. Ignore ruídos de OCR, selos, assinaturas e priorize os dados estruturados do ato. Extraia nomes completos, CPFs/CNPJs, datas e números de registro/livro/folha com precisão.

Texto do Documento de Cartório a ser analisado:
\${textoParaAnalise}

Lembre-se: sua resposta FINAL deve ser APENAS o objeto JSON completo.
`;