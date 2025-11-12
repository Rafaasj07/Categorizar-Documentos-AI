import { useState, useEffect, useCallback } from 'react';
import { apiBuscarDocumentos, apiApagarDocumento, apiGetFeedbackAggregate } from '../services/api'; 
import NavPadrao from '../components/NavPadrao';
import NavInferior from '../components/NavInferior';
import Modal from '../components/Modal'; 
import InfoDocumento from '../components/info/InfoDocumento'; 
import EditarMetadadosModal from '../components/EditarMetadadosModal'; 

// Atraso (em ms) para a busca automática após o usuário parar de digitar.
const DEBOUNCE_DELAY = 500;

// Helper para mapear rating (número) para label e cor
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
    const [processando, setProcessando] = useState(false); // Estado de loading para exclusão
    const [selecionados, setSelecionados] = useState(new Set());
    const [sortOrder, setSortOrder] = useState('desc');
    const [pageTokens, setPageTokens] = useState([null]); // Armazena tokens: [null(pág 0), token1(pág 1), ...]
    const [currentPage, setCurrentPage] = useState(0); // Índice da página atual
    
    // Estados do modal de Feedback (existentes)
    const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
    const [loadingFeedback, setLoadingFeedback] = useState(false);
    const [feedbackData, setFeedbackData] = useState(null);
    const [feedbackError, setFeedbackError] = useState('');
    const [selectedDocName, setSelectedDocName] = useState('');

    // Estados do modal de Detalhes (novo)
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [selectedDocForDetails, setSelectedDocForDetails] = useState(null);
    // Estado para o modal de edição
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    /**
     * Busca documentos da API com base nos filtros, ordenação e paginação.
     * @param {string | null} token - O token da página a ser buscada.
     * @param {boolean} isNewSearch - Indica se a busca deve resetar a paginação.
     */
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
            // Chama a API de busca.
            const data = await apiBuscarDocumentos(params);
            setDocumentos(data.documentos || []);

            // Lógica de gerenciamento dos tokens de paginação.
            if (isNewSearch) {
                // Se for uma nova busca (ex: filtro mudou), reseta a paginação.
                setPageTokens([null, data.nextToken]);
                setCurrentPage(0);
            } else if (data.nextToken && currentPage === pageTokens.length - 1) {
                 // Se avançou para uma nova página, armazena o token da *próxima* página.
                setPageTokens(prev => [...prev, data.nextToken]);
            }

        } catch (err) {
            setErro('Falha ao carregar documentos.');
            setDocumentos([]);
             // Trata erros de busca e reseta a paginação se foi uma nova busca.
             if (isNewSearch) { 
                setPageTokens([null]);
                setCurrentPage(0);
            }
        } finally {
            setCarregando(false);
        }
    }, [termoBusca, sortOrder, currentPage, pageTokens.length]); // Dependência corrigida

    // Efeito para disparar a busca (com debounce) quando os filtros (termo, ordenação) mudam.
    useEffect(() => {
        // Busca inicial (sem debounce) ou ao limpar a busca.
        if (termoBusca === '') { 
             fetchDocumentos(null, true); 
        }

        // Define o debounce para o termo de busca.
        const handler = setTimeout(() => {
             // Executa a busca (resetando a página) após o delay do debounce.
             if (termoBusca !== '') { 
                fetchDocumentos(null, true); 
            }
        }, DEBOUNCE_DELAY);

        // Limpa o timeout anterior se o termo mudar rapidamente.
        return () => clearTimeout(handler);
    }, [termoBusca, sortOrder]); // Re-executa no change de termo ou sortOrder


    // Adiciona/remove um UUID do Set de documentos selecionados.
    const handleSelect = (doc_uuid) => {
        const novosSelecionados = new Set(selecionados);
        if (novosSelecionados.has(doc_uuid)) {
            novosSelecionados.delete(doc_uuid);
        } else {
            novosSelecionados.add(doc_uuid);
        }
        setSelecionados(novosSelecionados);
    };

    // Seleciona ou desmarca todos os documentos *visíveis* na página atual.
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelecionados(new Set(documentos.map(doc => doc.doc_uuid)));
        } else {
            setSelecionados(new Set());
        }
    };

    // Processa a exclusão dos documentos selecionados.
    const handleDeleteSelected = async () => {
        const docObjectsParaApagar = documentos.filter(doc => selecionados.has(doc.doc_uuid));

        if (docObjectsParaApagar.length === 0) return;

        // Pede confirmação ao usuário.
        if (window.confirm(`Tem certeza que deseja apagar ${docObjectsParaApagar.length} arquivo(s)?`)) {
            setProcessando(true);
            try {
                // Chama a API de exclusão.
                await apiApagarDocumento(docObjectsParaApagar); 

                setSelecionados(new Set()); // Limpa a seleção.

                // Re-busca os dados da página atual para refletir a exclusão.
                console.log("Exclusão concluída. Buscando documentos da página atual novamente.");
                await fetchDocumentos(pageTokens[currentPage], false);

            } catch (err) {
                 // Em caso de falha, exibe alerta e define o erro.
                 alert('Não foi possível apagar os documentos selecionados. Tente novamente.');
                 setErro('Falha ao apagar documentos.'); 
            } finally {
                 setProcessando(false);
            }
        }
    };

    // Navega para a próxima página de resultados.
    const handleNextPage = () => {
        const nextPage = currentPage + 1;
        // Verifica se o token para a próxima página existe no array.
        if (nextPage < pageTokens.length && !carregando) {
            setCurrentPage(nextPage);
            // Busca a próxima página usando o token armazenado.
            fetchDocumentos(pageTokens[nextPage], false); 
        }
    };

    // Navega para a página anterior de resultados.
    const handlePreviousPage = () => {
         // Verifica se não está na primeira página.
        if (currentPage > 0 && !carregando) {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);
            // Busca a página anterior usando o token armazenado.
            fetchDocumentos(pageTokens[prevPage], false); 
        }
    };

     // Verifica se o botão "Próximo" deve estar desabilitado (se não há token futuro).
    const isNextDisabled = (!pageTokens[currentPage + 1] && pageTokens[currentPage + 1] !== null) || carregando;


    // Verifica se todos os documentos da página atual estão selecionados.
    const isAllSelected = !carregando && documentos.length > 0 && selecionados.size === documentos.length;


    // Abre o modal de feedback e busca os dados
    const handleViewFeedback = async (doc) => {
      if (!doc || !doc.doc_uuid) return;
      
      setLoadingFeedback(true);
      setFeedbackError('');
      setFeedbackData(null);
      setSelectedDocName(doc.fileName);
      setIsFeedbackModalOpen(true);

      try {
        // A API agora retorna { rating: 5, total: 1 } ou { rating: 0, total: 0 }
        const data = await apiGetFeedbackAggregate(doc.doc_uuid);
        setFeedbackData(data);
      } catch (err) {
        setFeedbackError(err.response?.data?.erro || 'Falha ao buscar dados de feedback.');
      } finally {
        setLoadingFeedback(false);
      }
    };

    // Renderiza o conteúdo do modal de feedback (agregado)
    const renderFeedbackModalContent = () => {
      if (loadingFeedback) {
        return <div className="text-center p-8"><i className="bx bx-loader-alt animate-spin text-4xl text-indigo-400"></i></div>;
      }
      if (feedbackError) {
        return <p className="text-red-500 text-center p-4">{feedbackError}</p>;
      }
      
      // Se não houver dados ou votos, mostra "Nenhum feedback"
      if (!feedbackData || feedbackData.total === 0) {
        return <p className="text-gray-400 text-center p-8">Nenhum feedback recebido.</p>;
      }

      // Lê o 'rating' único da resposta da API.
      const rating = feedbackData.rating;
      const info = feedbackLabels[rating] || { label: 'Desconhecido', color: 'text-gray-400', emoji: '?' };

      // Renderiza o emoji e label do voto único.
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

    // Abre o modal de detalhes
    const handleOpenDetailsModal = (doc) => {
      if (carregando || processando) return; // Impede abertura se estiver ocupado
      setSelectedDocForDetails(doc);
      setIsDetailsModalOpen(true);
    };

    // Fecha o modal de detalhes
    const handleCloseDetailsModal = () => {
      setIsDetailsModalOpen(false);
      setSelectedDocForDetails(null);
    };

    // Abre o modal de edição (e fecha o de detalhes)
    const handleEditMetadata = (doc) => {
      if (!doc) return;
      setIsDetailsModalOpen(false); // Fecha o modal de detalhes
      setIsEditModalOpen(true);      // Abre o modal de edição
    };

    // Callback executado quando a edição de metadados é salva com sucesso
    const handleUpdateSuccess = (doc_uuid_atualizado, novoResultadoIa) => {
      setIsEditModalOpen(false); // Fecha o modal de edição
      
      // Atualiza o documento na lista localmente para refletir a mudança
      setDocumentos(prevDocs =>
        prevDocs.map(doc =>
          doc.doc_uuid === doc_uuid_atualizado
            ? { ...doc, resultadoIa: novoResultadoIa }
            : doc
        )
      );

      // Atualiza o estado do documento selecionado e reabre o modal de detalhes
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

                {/* Barra de ferramentas (Busca, Ordenação, Apagar) */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-8 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-grow flex flex-col md:flex-row items-center gap-4 w-full">
                        {/* Input de Busca */}
                        <input
                            type="text"
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                            className="w-full flex-grow bg-gray-700 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                            placeholder="Buscar por nome, categoria ou resumo..."
                            disabled={carregando || processando} 
                        />
                        {/* Seletor de Ordenação */}
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
                    {/* Botão de Apagar */}
                    <button
                        onClick={handleDeleteSelected}
                        disabled={selecionados.size === 0 || processando || carregando} 
                        className="w-full md:w-auto font-bold py-2 px-6 rounded-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed disabled:opacity-60 transition-colors"
                    >
                         {/* Mostra spinner durante a exclusão */}
                         {processando ? <i className="bx bx-loader-alt animate-spin"></i> : <i className="bx bxs-trash-alt"></i>}
                         {processando ? 'Apagando...' : 'Apagar'}
                    </button>
                </div>

                {erro && <p className="text-red-500 text-center mb-4">{erro}</p>}

                {/* Tabela de Documentos */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700/50">
                            <tr>
                                <th scope="col" className="p-4">
                                    {/* Checkbox "Selecionar Todos" */}
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
                            {/* Renderização condicional do corpo da tabela */}
                            {carregando ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-400">Carregando...</td></tr>
                            ) : documentos.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-8 text-gray-500">Nenhum documento encontrado.</td></tr>
                            ) : (
                                // Mapeia e renderiza a lista de documentos.
                                documentos.map((doc) => (
                                    <tr key={doc.doc_uuid} className={`${selecionados.has(doc.doc_uuid) ? 'bg-indigo-900/30' : ''} hover:bg-gray-700/40 transition-colors`}>
                                        <td className="p-4">
                                            {/* Checkbox de seleção individual */}
                                            <input type="checkbox"
                                                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                                                checked={selecionados.has(doc.doc_uuid)}
                                                onChange={() => handleSelect(doc.doc_uuid)}
                                            />
                                        </td>
                                        {/* Célula do Nome (clicável para abrir detalhes) */}
                                        <td 
                                          className="px-6 py-4 font-medium text-indigo-400 break-all cursor-pointer hover:text-indigo-300"
                                          onClick={() => handleOpenDetailsModal(doc)}
                                          title="Ver detalhes"
                                        >
                                          {doc.fileName}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{doc.resultadoIa?.categoria || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{new Date(doc.uploadedTimeStamp).toLocaleString()}</td>
                                        {/* Célula do Botão de Feedback */}
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

                {/* Renderiza a paginação */}
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

            {/* Modal de Feedback (Agregado) */}
            <Modal 
              isOpen={isFeedbackModalOpen} 
              onClose={() => setIsFeedbackModalOpen(false)} 
              title={`Feedback para: ${selectedDocName}`}
            >
              {renderFeedbackModalContent()}
            </Modal>

            {/* Modal de Detalhes do Documento */}
            <Modal
              isOpen={isDetailsModalOpen}
              onClose={handleCloseDetailsModal}
              title={`Detalhes: ${selectedDocForDetails?.fileName || ''}`}
            >
              {/* Botão de Edição (dentro do modal de detalhes) */}
              <button
                onClick={() => handleEditMetadata(selectedDocForDetails)}
                className="absolute top-4 right-16 text-gray-400 hover:text-white text-lg p-2 rounded-full hover:bg-gray-700 transition-colors" 
                aria-label="Editar metadados"
                title="Editar metadados"
              >
                <i className="bx bxs-edit"></i>
              </button>

              {/* Renderiza o componente InfoDocumento dentro do modal */}
              {selectedDocForDetails ? (
                <InfoDocumento
                  doc={selectedDocForDetails}
                  showFeedbackButton={false} // Esconde o botão de feedback
                />
              ) : (
                <p className="text-gray-400 p-4">
                  Nenhum documento selecionado.
                </p>
              )}
            </Modal>
            
            {/* Modal de Edição de Metadados (JSON) */}
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