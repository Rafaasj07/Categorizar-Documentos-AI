// Importa os hooks do React para gerenciar estado e ciclo de vida.
import { useState, useEffect, useCallback } from 'react';
// Importa as funções da API para buscar documentos e obter links de download.
import { apiBuscarDocumentos, apiDownloadDocumento } from '../services/api';
// Importa os componentes de navegação.
import NavPadrao from '../components/NavPadrao';
import NavInferior from '../components/NavInferior';

// Define um atraso para a busca automática após o usuário parar de digitar.
const DEBOUNCE_DELAY = 500;

// Define o componente da página de Busca.
const Buscar = () => {
  // --- Estados do componente ---
  // Armazena o texto digitado pelo usuário no campo de busca.
  const [termoBusca, setTermoBusca] = useState('');
  // Armazena a lista de documentos encontrados.
  const [resultados, setResultados] = useState([]);
  // Controla se a página está carregando dados.
  const [carregando, setCarregando] = useState(true);
  // Armazena mensagens de erro.
  const [erro, setErro] = useState('');
  // Controla o estado de download de um arquivo específico.
  const [downloading, setDownloading] = useState(null);
  // Armazena a ordem de sortimento dos resultados.
  const [sortOrder, setSortOrder] = useState('desc');
  // Armazena os "tokens" para navegar entre as páginas de resultados.
  const [pageTokens, setPageTokens] = useState([null]);
  // Armazena o número da página atual.
  const [currentPage, setCurrentPage] = useState(0);

  /**
   * Função principal para buscar os documentos na API.
   * Usa 'useCallback' para otimização, evitando recriações desnecessárias.
   */
  const fetchDocumentos = useCallback(async (token, isNewSearch) => {
    setCarregando(true);
    setErro('');
    try {
      // Monta os parâmetros para a chamada da API.
      const params = {
        termo: termoBusca,
        sortOrder,
        limit: 10,
        nextToken: token,
      };
      // Chama a API e armazena os resultados.
      const data = await apiBuscarDocumentos(params);
      setResultados(data.documentos || []);

      // Gerencia os tokens de paginação.
      if (isNewSearch) {
        // Se for uma nova busca, reseta a paginação.
        setPageTokens([null, data.nextToken]);
        setCurrentPage(0);
      } else if (data.nextToken && currentPage === pageTokens.length - 1) {
        // Se houver uma próxima página, adiciona o novo token.
        setPageTokens(prev => [...prev, data.nextToken]);
      }

    } catch (err) {
      setErro('Falha ao carregar documentos. Tente novamente mais tarde.');
      setResultados([]);
    } finally {
      setCarregando(false);
    }
  }, [termoBusca, sortOrder]); // A função será recriada se 'termoBusca' ou 'sortOrder' mudarem.

  // Efeito que dispara a busca automaticamente (com debounce) sempre que os filtros mudam.
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchDocumentos(null, true);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(handler); // Limpa o timer anterior.
  }, [fetchDocumentos]);

  // Função para lidar com o clique no botão de download.
  const handleDownload = async (doc) => {
    setDownloading(doc.doc_uuid); // Ativa o estado de "baixando" para este documento.
    try {
      // Pede à API um link de download seguro e temporário.
      const url = await apiDownloadDocumento(doc.bucketName, doc.s3Key);
      // Abre o link em uma nova aba para iniciar o download.
      window.open(url, '_blank');
    } catch (err) {
      setErro('Não foi possível gerar o link de download.');
    } finally {
      setDownloading(null); // Desativa o estado de "baixando".
    }
  };

  // Funções para controlar a navegação entre páginas.
  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    // Verifica se a próxima página existe antes de navegar.
    if (nextPage < pageTokens.length && pageTokens[nextPage] !== null) {
      setCurrentPage(nextPage);
      fetchDocumentos(pageTokens[nextPage], false);
    }
  };

  const handlePreviousPage = () => {
    // Verifica se não está na primeira página.
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchDocumentos(pageTokens[prevPage], false);
    }
  };

  // Determina se o botão "Próximo" deve estar desabilitado.
  const isNextDisabled = !pageTokens[currentPage + 1] || carregando;

  // Retorna a estrutura JSX (HTML) da página.
  return (
    <div className="flex flex-col items-center min-h-screen bg-black p-4 pt-24 md:pt-32 pb-24 md:pb-4">
      <NavPadrao />
      <NavInferior />

      <div className="w-full max-w-4xl pt-6 md:pt-0">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-white">
          Buscar Documentos
        </h1>

        {/* Seção com os campos de filtro de busca. */}
        <div className="flex flex-col md:flex-row gap-2 mb-8">
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="flex-grow shadow-inner appearance-none border border-gray-700 rounded-lg py-3 px-4 bg-gray-800 text-gray-200 focus:outline-none"
            placeholder="Buscar por nome, categoria ou resumo..."
          />

          {/* Campo para selecionar a ordem dos resultados. */}
          <div className="relative flex-grow md:flex-grow-0">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="appearance-none shadow-inner border border-gray-700 rounded-lg py-3 pl-4 pr-10 bg-gray-800 text-gray-200 focus:outline-none w-full"
            >
              <option value="desc">Mais recentes</option>
              <option value="asc">Mais antigos</option>
            </select>
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">▼</span>
          </div>
        </div>

        {/* Exibe a mensagem de erro, se houver. */}
        {erro && <p className="text-red-500 text-center">{erro}</p>}

        {/* Seção que exibe a lista de resultados da busca. */}
        <div className="space-y-4">
          {/* Mostra uma mensagem de "Carregando" enquanto a busca é feita. */}
          {carregando && <p className="text-gray-400 text-center">Carregando documentos...</p>}

          {/* Mostra uma mensagem se a busca terminar e não encontrar nada. */}
          {!carregando && resultados.length === 0 && (
            <p className="text-gray-400 text-center">Nenhum documento encontrado.</p>
          )}

          {/* Itera sobre os resultados e renderiza um card para cada documento. */}
          {resultados.map((doc) => (
            <div
              key={doc.doc_uuid}
              className="relative bg-gray-800 p-4 rounded-lg border border-gray-700 transition-transform hover:scale-[1.02] duration-300"
            >
              {/* Botão de download para o documento. */}
              <button
                onClick={() => handleDownload(doc)}
                disabled={downloading === doc.doc_uuid}
                className="absolute top-4 right-4 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-wait"
                title="Baixar documento"
              >
                {/* Mostra um ícone de spinner enquanto o link de download é gerado. */}
                {downloading === doc.doc_uuid ? (
                  <i className="bx bx-loader-alt animate-spin text-2xl"></i>
                ) : (
                  <i className="bx bxs-download text-2xl"></i>
                )}
              </button>
              {/* Informações do documento. */}
              <h3 className="text-xl font-bold text-indigo-400 pr-10 break-all">{doc.fileName}</h3>
              <p className="text-sm text-gray-400 mb-2">
                Categoria: <span className="font-semibold">{doc.resultadoIa?.categoria || 'N/A'}</span>
              </p>
              <p className="text-gray-300">
                <strong>Resumo:</strong> {doc.resultadoIa?.metadados?.resumo || 'Não disponível'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Data de Upload: {new Date(doc.uploadedTimeStamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* Seção com os botões de paginação (Anterior/Próximo). */}
        {(resultados.length > 0 || currentPage > 0) && (
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0 || carregando}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            <span className="text-gray-400">Página {currentPage + 1}</span>
            <button
              onClick={handleNextPage}
              disabled={isNextDisabled || carregando}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
              Próximo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// Exporta o componente para ser usado em outras partes da aplicação.
export default Buscar;