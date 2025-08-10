import { useState } from 'react';
import { apiCategorizarComArquivo } from '../services/api';

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

    try {
      // Loop para enviar cada arquivo individualmente
      for (let i = 0; i < arquivos.length; i++) {
        const arquivo = arquivos[i];
        setProgresso(`Analisando ${i + 1} de ${arquivos.length}: "${arquivo.name}"`);
        
        const respostaApi = await apiCategorizarComArquivo(promptUsuario, arquivo);
        
        // Anexa o nome do arquivo ao resultado para identificação
        const resultadoComNome = { ...respostaApi, nomeArquivo: arquivo.name };
        
        // Atualiza o estado com o novo resultado sem perder os anteriores
        setDocumentosInfo(prevInfo => [...prevInfo, resultadoComNome]);
      }
    } catch (error) {
      console.error("Erro ao analisar os documentos", error);
      const msgErro = error.response?.data?.erro || "Não foi possível analisar um dos documentos. Verifique o arquivo ou a conexão e tente novamente.";
      setErro(msgErro);
    } finally {
      setCarregando(false);
      setProgresso(''); // Reseta mensagem de progresso
    }
  };

  // Retorna estados e função para o componente consumir
  return { documentosInfo, carregando, erro, progresso, analisarDocumento };
}
