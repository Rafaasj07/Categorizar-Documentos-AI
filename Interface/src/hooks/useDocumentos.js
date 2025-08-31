// Importa o hook 'useState' do React para gerenciar estados no componente.
import { useState } from 'react';
// Importa a função da API responsável por enviar o arquivo para categorização.
import { apiCategorizarComArquivo } from '../services/api';

// Define e exporta um "hook" customizado para encapsular a lógica de análise de documentos.
export function useDocumentos() {
  // Estado para armazenar os resultados da análise de múltiplos documentos.
  const [documentosInfo, setDocumentosInfo] = useState([]);
  // Estado para controlar a exibição de loading (carregamento).
  const [carregando, setCarregando] = useState(false);
  // Estado para armazenar qualquer mensagem de erro que ocorra.
  const [erro, setErro] = useState(null);
  // Estado para armazenar e exibir a mensagem de progresso da análise.
  const [progresso, setProgresso] = useState('');

  // Função assíncrona para analisar os arquivos enviados pelo usuário.
  const analisarDocumento = async (promptUsuario, arquivos) => {
    // Valida se algum arquivo foi realmente enviado.
    if (!arquivos || arquivos.length === 0) {
      setErro("É obrigatório enviar pelo menos um arquivo para análise.");
      return;
    }

    // Inicia o processo: ativa o loading, limpa erros e resultados antigos.
    setCarregando(true);
    setErro(null);
    setDocumentosInfo([]);
    setProgresso('');

    try {
      // Itera sobre cada arquivo para enviá-los para análise um por um.
      for (let i = 0; i < arquivos.length; i++) {
        const arquivo = arquivos[i];
        // Atualiza a mensagem de progresso para o usuário.
        setProgresso(`Analisando ${i + 1} de ${arquivos.length}: "${arquivo.name}"`);
        
        // Chama a função da API que envia o arquivo e o prompt para o backend.
        const respostaApi = await apiCategorizarComArquivo(promptUsuario, arquivo);
        
        // Adiciona o nome do arquivo ao objeto de resposta da API para identificação.
        const resultadoComNome = { ...respostaApi, nomeArquivo: arquivo.name };
        
        // Adiciona o novo resultado à lista, mantendo os resultados dos arquivos anteriores.
        setDocumentosInfo(prevInfo => [...prevInfo, resultadoComNome]);
      }
    } catch (error) {
      // Em caso de erro, exibe o erro no console e define uma mensagem amigável para o usuário.
      console.error("Erro ao analisar os documentos", error);
      const msgErro = error.response?.data?.erro || "Não foi possível analisar um dos documentos. Verifique o arquivo ou a conexão e tente novamente.";
      setErro(msgErro);
    } finally {
      // Ao final do processo (com ou sem erro), desativa o loading e limpa a mensagem de progresso.
      setCarregando(false);
      setProgresso('');
    }
  };

  // Retorna os estados e a função de análise para que possam ser usados pelos componentes.
  return { documentosInfo, carregando, erro, progresso, analisarDocumento };
}