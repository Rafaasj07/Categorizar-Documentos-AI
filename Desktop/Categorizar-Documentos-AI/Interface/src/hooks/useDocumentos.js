/**
 * hooks/useDocumentos.js
 * * Função Principal:
 * Este é um "custom hook" do React para encapsular a lógica de upload e
 * análise de múltiplos documentos.
 * * Funcionalidades:
 * 1.  **Gerenciamento de Estado:** Controla os estados de carregando, erro,
 * progresso e os resultados do processamento.
 * 2.  **Lógica de Análise:** Itera sobre a lista de arquivos e envia cada um,
 * juntamente com o prompt do usuário, para o endpoint de categorização da API.
 * 3.  **Feedback de UI:** Atualiza mensagens de progresso e exibe os resultados
 * finais ou erros na interface.
 */

import { useState } from 'react';
// Importa a nova função de API que faz o upload direto para o backend
import { categorizarDocumentoComArquivo } from "../services/api";

export function useDocumentos() {
  // Armazena os resultados da análise de cada arquivo
  const [documentosInfo, setDocumentosInfo] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const [progresso, setProgresso] = useState('');

  // Função para processar a análise de uma lista de arquivos
  const analisarDocumento = async (promptUsuario, arquivos) => {
    // Validação inicial para garantir que há arquivos
    if (!arquivos || arquivos.length === 0) {
      setErro("É obrigatório enviar pelo menos um arquivo para análise.");
      return;
    }

    // Reseta os estados antes de iniciar um novo processo
    setCarregando(true);
    setErro(null);
    setDocumentosInfo([]);
    setProgresso('');

    const resultadosProcessamento = [];

    try {
      // Itera sobre cada arquivo para enviar individualmente para a API
      for (let i = 0; i < arquivos.length; i++) {
        const arquivo = arquivos[i];
        setProgresso(`Analisando ${i + 1} de ${arquivos.length}: "${arquivo.name}"`);
        
        // Chama a nova função da API que envia o arquivo e o prompt
        const resultadoDaApi = await categorizarDocumentoComArquivo(arquivo, promptUsuario);
        
        // Adiciona o resultado da API ao array de resultados para exibição
        resultadosProcessamento.push({
          nomeArquivo: arquivo.name,
          ...resultadoDaApi // Contém { categoria, metadados }
        });
      }
      
      setDocumentosInfo(resultadosProcessamento);
      setProgresso('Todos os documentos foram analisados com sucesso!');

    } catch (error) {
      console.error("Erro no processo de análise dos documentos:", error);
      setErro(error.message || "Não foi possível analisar um dos arquivos. Verifique o console.");
      setProgresso('Ocorreu um erro durante a análise.');
    } finally {
      setCarregando(false);
      // Limpa a mensagem de progresso após 5 segundos
      setTimeout(() => setProgresso(''), 5000);
    }
  };

  // Retorna os estados e a função para serem usados pelos componentes React
  return { documentosInfo, carregando, erro, progresso, analisarDocumento };
}
