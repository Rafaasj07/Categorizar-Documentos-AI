import { useState, useEffect, useCallback } from 'react';
import { apiBuscarDocumentos } from '../services/api';
import NavPadrao from '../components/NavPadrao';
import NavInferior from '../components/NavInferior';
import Modal from '../components/Modal';
import InfoDocumento from '../components/info/InfoDocumento';

const DEBOUNCE_DELAY = 500;

const Buscar = () => {
  const [termoBusca, setTermoBusca] = useState('');
  const [resultados, setResultados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sortOrder, setSortOrder] = useState('desc');

  const [pageTokens, setPageTokens] = useState([null]);
  const [currentPage, setCurrentPage] = useState(0);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Busca documentos na API e gerencia a lógica de tokens para paginação
  const fetchDocumentos = useCallback(async (token, isNewSearch) => {
    setCarregando(true);
    setErro('');
    try {
      const params = { termo: termoBusca, sortOrder, limit: 10, nextToken: token };
      const data = await apiBuscarDocumentos(params);
      setResultados(data.documentos || []);

      if (isNewSearch) {
        setPageTokens([null, data.nextToken]);
        setCurrentPage(0);
      } else if (data.nextToken && currentPage === pageTokens.length - 1) {
        setPageTokens(prev => [...prev, data.nextToken]);
      }

    } catch (err) {
      setErro('Falha ao carregar documentos.');
      setResultados([]);
      if (isNewSearch) {
        setPageTokens([null]);
        setCurrentPage(0);
      }
    } finally {
      setCarregando(false);
    }
  }, [termoBusca, sortOrder, currentPage, pageTokens.length]);

  // Controla disparo da busca: imediato se vazio ou com debounce ao digitar
  useEffect(() => {
    if (termoBusca === '') {
      fetchDocumentos(null, true);
    }

    const handler = setTimeout(() => {
      if (termoBusca !== '') {
        fetchDocumentos(null, true);
      }
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(handler);
  }, [termoBusca, sortOrder]);

  // Configura documento selecionado e abre visualização
  const handleOpenModal = (doc) => {
    if (doc) {
      setSelectedDoc(doc);
      setIsModalOpen(true);
    } else {
      console.warn("Tentativa de abrir modal com documento nulo.");
      setErro("Não foi possível carregar os detalhes do documento.");
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoc(null);
  };

  // Navega para próxima página verificando existência de token
  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    if (nextPage < pageTokens.length && !carregando) {
      setCurrentPage(nextPage);
      fetchDocumentos(pageTokens[nextPage], false);
    }
  };

  // Retorna para página anterior se não estiver na primeira
  const handlePreviousPage = () => {
    if (currentPage > 0 && !carregando) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchDocumentos(pageTokens[prevPage], false);
    }
  };

  const isNextDisabled = (!pageTokens[currentPage + 1] && pageTokens[currentPage + 1] !== null) || carregando;


  return (
    <div className="flex flex-col items-center min-h-screen bg-black p-4 pt-24 md:pt-32 pb-24 md:pb-4">
      <NavPadrao />
      <NavInferior />

      <div className="w-full max-w-4xl pt-6 md:pt-0">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-white">
          Buscar Documentos
        </h1>

        <div className="flex flex-col md:flex-row gap-2 mb-8">
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            disabled={carregando}
            className="flex-grow shadow-inner appearance-none border border-gray-700 rounded-lg py-3 px-4 bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Buscar por nome, categoria ou resumo..."
          />
          <div className="relative flex-grow-0">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              disabled={carregando}
              className="appearance-none shadow-inner border border-gray-700 rounded-lg py-3 pl-4 pr-10 bg-gray-800 text-gray-200 focus:outline-none w-full md:w-auto"
            >
              <option value="desc">Mais recentes</option>
              <option value="asc">Mais antigos</option>
            </select>
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">▼</span>
          </div>
        </div>

        {erro && <p className="text-red-500 text-center mb-4">{erro}</p>}

        <div className="space-y-4">
          {carregando && <p className="text-gray-400 text-center py-8">Carregando...</p>}
          {!carregando && resultados.length === 0 && (
            <p className="text-gray-500 text-center py-8">Nenhum documento encontrado.</p>
          )}

          {resultados.map((doc) => (
            <div
              key={doc.doc_uuid}
              className="relative bg-gray-800 p-4 rounded-lg border border-gray-700 transition-transform hover:scale-[1.02] duration-300 cursor-pointer"
              onClick={() => handleOpenModal(doc)}
            >
              <h3 className="text-xl font-bold text-indigo-400 pr-10 break-all">{doc.fileName}</h3>
              <p className="text-sm text-gray-400 mb-2">
                Categoria: <span className="font-semibold">{doc.resultadoIa?.categoria || 'N/A'}</span>
              </p>
              <p className="text-gray-300 text-sm">
                <strong>Resumo:</strong> {doc.resultadoIa?.metadados?.resumo || doc.resultadoIa?.metadados?.resumo_geral_ia || 'Não disponível'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Data de Upload: {new Date(doc.uploadedTimeStamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {(!carregando && (resultados.length > 0 || currentPage > 0)) && (
          <div className="flex justify-between items-center mt-8">
            <button onClick={handlePreviousPage} disabled={currentPage === 0 || carregando} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed">
              Anterior
            </button>
            <span className="text-gray-400">Página {currentPage + 1}</span>
            <button onClick={handleNextPage} disabled={isNextDisabled || carregando} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed">
              Próximo
            </button>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`Detalhes: ${selectedDoc?.fileName || ''}`}>
        {selectedDoc ? (
          <InfoDocumento doc={selectedDoc} />
        ) : (
          <p className="text-gray-400 p-4">
            Nenhum documento selecionado.
          </p>
        )}
      </Modal>

    </div>
  );
};

export default Buscar;