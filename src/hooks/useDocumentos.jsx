import { useState } from 'react';
import { apiCategorizarComArquivo, uploadFileToS3 } from "/src/services/api.jsx";

export function useDocumentos() {
  // Armazena múltiplos resultados da análise
  const [documentosInfo, setDocumentosInfo] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  // Estado para mostrar progresso da análise
  const [progresso, setProgresso] = useState('');

  // Função para analisar vários arquivos sequencialmente
  const analisarDocumento = async (promptUsuario, arquivos) => {
    if (!arquivos || arquivos.length === 0) {
      setErro("É obrigatório enviar pelo menos um arquivo para análise.");
      return;
    }

    setCarregando(true);
    setErro(null);
    setDocumentosInfo([]); // Limpa resultados antigos
    setProgresso('');

    const resultadosProcessamento = []; // Para acumular resultados do upload e status

    try {
      // Loop para enviar cada arquivo individualmente
      for (let i = 0; i < arquivos.length; i++) {
        const arquivo = arquivos[i];
        setProgresso(`Preparando upload ${i + 1} de ${arquivos.length}: "${arquivo.name}"`);
        
        // 1. Obter URL pré-assinada para upload para o S3
        // apiCategorizarComArquivo agora retorna { uploadURL, s3Key, correlationId, ... }
        const { uploadURL, s3Key, correlationId } = await apiCategorizarComArquivo(arquivo.name, arquivo.type);
        setProgresso(`Realizando upload ${i + 1} de ${arquivos.length}: "${arquivo.name}"`);
        // 2. Fazer upload direto para S3 usando a URL pré-assinada
        await uploadFileToS3(uploadURL, arquivo, arquivo.type);
        console.log(`Upload do arquivo "${arquivo.name}" concluído para S3. Chave: ${s3Key}`);

        // Categorização é iniciada por evento S3 (SQS -> Lambda de análise)
        // Frontend apenas confirma o upload. 
        // Armazenar o s3Key ou correlationId para acompanhar o status do processamento no backend posteriormente.
         resultadosProcessamento.push({
          nomeArquivo: arquivo.name,
          s3Key: s3Key,
          correlationId: correlationId,
          status: 'Upload Concluído, Categorização em Andamento (assíncrono)'
        });
      }
      
      setDocumentosInfo(resultadosProcessamento); // Atualiza com os resultados do upload/disparo
      setProgresso('Todos os uploads concluídos. Processamento em andamento...');

    } catch (error) {
      console.error("Erro ao analisar os documentos", error);
            // Ajustar a mensagem de erro para o novo fluxo de upload
      const msgErro = error.response?.data?.message || "Não foi possível enviar um dos arquivos para o S3. Verifique o arquivo ou a conexão e tente novamente.";
      setErro(msgErro);
    } finally {
      setCarregando(false);
      setProgresso('');
    }
  };

  // Retorna estados e função para o componente consumir
  return { documentosInfo, carregando, erro, progresso, analisarDocumento };
}
