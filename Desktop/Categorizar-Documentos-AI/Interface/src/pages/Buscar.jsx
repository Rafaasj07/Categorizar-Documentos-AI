// Importa os hooks do React: useState para estados, useEffect para efeitos e useCallback para otimização.
import { useState, useEffect, useCallback } from 'react';
// Importa funções para se comunicar com a API.
import { apiBuscarDocumentos, apiDownloadDocumento, apiListarCategorias } from '../services/api';
// Importa componentes de navegação da interface.
import NavPadrao from '../components/NavPadrao';
import NavInferior from '../components/NavInferior';

// Define o tempo (em ms) que o sistema espera após o usuário parar de digitar para fazer a busca.
const DEBOUNCE_DELAY = 500;

// Define o componente principal da página de busca.
const Buscar = () => {
  // --- Estados do componente (variáveis que guardam informações) ---
  const [termoBusca, setTermoBusca] = useState(''); // Guarda o texto da busca.
  const [resultados, setResultados] = useState([]); // Guarda la lista de documentos encontrados.
  const [carregando, setCarregando] = useState(true); // Controla o aviso de "Carregando...".
  const [erro, setErro] = useState(''); // Guarda mensagens de erro.
  const [downloading, setDownloading] = useState(null); // Indica qual documento está sendo baixado.
  const [categorias, setCategorias] = useState([]); // Guarda a lista de categorias para o filtro.
  const [categoriaSelecionada, setCategoriaSelecionada] = useState(''); // Guarda a categoria selecionada no filtro.
  const [sortOrder, setSortOrder] = useState('desc'); // Guarda a ordem de ordenação (ex: 'desc' para mais recentes).
  const [pageTokens, setPageTokens] = useState([null]); // Guarda os códigos para navegar entre as páginas.
  const [currentPage, setCurrentPage] = useState(0); // Guarda o número da página atual.

  // --- Função principal para buscar os documentos ---
  // useCallback evita que a função seja recriada a cada renderização, melhorando a performance.
  const fetchDocumentos = useCallback(async (token, isNewSearch) => {
    setCarregando(true); // Ativa a mensagem de "Carregando...".
    setErro(''); // Limpa qualquer erro anterior.
    try {
      // Prepara os parâmetros para enviar à API.
      const params = {
        termo: termoBusca,
        categoria: categoriaSelecionada,
        sortOrder,
        limit: 10, // Define que virão 10 itens por página.
        nextToken: token, // Envia o código da página a ser buscada.
      };
      // Chama a API para buscar os documentos.
      const data = await apiBuscarDocumentos(params);
      setResultados(data.documentos || []); // Atualiza a lista de resultados.

      // Lógica de paginação.
      if (isNewSearch) {
        // Se for uma nova busca, reseta a paginação.
        setPageTokens([null, data.nextToken]);
        setCurrentPage(0);
      } else if (data.nextToken && currentPage === pageTokens.length - 1) {
        // Se houver uma próxima página, adiciona seu token à lista.
        setPageTokens(prev => [...prev, data.nextToken]);
      }

    } catch (err) {
      // Se der erro na busca, exibe uma mensagem.
      setErro('Falha ao carregar documentos. Tente novamente mais tarde.');
      setResultados([]); // Esvazia a lista de resultados.
    } finally {
      // Ao final (com sucesso ou erro), desativa o "Carregando...".
      setCarregando(false);
    }
  }, [termoBusca, categoriaSelecionada, sortOrder]); // A função só será recriada se um desses itens mudar.

  // --- Efeito que dispara a busca enquanto o usuário digita (com debounce) ---
  useEffect(() => {
    // Cria um timer para chamar a busca após o DEBOUNCE_DELAY.
    const handler = setTimeout(() => {
      fetchDocumentos(null, true); // Executa uma nova busca.
    }, DEBOUNCE_DELAY);
    // Limpa o timer se o usuário digitar novamente, evitando buscas desnecessárias.
    return () => clearTimeout(handler);
  }, [fetchDocumentos]); // Este efeito depende da função fetchDocumentos.

  // --- Efeito para carregar as categorias do filtro uma única vez ---
  useEffect(() => {
    async function carregarCategoriasIniciais() {
      try {
        // Chama a API para obter la lista de categorias.
        const listaCategorias = await apiListarCategorias();
        setCategorias(listaCategorias); // Salva as categorias no estado.
      } catch (err) {
        console.error("Não foi possível carregar as categorias para o filtro.");
      }
    }
    carregarCategoriasIniciais();
  }, []); // O array vazio [] garante que isso rode só uma vez, quando o componente é criado.

  // --- Função para lidar com o download de um arquivo ---
  const handleDownload = async (doc) => {
    setDownloading(doc.doc_uuid); // Avisa a interface que o download deste item começou.
    try {
      // Pede um link de download para a API.
      await apiDownloadDocumento(doc.bucketName, doc.s3Key);
    } catch (err) {
      setErro('Não foi possível gerar o link de download.');
    } finally {
      setDownloading(null); // Avisa que o download terminou.
    }
  };

  // --- Funções para controlar a paginação ---
  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    // Verifica se a próxima página existe.
    if (nextPage < pageTokens.length && pageTokens[nextPage] !== null) {
      setCurrentPage(nextPage);
      fetchDocumentos(pageTokens[nextPage], false); // Busca os dados da próxima página.
    }
  };

  const handlePreviousPage = () => {
    // Verifica se não está na primeira página.
    if (currentPage > 0) {
      const prevPage = currentPage - 1;
      setCurrentPage(prevPage);
      fetchDocumentos(pageTokens[prevPage], false); // Busca os dados da página anterior.
    }
  };

  // --- Variável que define se o botão "Próximo" deve estar desabilitado ---
  const isNextDisabled = !pageTokens[currentPage + 1] || carregando;

  // --- Renderização do HTML (JSX) do componente ---
  return (
    <div className="flex flex-col items-center min-h-screen bg-black p-4 pt-24 md:pt-32 pb-24 md:pb-4">
      <NavPadrao /> {/* Renderiza a barra de navegação superior. */}
      <NavInferior /> {/* Renderiza a barra de navegação inferior. */}

      <div className="w-full max-w-4xl pt-6 md:pt-0">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-white">
          Buscar Documentos
        </h1>

        {/* --- Seção de Filtros e Busca --- */}
        <div className="flex flex-col md:flex-row gap-2 mb-8">
          {/* Campo de texto para a busca. */}
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="flex-grow shadow-inner appearance-none border border-gray-700 rounded-lg py-3 px-4 bg-gray-800 text-gray-200 focus:outline-none"
            placeholder="Filtrar por nome, resumo..."
          />

          {/* Filtro de Categoria. */}
          <div className="relative flex-grow md:flex-grow-0 w-full md:w-64">
            <select
              value={categoriaSelecionada}
              onChange={(e) => setCategoriaSelecionada(e.target.value)}
              className="appearance-none shadow-inner border border-gray-700 rounded-lg py-3 pl-4 pr-10 bg-gray-800 text-gray-200 focus:outline-none w-full"
            >
              <option value="">Todas as Categorias</option>
              {categorias.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-gray-400">▼</span>
          </div>

          {/* Filtro de Ordenação. */}
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

        {/* Exibe mensagem de erro, se houver. */}
        {erro && <p className="text-red-500 text-center">{erro}</p>}

        {/* --- Seção da Lista de Resultados --- */}
        <div className="space-y-4">
          {/* Exibe "Carregando..." enquanto a busca ocorre. */}
          {carregando && <p className="text-gray-400 text-center">Carregando documentos...</p>}

          {/* Exibe mensagem se a busca terminar e não houver resultados. */}
          {!carregando && resultados.length === 0 && (
            <p className="text-gray-400 text-center">Nenhum documento encontrado.</p>
          )}

          {/* Mapeia os resultados para exibir cada documento em um card. */}
          {resultados.map((doc) => (
            <div
              key={doc.doc_uuid}
              className="relative bg-gray-800 p-4 rounded-lg border border-gray-700 transition-transform hover:scale-[1.02] duration-300"
            >
              {/* Botão de download posicionado no canto. */}
              <button
                onClick={() => handleDownload(doc)}
                disabled={downloading === doc.doc_uuid} // Desabilita enquanto baixa este item.
                className="absolute top-4 right-4 text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-wait"
                title="Baixar documento"
              >
                {/* Mostra um ícone de carregamento ou o de download. */}
                {downloading === doc.doc_uuid ? (
                  <i className="bx bx-loader-alt animate-spin text-2xl"></i>
                ) : (
                  <i className="bx bxs-download text-2xl"></i>
                )}
              </button>

              {/* Informações do documento. */}
              <h3 className="text-xl font-bold text-indigo-400 pr-10">{doc.fileName}</h3>
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

        {/* --- Seção de Paginação --- */}
        {/* Só aparece se houver resultados ou se não estiver na primeira página. */}
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