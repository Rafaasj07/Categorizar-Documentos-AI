import { useState, useEffect, useCallback } from 'react';
import { apiBuscarDocumentos, apiDownloadDocumento } from '../services/api';
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
  const [downloading, setDownloading] = useState(null);
  const [sortOrder, setSortOrder] = useState('desc');
  const [pageTokens, setPageTokens] = useState([null]);
  const [currentPage, setCurrentPage] = useState(0);

  // Estados para controlar o modal de detalhes do documento.
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [selectedDocInfo, setSelectedDocInfo] = useState(null); 

  /**
   * Busca documentos na API com base nos filtros e token de paginação.
   * @param {string|null} token - O token da página a ser buscada.
   * @param {boolean} isNewSearch - Indica se a busca deve resetar a paginação.
   */
  const fetchDocumentos = useCallback(async (token, isNewSearch) => {
    setCarregando(true);
    setErro('');
    try {
      const params = { termo: termoBusca, sortOrder, limit: 10, nextToken: token };
      // Chama a API e armazena os resultados completos.
      const data = await apiBuscarDocumentos(params);
      setResultados(data.documentos || []);

      // Gerencia os tokens de paginação para buscas novas ou contínuas.
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

  // Efeito que dispara a busca (com debounce) quando o termo ou a ordenação mudam.
  useEffect(() => {
     // Busca inicial (sem debounce) ou ao limpar a busca.
     if (termoBusca === '') {
         fetchDocumentos(null, true);
     }
     // Define o debounce para o termo de busca.
     const handler = setTimeout(() => {
         if (termoBusca !== '') {
            // Executa a busca (resetando a página) após o delay.
            fetchDocumentos(null, true);
         }
     }, DEBOUNCE_DELAY);
     return () => clearTimeout(handler);
  }, [termoBusca, sortOrder]); 

  // Inicia o download de um documento.
  const handleDownload = async (doc, event) => {
    event.stopPropagation(); // Impede que o clique no botão abra o modal.
    setDownloading(doc.doc_uuid);
    try {
      // Chama a API de download e cria um link temporário para baixar o blob.
      const blob = await apiDownloadDocumento(doc);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setErro('Não foi possível realizar o download.');
    } finally {
      setDownloading(null);
    }
  };


  /**
   * Abre o modal e define os dados do documento selecionado.
   * @param {object} doc - O objeto completo do documento clicado.
   */
  const handleOpenModal = (doc) => {
    // Verifica se os metadados da IA existem antes de abrir.
    if (doc.resultadoIa && doc.resultadoIa.metadados) { 
      setSelectedDocInfo({
          ...doc.resultadoIa, 
          nomeArquivo: doc.fileName 
      });
      setIsModalOpen(true); 
    } else {
      console.warn("Documento sem metadados completos:", doc);
      setErro("Detalhes completos não disponíveis para este documento."); 
    }
  };

  // Fecha o modal e limpa o estado do documento selecionado.
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedDocInfo(null);
  };

  // Funções de navegação da paginação.
  const handleNextPage = () => { 
      const nextPage = currentPage + 1;
     if (nextPage < pageTokens.length && !carregando) {
         setCurrentPage(nextPage);
         fetchDocumentos(pageTokens[nextPage], false);
     }
  };
  const handlePreviousPage = () => { 
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

        {/* Barra de filtros (Busca por termo e Ordenação) */}
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
          {/* Feedback de carregamento */}
          {carregando && <p className="text-gray-400 text-center py-8">Carregando...</p>}

          {/* Feedback de "Nenhum resultado" */}
          {!carregando && resultados.length === 0 && (
            <p className="text-gray-500 text-center py-8">Nenhum documento encontrado.</p>
          )}

          {/* Mapeia e renderiza os cards de resultado */}
          {resultados.map((doc) => (
            // O card inteiro é clicável para abrir o modal de detalhes.
            <div
              key={doc.doc_uuid}
              className="relative bg-gray-800 p-4 rounded-lg border border-gray-700 transition-transform hover:scale-[1.02] duration-300 cursor-pointer" 
              onClick={() => handleOpenModal(doc)} // Define o clique para abrir o modal
            >
              {/* Botão de Download (com stopPropagation) */}
              <button
                onClick={(e) => handleDownload(doc, e)} // Impede o clique de abrir o modal
                disabled={downloading === doc.doc_uuid}
                className="absolute top-4 right-4 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-wait z-10" 
                title="Baixar documento"
              >
                {/* Mostra spinner durante o download */}
                {downloading === doc.doc_uuid ? <i className="bx bx-loader-alt animate-spin text-2xl"></i> : <i className="bx bxs-download text-2xl"></i>}
              </button>

              {/* Informações do card */}
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
      {/* O modal só é renderizado quando 'isModalOpen' é true */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`Detalhes: ${selectedDocInfo?.nomeArquivo || ''}`}>
          {/* Passa os dados do documento selecionado para o InfoDocumento */}
          {selectedDocInfo && <InfoDocumento info={selectedDocInfo} />}
      </Modal>

    </div>
  );
};

export default Buscar;