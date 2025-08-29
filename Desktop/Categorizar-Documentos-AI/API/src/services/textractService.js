import {
  TextractClient,
  StartDocumentTextDetectionCommand,
  GetDocumentTextDetectionCommand,
} from "@aws-sdk/client-textract";

const textractClient = new TextractClient({ region: process.env.AWS_REGION }); // Cliente Textract configurado

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms)); // Função para aguardar

/**
 * Extrai texto de documento PDF no S3 usando Textract (async job).
 * @param {string} bucketName - Nome do bucket S3
 * @param {string} s3Key - Chave do arquivo no S3
 * @returns {Promise<string>} Texto extraído do documento
 */

export async function extrairTextoComTextract(bucketName, s3Key) {
  // Inicia detecção de texto no documento no S3
  const startCommand = new StartDocumentTextDetectionCommand({
    DocumentLocation: { 
      S3Object: {
        Bucket: bucketName,
        Name: s3Key,
      },
    },
  });

  const startResponse = await textractClient.send(startCommand);
  const jobId = startResponse.JobId; // ID do job assíncrono

  if (!jobId) throw new Error("Falha ao iniciar o trabalho no Amazon Textract.");

  console.log(`[Textract] Trabalho iniciado com JobId: ${jobId}`);

  // Polling: espera o processamento terminar
  let jobStatus;
  do {
    await sleep(2000); // Espera 2 segundos entre tentativas
    const getCommand = new GetDocumentTextDetectionCommand({ JobId: jobId });
    const getResponse = await textractClient.send(getCommand);
    jobStatus = getResponse.JobStatus;

    console.log(`[Textract] Status do trabalho: ${jobStatus}`);

    if (jobStatus === "FAILED") throw new Error(`O trabalho do Textract falhou: ${getResponse.StatusMessage}`);
  } while (jobStatus === "IN_PROGRESS");

  console.log('[Textract] Trabalho concluído. Coletando resultados...');

  // Obtém todas as linhas de texto retornadas (paginadas)
  let textoCompleto = "";
  let nextToken = undefined;

  do {
    const getCommand = new GetDocumentTextDetectionCommand({ JobId: jobId, NextToken: nextToken });
    const getResponse = await textractClient.send(getCommand);

    // Filtra blocos do tipo linha e junta os textos
    const blocosDeTexto = getResponse.Blocks.filter(block => block.BlockType === 'LINE');
    if (blocosDeTexto.length > 0) {
        textoCompleto += blocosDeTexto.map(line => line.Text).join(' ') + ' ';
    }
    
    nextToken = getResponse.NextToken; // Para paginação
  } while (nextToken);

  return textoCompleto.trim(); // Retorna texto extraído limpo
}
