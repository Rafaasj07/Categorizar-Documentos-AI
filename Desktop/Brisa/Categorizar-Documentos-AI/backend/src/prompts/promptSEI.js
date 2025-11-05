export const promptSEI = `
A sua tarefa consiste em apenas analisar o texto abaixo, que representa um **Documento do Sistema Eletrônico de Informações (SEI)**, identificar automaticamente o tipo de documento e retornar um objeto JSON estruturado de forma completa.
A resposta DEVE ser APENAS o objeto JSON, sem nenhum texto, comentário ou explicação adicional antes ou depois dele.

DEFINIÇÃO GERAL:
Documentos do SEI são registros oficiais gerados ou tramitados dentro da plataforma SEI (Ofícios, Despachos, Memorandos, Pareceres, Atas, Termos, Portarias, etc.).

DETERMINE A CATEGORIA ESPECÍFICA E PREENCHA O JSON:
Analise o texto e defina o campo "categoria" com o tipo mais preciso:
- Se contiver "Ofício", "Ofício Circular", use "Ofício SEI".
- Se contiver "Despacho", use "Despacho SEI".
- Se contiver "Memorando", "Memorando Circular", use "Memorando SEI".
- Se contiver "Parecer", "Nota Técnica", use "Parecer/Nota Técnica SEI".
- Se contiver "Ata de Reunião", use "Ata SEI".
- Se contiver "Termo", "Contrato", "Convênio", use "Termo/Contrato/Convênio SEI".
- Se contiver "Portaria", use "Portaria SEI".
- Caso não se encaixe claramente ou seja identificado como "Minuta", use "Outro Documento SEI".

Estrutura obrigatória do JSON de saída (use 'null' quando não encontrar; listas vazias quando apropriado):
{
  "categoria": "...", // Preencher conforme acima (Ex: "Ofício SEI", "Despacho SEI")
  "metadados": {
    "numero_documento": null, // Ex: Ofício nº 123/2025/SGG, Despacho Nº 180/2025/SEAD/GEPS-21242
    "numero_sei": null, // Número de identificação interno do documento no SEI (Ex: 81279714)
    "numero_processo_sei": null, // Número do processo ao qual o documento pertence (Ex: 202500005035433)
    "orgao_emissor": null, // Órgão ou unidade que gerou o documento (Ex: SECRETARIA DE ESTADO DA ADMINISTRAÇÃO / GERÊNCIA DE PROCESSOS E SISTEMAS DE COMPRAS)
    "data_documento": "AAAA-MM-DD", // Data principal do documento
    "destinatario": null, // A quem o documento é endereçado (se aplicável, Ex: "Aos titulares das Unidades Básicas...")
    "interessado": null, // Interessado no processo/documento (se houver)
    "assunto": null, // Assunto principal do documento
    "signatarios": [ // Lista de pessoas que assinaram eletronicamente
      // {
      //   "nome": null,
      //   "cargo": null,
      //   "data_assinatura": "AAAA-MM-DDTHH:mm" // Se disponível
      // }
    ],
    "codigo_verificador": null, // Código para verificação de autenticidade
    "codigo_crc": null, // Código CRC para verificação
    "url_verificacao": null, // URL para conferir autenticidade
    "referencia": null, // Documentos ou processos referenciados
    "resumo_geral_ia": null // Frase curta explicando categoria, número, órgão emissor e assunto principal
  }
}

REGRAS GERAIS:
1. Sempre retorne o JSON completo da estrutura definida acima.
2. Campos não encontrados devem ser retornados como \`null\`. Listas sem elementos devem ser \`[]\`.
3. Datas devem seguir o formato ISO (AAAA-MM-DD), se possível. Se houver hora, inclua (AAAA-MM-DDTHH:mm). Caso contrário, use o formato encontrado. Se não houver data, use \`null\`.
4. O campo 'resumo_geral_ia' deve conter uma frase curta explicando a categoria, número (se houver), órgão emissor e o assunto principal.
5. Considere a instrução adicional do usuário: \${promptUsuario}. Se for "Nenhuma", ignore.
6. Foque na extração dos cabeçalhos, rodapés e informações estruturadas típicas do SEI (números, datas, órgãos, assinaturas, códigos de verificação). Ignore o corpo principal do texto se for muito longo, priorizando a estrutura administrativa. Extraia o assunto de forma concisa.
7. O campo 'numero_documento' deve conter a identificação formal (Ex: "Ofício Circular nº 287/2025/SEAD"), enquanto 'numero_sei' é o identificador numérico interno (Ex: "81232529").

Texto do Documento SEI a ser analisado:
\${textoParaAnalise}

Lembre-se: sua resposta FINAL deve ser APENAS o objeto JSON completo.
`;