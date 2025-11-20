import { useState, useEffect, useCallback } from 'react';
import { apiBuscarDocumentos, apiApagarDocumento, apiGetFeedbackAggregate } from '../services/api';
import NavPadrao from '../components/NavPadrao';
import NavInferior from '../components/NavInferior';
import Modal from '../components/Modal';
import InfoDocumento from '../components/info/InfoDocumento';
import EditarMetadadosModal from '../components/EditarMetadadosModal';

const DEBOUNCE_DELAY = 500;

// Configuração visual para exibição de feedback
const feedbackLabels = {
  5: { label: 'Excelente', color: 'text-pink-400', emoji: '🤩' },
  4: { label: 'Bom', color: 'text-green-400', emoji: '😊' },
  3: { label: 'Neutro', color: 'text-yellow-400', emoji: '😐' },
  2: { label: 'Ruim', color: 'text-orange-400', emoji: '😕' },
  1: { label: 'Muito Ruim', color: 'text-red-400', emoji: '😡' },
};

const Admin = () => {
  const [documentos, setDocumentos] = useState([]);
  const [termoBusca, setTermoBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [processando, setProcessando] = useState(false);
  const [selecionados, setSelecionados] = useState(new Set());
  const [sortOrder, setSortOrder] = useState('desc');
  const [pageTokens, setPageTokens] = useState([null]);
  const [currentPage, setCurrentPage] = useState(0);

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [loadingFeedback, setLoadingFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState(null);
  const [feedbackError, setFeedbackError] = useState('');
  const [selectedDocName, setSelectedDocName] = useState('');

  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedDocForDetails, setSelectedDocForDetails] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Busca documentos na API aplicando filtros e gerenciando tokens de paginação
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
      setDocumentos(data.documentos || []);

      // Atualiza pilha de tokens para navegação
      if (isNewSearch) {
        setPageTokens([null, data.nextToken]);
        setCurrentPage(0);
      } else if (data.nextToken && currentPage === pageTokens.length - 1) {
        setPageTokens(prev => [...prev, data.nextToken]);
      }

    } catch (err) {
      setErro('Falha ao carregar documentos.');
      setDocumentos([]);
      if (isNewSearch) {
        setPageTokens([null]);
        setCurrentPage(0);
      }
    } finally {
      setCarregando(false);
    }
  }, [termoBusca, sortOrder, currentPage, pageTokens.length]);

  // Dispara busca com debounce ao alterar termo ou ordenação
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


  const handleSelect = (doc_uuid) => {
    const novosSelecionados = new Set(selecionados);
    if (novosSelecionados.has(doc_uuid)) {
      novosSelecionados.delete(doc_uuid);
    } else {
      novosSelecionados.add(doc_uuid);
    }
    setSelecionados(novosSelecionados);
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelecionados(new Set(documentos.map(doc => doc.doc_uuid)));
    } else {
      setSelecionados(new Set());
    }
  };

  // Exclui documentos selecionados e atualiza a lista atual
  const handleDeleteSelected = async () => {
    const docObjectsParaApagar = documentos.filter(doc => selecionados.has(doc.doc_uuid));

    if (docObjectsParaApagar.length === 0) return;

    if (window.confirm(`Tem certeza que deseja apagar ${docObjectsParaApagar.length} arquivo(s)?`)) {
      setProcessando(true);
      try {
        await apiApagarDocumento(docObjectsParaApagar);

        setSelecionados(new Set());

        console.log("Exclusão concluída. Buscando documentos da página atual novamente.");
        await fetchDocumentos(pageTokens[currentPage], false);

      } catch (err) {
        alert('Não foi possível apagar os documentos selecionados. Tente novamente.');
        setErro('Falha ao apagar documentos.');
      } finally {
        setProcessando(false);
      }
    }
  };

  // Avança para próxima página se houver token disponível
  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    if (nextPage < pageTokens.length && !carregando) {
      setCurrentPage(nextPage);
      fetchDocumentos(pageTokens[nextPage], false);
    }
  };

  // Retorna para página anterior usando token armazenado
  const handlePreviousPage = () => {
    if (currentPage > 0 && !carregando) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchDocumentos(pageTokens[prevPage], false);
    }
  };

  const isNextDisabled = (!pageTokens[currentPage + 1] && pageTokens[currentPage + 1] !== null) || carregando;


  const isAllSelected = !carregando && documentos.length > 0 && selecionados.size === documentos.length;


  // Abre modal e busca dados agregados de feedback do documento
  const handleViewFeedback = async (doc) => {
    if (!doc || !doc.doc_uuid) return;

    setLoadingFeedback(true);
    setFeedbackError('');
    setFeedbackData(null);
    setSelectedDocName(doc.fileName);
    setIsFeedbackModalOpen(true);

    try {
      const data = await apiGetFeedbackAggregate(doc.doc_uuid);
      setFeedbackData(data);
    } catch (err) {
      setFeedbackError(err.response?.data?.erro || 'Falha ao buscar dados de feedback.');
    } finally {
      setLoadingFeedback(false);
    }
  };

  // Renderiza conteúdo do modal de feedback baseado no estado de carregamento/erro
  const renderFeedbackModalContent = () => {
    if (loadingFeedback) {
      return <div className="text-center p-8"><i className="bx bx-loader-alt animate-spin text-4xl text-indigo-400"></i></div>;
    }
    if (feedbackError) {
      return <p className="text-red-500 text-center p-4">{feedbackError}</p>;
    }

    if (!feedbackData || feedbackData.total === 0) {
      return <p className="text-gray-400 text-center p-8">Nenhum feedback recebido.</p>;
    }

    const rating = feedbackData.rating;
    const info = feedbackLabels[rating] || { label: 'Desconhecido', color: 'text-gray-400', emoji: '?' };

    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-gray-300 mb-4 text-lg">Avaliação Recebida:</p>
        <span className={`text-8xl ${info.color}`}>{info.emoji}</span>
        <p className={`text-3xl font-bold mt-4 ${info.color}`}>
          {info.label}
        </p>
      </div>
    );
  };

  const handleOpenDetailsModal = (doc) => {
    if (carregando || processando) return;
    setSelectedDocForDetails(doc);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedDocForDetails(null);
  };

  const handleEditMetadata = (doc) => {
    if (!doc) return;
    setIsDetailsModalOpen(false);
    setIsEditModalOpen(true);
  };

  // Atualiza estado local após sucesso na edição para refletir mudanças sem reload
  const handleUpdateSuccess = (doc_uuid_atualizado, novoResultadoIa) => {
    setIsEditModalOpen(false);

    setDocumentos(prevDocs =>
      prevDocs.map(doc =>
        doc.doc_uuid === doc_uuid_atualizado
          ? { ...doc, resultadoIa: novoResultadoIa }
          : doc
      )
    );

    setSelectedDocForDetails(prevDoc => ({
      ...prevDoc,
      resultadoIa: novoResultadoIa
    }));
    setIsDetailsModalOpen(true);
  };


  return (
    <div className="flex flex-col min-h-screen bg-black text-white p-4 pb-24 md:pb-4">
      <NavPadrao />
      <NavInferior />

      <main className="w-full max-w-6xl mx-auto pt-24 md:pt-28">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Gerenciamento de Arquivos</h1>

        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-8 flex flex-col md:flex-row items-center gap-4">
          <div className="flex-grow flex flex-col md:flex-row items-center gap-4 w-full">
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              className="w-full flex-grow bg-gray-700 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
              placeholder="Buscar por nome, categoria ou resumo..."
              disabled={carregando || processando}
            />
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="w-full md:w-auto bg-gray-700 rounded-full py-2 px-4 focus:outline-none text-white cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
              disabled={carregando || processando}
            >
              <option value="desc">Mais Recentes</option>
              <option value="asc">Mais Antigos</option>
            </select>
          </div>
          <button
            onClick={handleDeleteSelected}
            disabled={selecionados.size === 0 || processando || carregando}
            className="w-full md:w-auto font-bold py-2 px-6 rounded-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
          >
            {processando ? <i className="bx bx-loader-alt animate-spin"></i> : <i className="bx bxs-trash-alt"></i>}
            {processando ? 'Apagando...' : 'Apagar'}
          </button>
        </div>

        {erro && <p className="text-red-500 text-center mb-4">{erro}</p>}

        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700/50">
              <tr>
                <th scope="col" className="p-4">
                  <input type="checkbox"
                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer disabled:cursor-not-allowed"
                    onChange={handleSelectAll}
                    checked={isAllSelected}
                    disabled={carregando || documentos.length === 0}
                  />
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Nome do Arquivo</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Categoria (IA)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-400">Data de Upload</th>
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-400">Feedback</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {carregando ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-400">Carregando...</td></tr>
              ) : documentos.length === 0 ? (
                <tr><td colSpan="5" className="text-center py-8 text-gray-500">Nenhum documento encontrado.</td></tr>
              ) : (
                documentos.map((doc) => (
                  <tr key={doc.doc_uuid} className={`${selecionados.has(doc.doc_uuid) ? 'bg-indigo-900/30' : ''} hover:bg-gray-700/40 transition-colors`}>
                    <td className="p-4">
                      <input type="checkbox"
                        className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                        checked={selecionados.has(doc.doc_uuid)}
                        onChange={() => handleSelect(doc.doc_uuid)}
                      />
                    </td>
                    <td
                      className="px-6 py-4 font-medium text-indigo-400 break-all cursor-pointer hover:text-indigo-300"
                      onClick={() => handleOpenDetailsModal(doc)}
                      title="Ver detalhes"
                    >
                      {doc.fileName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{doc.resultadoIa?.categoria || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-300">{new Date(doc.uploadedTimeStamp).toLocaleString()}</td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleViewFeedback(doc)}
                        className="text-indigo-400 hover:text-indigo-300 disabled:opacity-30"
                        disabled={carregando || processando}
                        title="Ver feedback"
                      >
                        <i className="bx bxs-star text-xl"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {(!carregando && (documentos.length > 0 || currentPage > 0)) && (
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={handlePreviousPage}
              disabled={currentPage === 0 || carregando || processando}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              Anterior
            </button>
            <span className="text-gray-400">Página {currentPage + 1}</span>
            <button
              onClick={handleNextPage}
              disabled={isNextDisabled || carregando || processando}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-6 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
            >
              Próximo
            </button>
          </div>
        )}
      </main>

      <Modal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        title={`Feedback para: ${selectedDocName}`}
      >
        {renderFeedbackModalContent()}
      </Modal>

      <Modal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        title={`Detalhes: ${selectedDocForDetails?.fileName || ''}`}
      >
        <button
          onClick={() => handleEditMetadata(selectedDocForDetails)}
          className="absolute top-4 right-16 text-gray-400 hover:text-white text-lg p-2 rounded-full hover:bg-gray-700 transition-colors"
          aria-label="Editar metadados"
          title="Editar metadados"
        >
          <i className="bx bxs-edit"></i>
        </button>

        {selectedDocForDetails ? (
          <InfoDocumento
            doc={selectedDocForDetails}
            showFeedbackButton={false}
          />
        ) : (
          <p className="text-gray-400 p-4">
            Nenhum documento selecionado.
          </p>
        )}
      </Modal>

      <EditarMetadadosModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        doc={selectedDocForDetails}
        onUpdateSuccess={handleUpdateSuccess}
      />
    </div>
  );
};

export default Admin;