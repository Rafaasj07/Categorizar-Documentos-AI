import { useState, useEffect } from 'react';
import { apiBuscarDocumentos, apiApagarDocumento } from '../services/api';
import NavPadrao from '../components/NavPadrao';
import NavInferior from '../components/NavInferior';

/**
 * pages/Admin.jsx
 * * Função Principal:
 * Painel administrativo para visualizar e gerenciar todos os documentos do sistema.
 * Permite buscar, selecionar e apagar múltiplos documentos.
 * * Estilização:
 * Utiliza Tailwind CSS para um layout limpo e funcional.
 */
const Admin = () => {
    // Estado para armazenar documentos carregados da API
    const [documentos, setDocumentos] = useState([]);
    // Estado do termo de busca digitado pelo usuário
    const [termoBusca, setTermoBusca] = useState('');
    // Estado de carregamento geral da página
    const [carregando, setCarregando] = useState(true);
    // Mensagem de erro geral
    const [erro, setErro] = useState('');
    // Estado de processamento de ações (ex: apagando documentos)
    const [processando, setProcessando] = useState(false);
    // Conjunto para armazenar IDs de documentos selecionados
    const [selecionados, setSelecionados] = useState(new Set());

    // Função para buscar documentos da API
    const fetchDocumentos = async (termo = '') => {
        setCarregando(true);
        setErro('');
        try {
            const data = await apiBuscarDocumentos({ termo }); // Chama API passando termo
            setDocumentos(data.documentos || []); // Atualiza estado com documentos
        } catch (err) {
            setErro('Falha ao carregar documentos.');
            setDocumentos([]); // Garante array vazio em caso de erro
        } finally {
            setCarregando(false); // Finaliza carregamento
        }
    };

    // Busca documentos quando o componente é montado
    useEffect(() => {
        fetchDocumentos();
    }, []);

    // Handler para busca via formulário
    const handleSearch = (e) => {
        e.preventDefault();
        fetchDocumentos(termoBusca);
    };

    // Seleciona ou desseleciona um único documento
    const handleSelect = (doc_uuid) => {
        const novosSelecionados = new Set(selecionados);
        if (novosSelecionados.has(doc_uuid)) {
            novosSelecionados.delete(doc_uuid);
        } else {
            novosSelecionados.add(doc_uuid);
        }
        setSelecionados(novosSelecionados);
    };

    // Seleciona ou desseleciona todos os documentos
    const handleSelectAll = (e) => {
        if (e.target.checked) {
            const todosIds = new Set(documentos.map(doc => doc.doc_uuid));
            setSelecionados(todosIds);
        } else {
            setSelecionados(new Set());
        }
    };

    // Apaga os documentos selecionados
    const handleDeleteSelected = async () => {
        const documentosParaApagar = documentos.filter(doc => selecionados.has(doc.doc_uuid));
        if (documentosParaApagar.length === 0) {
            alert("Nenhum documento selecionado.");
            return;
        }

        if (window.confirm(`Tem certeza que deseja apagar ${documentosParaApagar.length} arquivo(s)?`)) {
            setProcessando(true);
            try {
                await apiApagarDocumento(documentosParaApagar.map(doc => doc.doc_uuid)); // Chama API para apagar
                // Remove itens apagados da lista na tela
                setDocumentos(prev => prev.filter(doc => !selecionados.has(doc.doc_uuid)));
                setSelecionados(new Set()); // Limpa seleção
            } catch (err) {
                alert('Não foi possível apagar os documentos selecionados.');
            } finally {
                setProcessando(false);
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-black text-white p-4 pb-24 md:pb-4">
            {/* Navegação superior e inferior */}
            <NavPadrao />
            <NavInferior />

            <main className="w-full max-w-6xl mx-auto pt-24 md:pt-28">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Gerenciamento de Arquivos</h1>

                {/* Barra de ações: busca + botão apagar */}
                <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 mb-8 flex flex-col md:flex-row items-center gap-4">
                    <form onSubmit={handleSearch} className="flex-grow flex items-center gap-4 w-full">
                        <input
                            type="text"
                            value={termoBusca}
                            onChange={(e) => setTermoBusca(e.target.value)}
                            className="w-full flex-grow bg-gray-700 rounded-full py-2 px-4 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                            placeholder="Buscar por nome, categoria ou resumo..."
                        />
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 font-bold py-2 px-6 rounded-full">Buscar</button>
                    </form>
                    <button
                        onClick={handleDeleteSelected}
                        disabled={selecionados.size === 0 || processando}
                        className={`
                            w-full md:w-auto
                            font-bold py-2 px-6 rounded-full flex items-center justify-center gap-2
                            ${selecionados.size === 0 || processando
                                ? 'bg-red-800 cursor-not-allowed'
                                : 'bg-red-600 hover:bg-red-700'}
                            disabled:bg-red-900
                        `}
                    >
                        <i className="bx bxs-trash-alt"></i>
                        Apagar
                    </button>
                </div>

                {/* Mensagem de erro */}
                {erro && <p className="text-red-500 text-center">{erro}</p>}

                {/* Tabela de documentos */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-700">
                        <thead className="bg-gray-700/50">
                            <tr>
                                <th scope="col" className="p-4">
                                    <input type="checkbox"
                                        className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                        onChange={handleSelectAll}
                                        checked={documentos.length > 0 && selecionados.size === documentos.length}
                                    />
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Nome do Arquivo</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Categoria</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Data de Upload</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {carregando ? (
                                <tr><td colSpan="4" className="text-center py-8">Carregando...</td></tr>
                            ) : (
                                documentos.map((doc) => (
                                    <tr key={doc.doc_uuid} className={`${selecionados.has(doc.doc_uuid) ? 'bg-indigo-900/50' : ''} hover:bg-gray-700/50`}>
                                        <td className="p-4">
                                            <input type="checkbox"
                                                className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                                checked={selecionados.has(doc.doc_uuid)}
                                                onChange={() => handleSelect(doc.doc_uuid)}
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{doc.fileName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{doc.resultadoIa?.categoria || 'N/A'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">{new Date(doc.uploadedTimeStamp).toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </main>
        </div>
    );
};

export default Admin;