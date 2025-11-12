import { useState } from 'react';
import { apiCategorizarComArquivo } from '../services/api';

/**
 * Hook customizado para gerenciar o estado e a lógica de análise de documentos.
 * Retorna estados (info, carregando, erro, progresso) e a função de análise.
 */
export function useDocumentos() {
  const [documentosInfo, setDocumentosInfo] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [progresso, setProgresso] = useState('');

  /**
   * Envia arquivos para a API de análise sequencialmente, um por um.
   * Atualiza os estados de progresso, resultado e erro.
   */
  const analisarDocumento = async (contextoSelecionado, subContextoSelecionado, promptUsuario, arquivos) => {
    // Validação inicial para garantir que arquivos foram enviados.
    if (!arquivos || arquivos.length === 0) {
      setErro("É obrigatório enviar pelo menos um arquivo.");
      return;
    }
    // Validação específica para o contexto 'Gestão Educacional'.
    if (contextoSelecionado === 'Gestão Educacional' && !subContextoSelecionado) {
        setErro("Selecione o tipo específico de documento educacional.");
        return;
    }

    // Reseta os estados antes de iniciar um novo lote de análise.
    setCarregando(true);
    setErro(null);
    setDocumentosInfo([]);
    setProgresso('');

    try {
      // Itera sobre cada arquivo enviado para analisá-los um por um.
      for (let i = 0; i < arquivos.length; i++) {
        const arquivo = arquivos[i];

        // Atualiza a mensagem de progresso para o usuário.
        const subContextoInfo = contextoSelecionado === 'Gestão Educacional' && subContextoSelecionado ? ` / ${subContextoSelecionado}` : '';
        setProgresso(`Analisando ${i + 1} de ${arquivos.length}: "${arquivo.name}" (Contexto: ${contextoSelecionado}${subContextoInfo})`);

       // Chama a API de categorização para o arquivo atual.
        const respostaApi = await apiCategorizarComArquivo(contextoSelecionado, subContextoSelecionado, promptUsuario, arquivo);

        // Adiciona o resultado completo ao estado da lista de documentos.
        setDocumentosInfo(prevInfo => [...prevInfo, respostaApi]);
      }
    } catch (error) {
      // Captura e define o estado de erro se a API falhar.
      console.error("Erro ao analisar documentos:", error);
      const msgErro = error.response?.data?.erro || `Falha ao analisar "${arquivos[documentosInfo.length]?.name || 'documento'}".`;
      setErro(msgErro);
    } finally {
      // Limpa os estados de carregamento e progresso ao finalizar (com ou sem erro).
      setCarregando(false);
      setProgresso('');
    }
  };

  // Retorna os estados e a função para o componente que usar o hook.
  return { documentosInfo, carregando, erro, progresso, analisarDocumento };
}