import { useState } from 'react';
import { apiCategorizarComArquivo } from '../services/api';

// Hook que encapsula a lógica de análise de documentos.
export function useDocumentos() {
  // Gerencia o estado dos resultados, carregamento, erros e progresso.
  const [documentosInfo, setDocumentosInfo] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [progresso, setProgresso] = useState('');

  // Função principal que orquestra a análise dos arquivos.
  const analisarDocumento = async (promptUsuario, arquivos) => {
    // Valida se pelo menos um arquivo foi enviado.
    if (!arquivos || arquivos.length === 0) {
      setErro("É obrigatório enviar pelo menos um arquivo para análise.");
      return;
    }

    // Prepara o estado para iniciar um novo processo de análise.
    setCarregando(true);
    setErro(null);
    setDocumentosInfo([]);
    setProgresso('');

    try {
      // Itera sobre cada arquivo para enviá-los individualmente para a API.
      for (let i = 0; i < arquivos.length; i++) {
        const arquivo = arquivos[i];
        // Atualiza a mensagem de progresso para o usuário.
        setProgresso(`Analisando ${i + 1} de ${arquivos.length}: "${arquivo.name}"`);
        
        // Envia o arquivo e a instrução do usuário para o backend.
        const respostaApi = await apiCategorizarComArquivo(promptUsuario, arquivo);
        
        // Adiciona o nome do arquivo ao resultado para exibição.
        const resultadoComNome = { ...respostaApi, nomeArquivo: arquivo.name };
        
        // Adiciona o novo resultado à lista de documentos analisados.
        setDocumentosInfo(prevInfo => [...prevInfo, resultadoComNome]);
      }
    } catch (error) {
      // Em caso de erro, formata e exibe uma mensagem amigável.
      console.error("Erro ao analisar os documentos", error);
      const msgErro = error.response?.data?.erro || "Não foi possível analisar um dos documentos. Verifique o arquivo ou a conexão e tente novamente.";
      setErro(msgErro);
    } finally {
      // Ao final do processo (com sucesso ou erro), limpa os estados de carregamento.
      setCarregando(false);
      setProgresso('');
    }
  };

  // Retorna os estados e a função para que os componentes possam usá-los.
  return { documentosInfo, carregando, erro, progresso, analisarDocumento };
}