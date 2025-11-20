import { useState } from 'react';
import { apiCategorizarComArquivo } from '../services/api';

// Gerencia estado e lógica de análise sequencial de documentos
export function useDocumentos() {
  const [documentosInfo, setDocumentosInfo] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [progresso, setProgresso] = useState('');

  // Processa a lista de arquivos, enviando um por um para análise
  const analisarDocumento = async (contextoSelecionado, subContextoSelecionado, promptUsuario, arquivos) => {
    // Valida upload mínimo e subcontexto obrigatório para Gestão Educacional
    if (!arquivos || arquivos.length === 0) {
      setErro("É obrigatório enviar pelo menos um arquivo.");
      return;
    }
    if (contextoSelecionado === 'Gestão Educacional' && !subContextoSelecionado) {
      setErro("Selecione o tipo específico de documento educacional.");
      return;
    }

    setCarregando(true);
    setErro(null);
    setDocumentosInfo([]);
    setProgresso('');

    try {
      // Itera sequencialmente sobre os arquivos para envio individual
      for (let i = 0; i < arquivos.length; i++) {
        const arquivo = arquivos[i];

        const subContextoInfo = contextoSelecionado === 'Gestão Educacional' && subContextoSelecionado ? ` / ${subContextoSelecionado}` : '';
        setProgresso(`Analisando ${i + 1} de ${arquivos.length}: "${arquivo.name}" (Contexto: ${contextoSelecionado}${subContextoInfo})`);

        // Envia para API e aguarda categorização da IA
        const respostaApi = await apiCategorizarComArquivo(contextoSelecionado, subContextoSelecionado, promptUsuario, arquivo);

        setDocumentosInfo(prevInfo => [...prevInfo, respostaApi]);
      }
    } catch (error) {
      console.error("Erro ao analisar documentos:", error);
      const msgErro = error.response?.data?.erro || `Falha ao analisar "${arquivos[documentosInfo.length]?.name || 'documento'}".`;
      setErro(msgErro);
    } finally {
      setCarregando(false);
      setProgresso('');
    }
  };

  return { documentosInfo, carregando, erro, progresso, analisarDocumento };
}