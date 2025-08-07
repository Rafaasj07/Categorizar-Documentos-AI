import { useState } from 'react';
import { apiCategorizarComArquivo } from '../services/api';

// Hook personalizado para lidar com o envio e análise de documentos PDF
export function useDocumentos() {
  // Armazena as informações retornadas pela API após a análise
  const [documentoInfo, setDocumentoInfo] = useState(null);
  
  // Indica se a requisição está em andamento
  const [carregando, setCarregando] = useState(false);

  // Armazena mensagens de erro (ex: arquivo inválido, erro de rede, etc.)
  const [erro, setErro] = useState(null);

  // Função que envia o PDF + prompt para a API e atualiza os estados com a resposta
  const analisarDocumento = async (promptUsuario, arquivo) => {
    // Validação básica: impede envio sem arquivo
    if (!arquivo) {
      setErro("É obrigatório enviar um arquivo para análise.");
      return;
    }

    // Limpa os estados antes de iniciar nova requisição
    setCarregando(true);
    setErro(null);
    setDocumentoInfo(null);

    try {
      // Chama a API que envia o PDF e o prompt para a IA (via backend)
      const respostaApi = await apiCategorizarComArquivo(promptUsuario, arquivo);

      // Armazena o resultado retornado pela IA
      setDocumentoInfo(respostaApi);

    } catch (error) {
      console.error("Erro ao analisar o documento", error);

      // Tenta extrair a mensagem de erro da resposta da API, se existir
      const msgErro = error.response?.data?.erro
        || "Não foi possível analisar o documento. Verifique o arquivo ou a conexão e tente novamente.";

      // Atualiza o estado de erro
      setErro(msgErro);
      setDocumentoInfo(null);
    } finally {
      // Finaliza o carregamento, independente do sucesso ou falha
      setCarregando(false);
    }
  };

  // Expõe os estados e a função para o componente que usar esse hook
  return { documentoInfo, carregando, erro, analisarDocumento };
}
