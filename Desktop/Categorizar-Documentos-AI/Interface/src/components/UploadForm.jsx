/**
 * components/UploadForm.jsx
 * * Função Principal:
 * Fornece uma interface para o usuário selecionar e enviar um único arquivo.
 * Gerencia o estado de upload e exibe mensagens de sucesso ou erro.
 * * Estilização:
 * Utiliza Tailwind CSS para um design coeso e responsivo.
 */

import { useState } from 'react';
// Corrigindo a importação para usar a função correta da nossa API
import { getPresignedUrl, uploadFileToS3 } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { v4 as uuidv4 } from 'uuid'; // Para gerar um Correlation ID único

const UploadForm = ({ onUploadSuccess }) => {
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const { isAuthenticated } = useAuth();

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
            // CORREÇÃO: Usando a função 'getPresignedUrl' do nosso arquivo api.js
            const presignedData = await getPresignedUrl(
                selectedFile.name,
                selectedFile.type,
                correlationId
            );

            const { uploadURL, s3Key } = presignedData;

            // Faz o upload do arquivo diretamente para o S3
            await uploadFileToS3(uploadURL, selectedFile, selectedFile.type);

            setMessage(`Upload concluído! O processamento foi iniciado no servidor.`);
            setSelectedFile(null);
            
            // Limpa o input de arquivo
            e.target.reset();

            // Chama a função de callback para atualizar a lista de arquivos
            if (onUploadSuccess) {
                onUploadSuccess();
            }

        } catch (error) {
            setMessage(`Falha no upload: ${error.message}.`);
            console.error('Detalhes do erro de upload:', error);
        } finally {
            setUploading(false);
        }
    };

    // Define as classes da mensagem com base no seu conteúdo (erro, sucesso, etc.)
    const messageClasses = message.includes('Falha')
        ? 'text-red-600'
        : 'text-green-600';

    return (
        <div className="p-5 border border-gray-200 rounded-lg mb-5 bg-white shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Upload de Documento</h2>
            <form onSubmit={handleUpload}>
                <input
                    type="file"
                    onChange={handleFileChange}
                    disabled={uploading || !isAuthenticated}
                    className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none mb-4 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                    type="submit"
                    disabled={uploading || !selectedFile || !isAuthenticated}
                    className="bg-blue-600 text-white py-2 px-5 border-none rounded-md cursor-pointer transition-colors hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {uploading ? 'Enviando...' : 'Fazer Upload'}
                </button>
            </form>
            {message && (
                <p className={`mt-4 font-medium ${messageClasses}`}>
                    {message}
                </p>
            )}
            {!isAuthenticated && (
                <p className="text-yellow-600 mt-2.5 text-sm">
                    Faça login para habilitar o upload.
                </p>
            )}
        </div>
    );
};

export default UploadForm;
