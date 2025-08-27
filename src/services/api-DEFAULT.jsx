// Ajustando as chamadas: adaptação para JWT do Cognito

import axios from 'axios';
import { getCurrentUser, fetchAuthSession } from 'aws-amplify/auth';

const api = axios.create({
    
    baseURL: 'https://URLdaAPI.execute-api.regiaoAPI.amazonaws.com/estagio' // Usar a URL base do API Gateway
});

// Interceptor para adicionar o token de autenticação JWT do Cognito -> Amplify (acesso front)
api.interceptors.request.use(
    async (config) => {
        try {
            const session = await getCurrentUser();
            const token = fetchAuthSession(session);
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.warn('Nenhuma sessão de usuário autenticado encontrada. Requisição sem token de autorização.');
            // Você pode redirecionar para a página de login aqui se a rota exigir autenticação
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// --- Funções para URL e para Upload, respectivamente ---
export const getPresignedUrl = async (fileName, fileType, correlationId = '') => {
    try {
        const response = await api.get('/api/documento/get-upload-url', {
            params: { fileName, fileType },
            headers: {
                'X-Correlation-Id': correlationId // Envia o Correlation ID para rastreabilidade
            }
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao obter URL pré-assinada:', error);
        throw error;
    }
};

export const uploadFileToS3 = async (uploadURL, file, contentType) => {
    try {
        await axios.put(uploadURL, file, {
            headers: {
                'Content-Type': contentType,
            },
        });
        console.log('Upload direto para S3 concluído com sucesso!');
        return true;
    } catch (error) {
        console.error('Erro ao fazer upload direto para S3:', error);
        throw error;
    }
};

// --- Funções para Busca ---
export const searchDocuments = async (query = '') => {
    try {
        const response = await api.get('/sua/api/path', {
            params: { q: query } // Adapte os parâmetros conforme sua Lambda de busca
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar documentos:', error);
        throw error;
    }
};

export default api;
