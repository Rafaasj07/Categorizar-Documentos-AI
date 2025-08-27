// Pré-processamento: busca de STATUS DE UPLOAD - lógica da página Categorizar antiga

// Ajustar para Pós-Processamento quando API de Busca finalizado

import { useState, useEffect } from 'react';
import { apiBuscarDocumentos } from '../services/api';
import { useAuth } from '../context/AuthContext';

const FileList = ({ refreshTrigger }) => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const { isAuthenticated, isAdmin } = useAuth(); // aqui, o backend vai usar o JWT

    // A lógica de filtragem por usuário de docs ou todos (caso admin) deve ser feita na API de Busca.
    const fetchDocuments = async () => {
        if (!isAuthenticated) {
            setDocuments([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');
        try {
            // A Lambda receberá o JWT e poderá verificar as claims do usuário (username, groups) para decidir o que retornar.
            const data = await apiBuscarDocumentos(searchTerm); 
            setDocuments(data);
        } catch (err) {
            setError('Erro ao carregar documentos. Verifique se a Lambda de busca está configurada, o endpoint e as permissões de acesso com Cognito.');
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
            <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#ffffff' }}>
                <p>Por favor, faça login para visualizar os documentos.</p>
            </div>
        );
    }

    if (loading) {
        return <div style={{ padding: '20px' }}>Carregando documentos...</div>;
    }

    if (error) {
        return <div style={{ padding: '20px', color: 'red', border: '1px solid red', borderRadius: '8px', backgroundColor: '#ffe0e0' }}>{error}</div>;
    }

    return (
        <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#ffffff' }}>
            <h2>Documentos Processados {isAdmin ? '(Todos - Via admin Group)' : '(Apenas documentos)'}</h2>
            <div style={{ marginBottom: '20px' }}>
                <input
                    type="text"
                    placeholder="Buscar por nome ou categoria..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
                />
            </div>
            {documents.length === 0 ? (
                <p>Nenhum documento encontrado.</p>
            ) : (
                <ul style={{ listStyleType: 'none', padding: 0 }}>
                    {documents.map((doc) => (
                        <li key={doc.documentId} style={{ borderBottom: '1px dashed #eee', padding: '10px 0' }}>
                            <strong>Nome:</strong> {doc.fileName} <br />
                            <strong>Categoria (IA):</strong> {doc.resultadoIa?.categoria || 'N/A'} <br />
                            <strong>Status:</strong> {doc.status || 'N/A'} <br />
                            <strong>Upload por:</strong> {doc.userId || 'N/A'} <br /> {/* user do Cognito retornado pela Lambda */}
                            <strong>Correlation ID:</strong> {doc.correlationId || 'N/A'} <br />
                            {doc.resultadoIa?.metadados?.resumo && (
                                <p style={{ fontSize: '0.9em', color: '#555', marginTop: '5px' }}>
                                    **Resumo:** {doc.resultadoIa.metadados.resumo}
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