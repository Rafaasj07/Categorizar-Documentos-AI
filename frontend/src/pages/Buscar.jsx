import { useState, useEffect, useCallback } from 'react';
import { apiBuscarDocumentos, apiDownloadDocumento } from '../services/api';
import NavPadrao from '../components/NavPadrao';
import NavInferior from '../components/NavInferior';

// Define um atraso para a busca automática após o usuário parar de digitar.
const DEBOUNCE_DELAY = 500;

const Buscar = () => {
  // Gerencia o estado da página, como termo de busca, resultados, carregamento e paginação.
  const [termoBusca, setTermoBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [downloading, setDownloading] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [pageTokens, setPageTokens] = useState([null]);
  const [currentPage, setCurrentPage] = useState(0);

  // Função para buscar os documentos na API com base nos filtros atuais.
  const fetchDocumentos = useCallback(async (token, isNewSearch) => {
    setCarregando(true);
    setErro('');
    try {
      const params = {
        termo: termoBusca,
        sortOrder,
        limit: 10,
        nextToken: token,
      };
      const data = await apiBuscarDocumentos(params);
      setResultados(data.documentos || []);

      // Atualiza os tokens de paginação com base nos resultados da busca.
      if (isNewSearch) {
        setPageTokens([null, data.nextToken]);
        setCurrentPage(0);
      } else if (data.nextToken && currentPage === pageTokens.length - 1) {
        setPageTokens(prev => [...prev, data.nextToken]);
      }

    } catch (err) {
      setErro('Falha ao carregar documentos. Tente novamente mais tarde.');
      setResultados([]);
    } finally {
      setCarregando(false);
    }
  }, [termoBusca, sortOrder]);

  // Efeito que dispara a busca automaticamente (com debounce) quando os filtros mudam.
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchDocumentos(null, true);
    }, DEBOUNCE_DELAY);
    return () => clearTimeout(handler);
  }, [fetchDocumentos]);

  // Lida com o clique no botão de download de um documento.
  const handleDownload = async (doc) => {
    setDownloading(doc.doc_uuid); // Ativa o estado de "baixando".
    try {
      // Pede à API um link de download seguro e temporário.
      const url = await apiDownloadDocumento(doc.bucketName, doc.minioKey);
      window.open(url, '_blank'); // Abre o link para iniciar o download.
    } catch (err) {
      setErro('Não foi possível gerar o link de download.');
    } finally {
      setDownloading(null); // Desativa o estado de "baixando".
    }
  };

  // Funções para controlar a navegação entre as páginas de resultados.
  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    if (nextPage < pageTokens.length && pageTokens[nextPage] !== null) {
      setCurrentPage(nextPage);
      fetchDocumentos(pageTokens[nextPage], false);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchDocumentos(pageTokens[prevPage], false);
    }
  };

  // Determina se o botão "Próximo" deve estar desabilitado.
  const isNextDisabled = !pageTokens[currentPage + 1] || carregando;

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

        {erro && <p className="text-red-500 text-center">{erro}</p>}

        {/* Seção que exibe a lista de resultados da busca. */}
        <div className="space-y-4">
          {carregando && <p className="text-gray-400 text-center">Carregando documentos...</p>}

          {!carregando && resultados.length === 0 && (
            <p className="text-gray-400 text-center">Nenhum documento encontrado.</p>
          )}

          {/* Itera sobre os resultados e renderiza um card para cada documento. */}
          {resultados.map((doc) => (
            <div
              key={doc.doc_uuid}
              className="relative bg-gray-800 p-4 rounded-lg border border-gray-700 transition-transform hover:scale-[1.02] duration-300"
            >
              <button
                onClick={() => handleDownload(doc)}
                disabled={downloading === doc.doc_uuid}
                className="absolute top-4 right-4 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-wait"
                title="Baixar documento"
              >
                {downloading === doc.doc_uuid ? (
                  <i className="bx bx-loader-alt animate-spin text-2xl"></i>
                ) : (
                  <i className="bx bxs-download text-2xl"></i>
                )}
              </button>
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

export default Buscar;