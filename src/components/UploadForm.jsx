// Lógica de upload para confiar na autenticação do backend via JWT -> S3.

// src/components/UploadForm.js
import { useState } from 'react';
import { apiCategorizarComArquivo, uploadFileToS3 } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid'; // Para gerar um Correlation ID único

const UploadForm = ({ onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const { isAuthenticated } = useAuth(); // Não precisa mais do currentUser.userId aqui, o backend vai extrair do JWT

    const handleFileChange = (event) => {
        setSelectedFile(event.target.files[0]);
        setMessage('');
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            setMessage('Por favor, selecione um arquivo para upload.');
            return;
        }
        if (!isAuthenticated) {
            setMessage('Por favor, faça login para fazer upload.');
            return;
        }

        setUploading(true);
        setMessage('Iniciando upload...');

        const correlationId = uuidv4(); 

        try {
            const presignedData = await apiCategorizarComArquivo(
                selectedFile.name,
                selectedFile.type,
                correlationId
            );

            const { uploadURL, s3Key } = presignedData;

            await uploadFileToS3(uploadURL, selectedFile, selectedFile.type);

            setMessage(`Upload para S3 concluído! Arquivo: ${s3Key}. Processamento em andamento... (Correlation ID: ${correlationId})`);
            setSelectedFile(null);
            
            if (onUploadSuccess) {
                onUploadSuccess(); 
            }

        } catch (error) {
            setMessage(`Falha no upload: ${error.message}. Verifique os logs do console.`);
            console.error('Detalhes do erro de upload:', error);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: '20px', border: '1px solid #e0e0e0', borderRadius: '8px', marginBottom: '20px', backgroundColor: '#ffffff' }}>
            <h2>Upload de Documento</h2>
            <form onSubmit={handleUpload}>
                <input 
                    type="file" 
                    onChange={handleFileChange} 
                    disabled={uploading || !isAuthenticated} 
                    style={{ marginBottom: '15px', display: 'block', width: '100%' }}
                />
                <button 
                    type="submit" 
                    disabled={uploading || !selectedFile || !isAuthenticated}
                    style={{ 
                        backgroundColor: '#007bff', 
                        color: 'white', 
                        padding: '10px 20px', 
                        border: 'none', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        opacity: (uploading || !selectedFile || !isAuthenticated) ? 0.6 : 1
                    }}
                >
                    {uploading ? 'Enviando...' : 'Fazer Upload'}
                </button>
            </form>
            {message && <p style={{ marginTop: '15px', color: message.includes('Falha') ? 'red' : 'green', fontWeight: 'bold' }}>{message}</p>}
            {!isAuthenticated && <p style={{ color: 'orange', marginTop: '10px' }}>Faça login para habilitar o upload.</p>}
        </div>
    );
};

export default UploadForm;