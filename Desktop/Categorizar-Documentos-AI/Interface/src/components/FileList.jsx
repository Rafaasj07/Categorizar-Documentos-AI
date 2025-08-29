/**
 * components/FileList.jsx
 * * Função Principal:
 * Exibe uma lista de documentos que foram processados ou estão em processamento.
 * Permite a busca e exibe informações detalhadas de cada documento.
 * * Estilização:
 * Utiliza Tailwind CSS para um layout moderno e responsivo.
 */

import { useState, useEffect } from 'react';
// A função aqui deve ser a mesma usada na sua API, ex: apiBuscarDocumentos
import { apiBuscarDocumentos } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FileList = ({ refreshTrigger }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { isAuthenticated, isAdmin } = useAuth();

    const fetchDocuments = async () => {
        if (!isAuthenticated) {
            setDocuments([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        try {
            // A Lambda de busca usará o token JWT para filtrar os resultados
            const data = await apiBuscarDocumentos(searchTerm);
            setDocuments(data);
        } catch (err) {
            setError('Erro ao carregar documentos. Verifique a API e as permissões.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [isAuthenticated, refreshTrigger, searchTerm]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    if (!isAuthenticated) {
        return (
            <div className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
                <p>Por favor, faça login para visualizar os documentos.</p>
            </div>
        );
    }

    if (loading) {
        return <div className="p-5 text-center">Carregando documentos...</div>;
    }

    if (error) {
        return (
            <div className="p-5 text-red-700 border border-red-300 rounded-lg bg-red-50">
                {error}
            </div>
        );
    }

    return (
        <div className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">
                Documentos Processados
                <span className="text-gray-500 font-normal text-base ml-2">
                    {isAdmin ? '(Visão de Administrador)' : '(Meus Documentos)'}
                </span>
            </h2>
            <div className="mb-5">
                <input
                    type="text"
                    placeholder="Buscar por nome ou categoria..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="w-full p-2.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
            </div>
            {documents.length === 0 ? (
                <p>Nenhum documento encontrado.</p>
            ) : (
                <ul className="list-none p-0 divide-y divide-gray-200">
                    {documents.map((doc) => (
                        <li key={doc.documentId} className="py-4">
                            <p><strong className="font-medium">Nome:</strong> {doc.fileName}</p>
                            <p><strong className="font-medium">Categoria (IA):</strong> {doc.resultadoIa?.categoria || 'N/A'}</p>
                            <p><strong className="font-medium">Status:</strong> {doc.status || 'N/A'}</p>
                            <p><strong className="font-medium">Upload por:</strong> {doc.userId || 'N/A'}</p>
                            <p><strong className="font-medium">Correlation ID:</strong> {doc.correlationId || 'N/A'}</p>
                            {doc.resultadoIa?.metadados?.resumo && (
                                <p className="text-sm text-gray-600 mt-2 bg-gray-50 p-2 rounded">
                                    <strong className="font-medium">Resumo:</strong> {doc.resultadoIa.metadados.resumo}
                                </p>
                            )}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default FileList;
