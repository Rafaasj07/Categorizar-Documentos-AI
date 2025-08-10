import { useState, useEffect } from 'react';
import { apiBuscarDocumentos, apiDownloadDocumento } from '../services/api';
import NavPadrao from '../components/NavPadrao';
import NavInferior from '../components/NavInferior';

const Buscar = () => {
  // Estado para termo de busca digitado
  const [termoBusca, setTermoBusca] = useState('');
  // Lista de documentos retornados da API
  const [resultados, setResultados] = useState([]);
  // Indica se está carregando dados
  const [carregando, setCarregando] = useState(true);
  // Armazena mensagem de erro na busca
  const [erro, setErro] = useState('');
  // Armazena o UUID do documento que está sendo baixado (para controle de loading)
  const [downloading, setDownloading] = useState(null);

  // Função para buscar documentos via API, com filtro opcional
  const fetchDocumentos = async (termo = '') => {
    setCarregando(true);
    setErro('');
    try {
      const data = await apiBuscarDocumentos(termo);
      setResultados(data);
    } catch (err) {
      setErro('Falha ao carregar documentos. Tente novamente mais tarde.');
    } finally {
      setCarregando(false);
    }
  };

  // Busca inicial ao montar o componente, sem filtro
  useEffect(() => {
    fetchDocumentos();
  }, []);

  // Handler do submit do formulário de busca
  const handleSearch = (e) => {
    e.preventDefault();
    fetchDocumentos(termoBusca);
  };

  // Função para baixar o documento e abrir em nova aba
  const handleDownload = async (doc) => {
    setDownloading(doc.doc_uuid);
    try {
      const url = await apiDownloadDocumento(doc.bucketName, doc.s3Key);
      window.open(url, '_blank'); // Abre o arquivo em nova aba
    } catch (err) {
      alert('Não foi possível obter o link para download. Tente novamente.');
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-black p-4 pt-24 md:pt-32 pb-24 md:pb-4">
      <NavPadrao />
      <NavInferior />

      <div className="w-full max-w-4xl">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-6 text-white">
          Buscar Documentos
        </h1>

        {/* Formulário para filtro de busca */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="flex-grow shadow-inner appearance-none border border-gray-700 rounded-lg py-3 px-4 bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Filtrar por nome, categoria, resumo..."
          />
          <button
            type="submit"
            disabled={carregando}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-600 flex items-center justify-center w-28"
          >
            {carregando && !termoBusca ? 'Buscando' : <i className="bx bx-search text-xl"></i>}
          </button>
        </form>

        {/* Mostra mensagem de erro, se houver */}
        {erro && <p className="text-red-500 text-center">{erro}</p>}

        <div className="space-y-4">
          {/* Indica carregamento */}
          {carregando && <p className="text-gray-400 text-center">Carregando documentos...</p>}

          {/* Mensagem caso não haja resultados */}
          {!carregando && resultados.length === 0 && (
            <p className="text-gray-400 text-center">Nenhum documento encontrado.</p>
          )}

          {/* Lista de documentos */}
          {resultados.map((doc) => (
            <div
              key={doc.doc_uuid}
              className="relative bg-gray-800 p-4 rounded-lg border border-gray-700 transition-transform hover:scale-[1.02] duration-300"
            >
              {/* Botão para download com estado de loading */}
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

              {/* Informações do documento */}
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
      </div>
    </div>
  );
};

export default Buscar;
