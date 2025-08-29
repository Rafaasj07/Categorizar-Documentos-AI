import { useState, useEffect } from 'react';
import { apiBuscarDocumentos, apiApagarDocumento, apiCorrigirCategoria } from '../services/api';
import NavPadrao from '../components/NavPadrao';
import NavInferior from '../components/NavInferior';

/**
 * Painel administrativo para visualizar, gerenciar e corrigir documentos do sistema.
 */
const Admin = () => {
    const [documentos, setDocumentos] = useState([]);
    const [termoBusca, setTermoBusca] = useState('');
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState('');
    const [processando, setProcessando] = useState(false);
    const [selecionados, setSelecionados] = useState(new Set());
    const [editingDoc, setEditingDoc] = useState(null);
    const [newCategory, setNewCategory] = useState('');

    // Limite de confiança para exibir o alerta ---
    const CONFIDENCE_THRESHOLD = 0.85; // Alerta se a confiança for menor que 85%

    const fetchDocumentos = async (termo = '') => {
        setCarregando(true);
        setErro('');
        try {
            const data = await apiBuscarDocumentos({ termo });
            setDocumentos(data.documentos || []);
        } catch (err) {
            setErro('Falha ao carregar documentos.');
            setDocumentos([]);
        } finally {
            setCarregando(false);
        }
    };

    useEffect(() => {
        fetchDocumentos();
    }, []);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchDocumentos(termoBusca);
    };

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

    const handleDeleteSelected = async () => {
        const docsParaApagar = documentos.filter(doc => selecionados.has(doc.doc_uuid));
        if (docsParaApagar.length === 0) return;

        if (window.confirm(`Tem certeza que deseja apagar ${docsParaApagar.length} arquivo(s)?`)) {
            setProcessando(true);
            try {
                await apiApagarDocumento(docsParaApagar);
                setDocumentos(prev => prev.filter(doc => !selecionados.has(doc.doc_uuid)));
                setSelecionados(new Set());
            } catch (err) {
                alert('Não foi possível apagar os documentos.');
            } finally {
                setProcessando(false);
            }
        }
    };
    
    const handleOpenEditModal = (doc) => {
        setEditingDoc(doc);
        setNewCategory(doc.resultadoIa?.categoria || '');
    };

    const handleCloseEditModal = () => {
        setEditingDoc(null);
        setNewCategory('');
    };

    const handleSaveCorrection = async (e) => {
        e.preventDefault();
        if (!editingDoc || !newCategory.trim()) return;

        setProcessando(true);
        try {
            await apiCorrigirCategoria(editingDoc.doc_uuid, newCategory);

            setDocumentos(prevDocs =>
                prevDocs.map(doc =>
                    doc.doc_uuid === editingDoc.doc_uuid
                        ? { ...doc, resultadoIa: { ...doc.resultadoIa, categoria: newCategory, scoreConfianca: 1.0 } } // Assume 100% de confiança após correção manual
                        : doc
                )
            );
            handleCloseEditModal();
        } catch (err) {
            alert('Falha ao salvar a correção.');
        } finally {
            setProcessando(false);
        }
    };


    return (
        <div className="flex flex-col min-h-screen bg-black text-white p-4 pb-24 md:pb-4">
            <NavPadrao />
            <NavInferior />

            <main className="w-full max-w-6xl mx-auto pt-24 md:pt-28">
                <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">Gerenciamento de Arquivos</h1>

                {/* Barra de ações*/}
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
                        className="w-full md:w-auto font-bold py-2 px-6 rounded-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-900 disabled:cursor-not-allowed"
                    >
                        <i className="bx bxs-trash-alt"></i>
                        Apagar
                    </button>
                </div>

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
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Categoria (IA)</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Confiança</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Data de Upload</th>
                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium uppercase tracking-wider">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="bg-gray-800 divide-y divide-gray-700">
                            {carregando ? (
                                <tr><td colSpan="6" className="text-center py-8">Carregando...</td></tr>
                            ) : (
                                documentos.map((doc) => {
                                    const score = doc.resultadoIa?.scoreConfianca;
                                    const hasLowConfidence = typeof score === 'number' && score < CONFIDENCE_THRESHOLD;

                                    return (
                                        <tr key={doc.doc_uuid} className={`${selecionados.has(doc.doc_uuid) ? 'bg-indigo-900/50' : ''} hover:bg-gray-700/50`}>
                                            <td className="p-4">
                                                <input type="checkbox"
                                                    className="h-4 w-4 rounded bg-gray-700 border-gray-600 text-indigo-600 focus:ring-indigo-500"
                                                    checked={selecionados.has(doc.doc_uuid)}
                                                    onChange={() => handleSelect(doc.doc_uuid)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-white">{doc.fileName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                                                <div className="flex items-center gap-2">
                                                    {hasLowConfidence && <i className='bx bxs-error-circle text-yellow-400' title={`Confiança baixa: ${(score * 100).toFixed(0)}%`}></i>}
                                                    <span>{doc.resultadoIa?.categoria || 'N/A'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {typeof score === 'number' ? (
                                                    <span className={hasLowConfidence ? 'text-yellow-400 font-semibold' : 'text-green-400'}>
                                                        {(score * 100).toFixed(0)}%
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-500">N/A</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-300">{new Date(doc.uploadedTimeStamp).toLocaleString()}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button onClick={() => handleOpenEditModal(doc)} className="text-indigo-400 hover:text-indigo-200">
                                                    <i className='bx bxs-edit text-xl'></i>
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Modal de Edição*/}
            {editingDoc && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-gray-800 rounded-lg p-8 w-full max-w-lg border border-gray-700">
                        <h2 className="text-2xl font-bold mb-4">Corrigir Categoria</h2>
                        <p className="text-gray-400 mb-2">Arquivo:</p>
                        <p className="font-semibold text-white mb-6">{editingDoc.fileName}</p>

                        <form onSubmit={handleSaveCorrection}>
                            <div className="mb-4">
                                <label className="block text-gray-400 mb-2" htmlFor="current-category">Categoria Atual (IA)</label>
                                <input id="current-category" type="text" readOnly value={editingDoc.resultadoIa?.categoria || 'N/A'} className="w-full p-2 bg-gray-700 rounded-md text-gray-300 cursor-not-allowed" />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-400 mb-2" htmlFor="new-category">Nova Categoria (Correta)</label>
                                <input
                                    id="new-category"
                                    type="text"
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full p-2 bg-gray-900 rounded-md text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    required
                                />
                            </div>
                            <div className="flex justify-end gap-4">
                                <button type="button" onClick={handleCloseEditModal} className="py-2 px-4 bg-gray-600 hover:bg-gray-500 rounded-md">Cancelar</button>
                                <button type="submit" disabled={processando} className="py-2 px-4 bg-indigo-600 hover:bg-indigo-500 rounded-md disabled:bg-indigo-800">
                                    {processando ? 'Salvando...' : 'Salvar Correção'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Admin;