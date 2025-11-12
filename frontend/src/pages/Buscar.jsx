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

  /**
   * Função de busca (com useCallback) que chama a API 
   * e gerencia os tokens de paginação.
   */
  const fetchDocumentos = useCallback(async (token, isNewSearch) => {
    setCarregando(true);
    setErro('');
    try {
      const params = { termo: termoBusca, sortOrder, limit: 10, nextToken: token };
      // Chama a API de busca de documentos.
      const data = await apiBuscarDocumentos(params);
      setResultados(data.documentos || []);

      // Gerencia os tokens de paginação.
      if (isNewSearch) {
        // Reseta a paginação em uma nova busca (filtro ou termo).
        setPageTokens([null, data.nextToken]);
        setCurrentPage(0);
      } else if (data.nextToken && currentPage === pageTokens.length - 1) {
        // Adiciona o token da próxima página ao avançar.
        setPageTokens(prev => [...prev, data.nextToken]);
      }

    } catch (err) {
      setErro('Falha ao carregar documentos.');
      setResultados([]);
      // Reseta a paginação em caso de erro em uma nova busca.
       if (isNewSearch) { 
         setPageTokens([null]);
         setCurrentPage(0);
       }
    } finally {
      setCarregando(false);
    }
  }, [termoBusca, sortOrder, currentPage, pageTokens.length]); // Dependências do useCallback

  // Efeito que dispara a busca (com debounce) ao alterar termo ou ordenação.
  useEffect(() => {
     // Busca imediata (sem debounce) se o campo for limpo.
     if (termoBusca === '') {
       fetchDocumentos(null, true);
     }
     
     // Configura o debounce para buscas ao digitar.
     const handler = setTimeout(() => {
       if (termoBusca !== '') {
          fetchDocumentos(null, true);
       }
     }, DEBOUNCE_DELAY);
     
     // Limpa o timeout anterior.
     return () => clearTimeout(handler);
  }, [termoBusca, sortOrder]); // Re-executa se o termo ou a ordem mudarem.

  // Abre o modal e define o documento selecionado.
  const handleOpenModal = (doc) => {
    if (doc) { 
      setSelectedDoc(doc); 
      setIsModalOpen(true); 
    } else {
      console.warn("Tentativa de abrir modal com documento nulo.");
      setErro("Não foi possível carregar os detalhes do documento."); 
    }
  };

  // Fecha o modal de detalhes.
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDoc(null);
  };

  // Funções de navegação da paginação.
  const handleNextPage = () => { 
     const nextPage = currentPage + 1;
     // Verifica se o token da próxima página já existe e não está carregando.
    if (nextPage < pageTokens.length && !carregando) {
       setCurrentPage(nextPage);
       fetchDocumentos(pageTokens[nextPage], false); 
    }
  };
  const handlePreviousPage = () => { 
     // Verifica se não está na primeira página e não está carregando.
     if (currentPage > 0 && !carregando) {
       const prevPage = currentPage - 1;
       setCurrentPage(prevPage);
       fetchDocumentos(pageTokens[prevPage], false); 
     }
  };

  // Verifica se o botão "Próximo" deve estar desabilitado.
  const isNextDisabled = (!pageTokens[currentPage + 1] && pageTokens[currentPage + 1] !== null) || carregando;


  return (
    <div className="flex flex-col items-center min-h-screen bg-black p-4 pt-24 md:pt-32 pb-24 md:pb-4">
      <NavPadrao />
      <NavInferior />

      <div className="w-full max-w-4xl pt-6 md:pt-0">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-white">
          Buscar Documentos
        </h1>

        {/* Barra de filtros (Busca e Ordenação) */}
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

        {/* Container da lista de resultados */}
        <div className="space-y-4">
          {/* Estados de loading ou "sem resultados" */}
          {carregando && <p className="text-gray-400 text-center py-8">Carregando...</p>}
          {!carregando && resultados.length === 0 && (
            <p className="text-gray-500 text-center py-8">Nenhum documento encontrado.</p>
          )}

          {/* Mapeia e renderiza os cards de resultado */}
          {resultados.map((doc) => (
            // Card clicável para abrir o modal
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

        {/* Controles de Paginação */}
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

      {/* Renderização do Modal de Detalhes */}
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