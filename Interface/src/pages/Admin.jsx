// Importa os hooks do React para gerenciar estado e ciclo de vida.
import { useState, useEffect, useCallback } from 'react';
// Importa as funções da API para buscar e apagar documentos.
import { apiBuscarDocumentos, apiApagarDocumento } from '../services/api';
// Importa os componentes de navegação.
import NavPadrao from '../components/NavPadrao';
import NavInferior from '../components/NavInferior';

// Define um pequeno atraso (500ms) para iniciar a busca após o usuário parar de digitar.
const DEBOUNCE_DELAY = 500;

/**
 * Componente da página de Administração para visualizar e gerenciar todos os documentos.
 */
const Admin = () => {
    // --- Estados do Componente ---
    // Armazena a lista de documentos buscados.
    const [documentos, setDocumentos] = useState([]);
    // Armazena o texto que o usuário digita no campo de busca.
    const [termoBusca, setTermoBusca] = useState('');
    // Controla se a página está carregando dados.
    const [carregando, setCarregando] = useState(true);
    // Armazena mensagens de erro.
    const [erro, setErro] = useState('');
    // Controla o estado de processamento de uma ação, como apagar.
    const [processando, setProcessando] = useState(false);
    // Armazena os IDs dos documentos selecionados na tabela.
    const [selecionados, setSelecionados] = useState(new Set());

    // --- Estados para Filtro e Paginação ---
    // Armazena a ordem de sortimento (mais recentes ou mais antigos).
    const [sortOrder, setSortOrder] = useState('desc');
    // Armazena os "tokens" para navegar entre as páginas de resultados.
    const [pageTokens, setPageTokens] = useState([null]);
    // Armazena o número da página atual.
    const [currentPage, setCurrentPage] = useState(0);

    /**
     * Função para buscar os documentos na API.
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
                limit: 10, // Busca 10 itens por página.
                nextToken: token,
            };
            // Chama a API e armazena os resultados.
            const data = await apiBuscarDocumentos(params);
            setDocumentos(data.documentos || []);

            // Gerencia os tokens para a paginação.
            if (isNewSearch) {
                // Se for uma nova busca, reseta a paginação.
                setPageTokens([null, data.nextToken]);
                setCurrentPage(0);
            } else if (data.nextToken && currentPage === pageTokens.length - 1) {
                // Se houver uma próxima página, adiciona o novo token.
                setPageTokens(prev => [...prev, data.nextToken]);
            }
        } catch (err) {
            setErro('Falha ao carregar documentos.');
            setDocumentos([]);
        } finally {
            setCarregando(false);
        }
    }, [termoBusca, sortOrder]); // A função será recriada se 'termoBusca' ou 'sortOrder' mudarem.

    /**
     * Efeito que executa a busca automaticamente quando o usuário digita.
     * O 'debounce' espera o usuário parar de digitar por 500ms antes de buscar.
     */
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchDocumentos(null, true); // Inicia uma nova busca.
        }, DEBOUNCE_DELAY);
        // Limpa o timer anterior a cada nova digitação.
        return () => clearTimeout(handler);
    }, [fetchDocumentos]); // Este efeito depende da função 'fetchDocumentos'.

    // --- Funções de Manipulação da Tabela ---
    // Adiciona ou remove um documento da lista de selecionados.
    const handleSelect = (doc_uuid) => {
        const novosSelecionados = new Set(selecionados);
        if (novosSelecionados.has(doc_uuid)) {
            novosSelecionados.delete(doc_uuid);
        } else {
            novosSelecionados.add(doc_uuid);
        }
        setSelecionados(novosSelecionados);
    };

    // Seleciona ou deseleciona todos os documentos da página atual.
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelecionados(new Set(documentos.map(doc => doc.doc_uuid)));
        } else {
            setSelecionados(new Set());
        }
    };

    // Apaga os documentos que foram selecionados.
    const handleDeleteSelected = async () => {
        const docsParaApagar = documentos.filter(doc => selecionados.has(doc.doc_uuid));
        if (docsParaApagar.length === 0) return;

        // Pede confirmação ao usuário antes de apagar.
        if (window.confirm(`Tem certeza que deseja apagar ${docsParaApagar.length} arquivo(s)?`)) {
            setProcessando(true);
            try {
                await apiApagarDocumento(docsParaApagar);
                // Remove os documentos apagados da lista exibida na tela.
                setDocumentos(prev => prev.filter(doc => !selecionados.has(doc.doc_uuid)));
                setSelecionados(new Set()); // Limpa a seleção.
            } catch (err) {
                alert('Não foi possível apagar os documentos.');
            } finally {
                setProcessando(false);
            }
        }
    };

    // --- Funções para controlar a paginação ---
    // Navega para a próxima página de resultados.
    const handleNextPage = () => {
        const nextPage = currentPage + 1;
        if (nextPage < pageTokens.length && pageTokens[nextPage] !== null) {
            setCurrentPage(nextPage);
            fetchDocumentos(pageTokens[nextPage], false);
        }
    };

    // Navega para a página anterior de resultados.
    const handlePreviousPage = () => {
        if (currentPage > 0) {
            const prevPage = currentPage - 1;
            setCurrentPage(prevPage);
            fetchDocumentos(pageTokens[prevPage], false);
        }
    };

    // Verifica se o botão "Próximo" deve ser desabilitado.
    const isNextDisabled = !pageTokens[currentPage + 1] || carregando;

    // Retorna a estrutura JSX (HTML) da página.
    return (
        <div className="flex flex-col min-h-screen bg-black text-white p-4 pb-24 md:pb-4">
            <NavPadrao />
            <NavInferior />

            <main className="w-full max-w-6xl mx-auto pt-24 md:pt-28">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Gerenciamento de Arquivos</h1>

                {/* Barra com campo de busca, filtro e botão de apagar. */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-8 flex flex-col md:flex-row items-center gap-4">
                    <div className="flex-grow flex flex-col md:flex-row items-center gap-4 w-full">
                        <input
                            type="text"
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                            className="w-full flex-grow bg-gray-700 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                            placeholder="Buscar por nome, categoria ou resumo..."
                        />
                        <select
                            value={sortOrder}
                            onChange={(e) => setSortOrder(e.target.value)}
                            className="w-full md:w-auto bg-gray-700 rounded-full py-2 px-4 focus:outline-none text-white"
                        >
                            <option value="desc">Mais Recentes</option>
                            <option value="asc">Mais Antigos</option>
                        </select>
                    </div>
                    <button
                        onClick={handleDeleteSelected}
                        disabled={selecionados.size === 0 || processando}
                        className="w-full md:w-auto font-bold py-2 px-6 rounded-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed"
                    >
                        <i className="bx bxs-trash-alt"></i>
                        Apagar
                    </button>
                </div>

                {/* Exibe mensagem de erro, se houver. */}
                {erro && <p className="text-red-500 text-center">{erro}</p>}

                {/* Tabela que exibe os documentos. */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        {/* Cabeçalho da tabela. */}
                        <thead className="bg-gray-700/50">
                            <tr>
                                <th scope="col" className="p-4">
                                    <input type="checkbox"
                                        className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                        onChange={handleSelectAll}
                                        checked={!carregando && documentos.length > 0 && selecionados.size === documentos.length}
                                        disabled={carregando}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nome do Arquivo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Categoria (IA)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Data de Upload</th>
                            </tr>
                        </thead>
                        {/* Corpo da tabela. */}
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {/* Exibe mensagem de carregamento, "nenhum documento" ou a lista de documentos. */}
                            {carregando ? (
                                <tr><td colSpan="4" className="text-center py-8">Carregando...</td></tr>
                            ) : documentos.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-8">Nenhum documento encontrado.</td></tr>
                            ) : (
                                // Mapeia e renderiza cada documento em uma linha da tabela.
                                documentos.map((doc) => (
                                    <tr key={doc.doc_uuid} className={`${selecionados.has(doc.doc_uuid) ? 'bg-indigo-900/50' : ''} hover:bg-gray-700/50`}>
                                        <td className="p-4">
                                            <input type="checkbox"
                                                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                                checked={selecionados.has(doc.doc_uuid)}
                                                onChange={() => handleSelect(doc.doc_uuid)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 font-medium text-white break-all">{doc.fileName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{doc.resultadoIa?.categoria || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{new Date(doc.uploadedTimeStamp).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Controles de paginação (Anterior/Próximo). */}
                {(!carregando && (documentos.length > 0 || currentPage > 0)) && (
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
            </main>
        </div>
    );
};

export default Admin;