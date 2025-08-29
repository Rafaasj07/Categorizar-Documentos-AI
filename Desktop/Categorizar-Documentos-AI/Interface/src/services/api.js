/**
 * services/api.js
 * * Função Principal:
 * Este arquivo configura e exporta uma instância do Axios, que é usada para fazer
 * todas as chamadas HTTP para o nosso backend (API Gateway + Lambda).
 * Inclui todas as rotas da versão antiga e nova.
 */

import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';
import awsExports from '../aws-exports'; // Importa as configurações da AWS

// Pega a configuração da API do arquivo aws-exports.js
const apiConfig = awsExports.API.endpoints.find(
    (endpoint) => endpoint.name === "MinhaAPIDeDocumentos"
);

if (!apiConfig) {
    throw new Error("Configuração da API não encontrada no arquivo aws-exports.js. Verifique o nome da API.");
}

const api = axios.create({
    baseURL: apiConfig.endpoint
});

// Interceptor para adicionar o token de autenticação JWT do Cognito em cada requisição
api.interceptors.request.use(
    async (config) => {
        try {
            const session = await fetchAuthSession();
            const token = session.tokens?.idToken?.toString();
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.warn('Nenhuma sessão de usuário autenticado encontrada. Requisição enviada sem token.');
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

//--- Funções de API ---

/**
 * Envia um arquivo PDF junto com uma instrução adicional para análise.
 * Versão compatível com a página Categorizar.jsx.
 */
export const categorizarDocumentoComArquivo = async (arquivo, promptUsuario) => {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('promptUsuario', promptUsuario || '');
    try {
        const response = await api.post('/documento/categorizar-com-arquivo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao categorizar documento:', error);
        throw new Error(error.response?.data?.erro || 'Falha ao enviar o documento para análise.');
    }
};

/**
 * Busca documentos com base em vários parâmetros.
 * Esta função é a mesma que a apiBuscarDocumentos, mas com um nome mais genérico.
 */
export const searchDocuments = async (params = {}) => {
    try {
        const response = await api.get('/documento/buscar', { params });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar documentos:', error);
        throw error;
    }
};

/**
 * Função de busca de documentos para manter a compatibilidade com o Admin.jsx antigo.
 * É um alias para searchDocuments.
 */
export const apiBuscarDocumentos = async (params = {}) => {
  return await searchDocuments(params);
};

/**
 * Obtém uma URL de download segura para um documento.
 */
export const apiDownloadDocumento = async (bucketName, s3Key) => {
    try {
        const response = await api.get(`/documento/download`, {
            params: { bucket: bucketName, key: s3Key }
        });
        const downloadUrl = response.data.downloadUrl;
        if (downloadUrl) {
            window.open(downloadUrl, '_blank');
        } else {
            throw new Error("URL de download não recebida da API.");
        }
        return downloadUrl;
    } catch (error) {
        console.error('Erro ao obter URL de download:', error);
        throw error;
    }
};

/**
 * Envia uma requisição para apagar uma lista de documentos.
 * @param {Array<object>} documentos - Um array de objetos de documento a serem apagados.
 */
export const apiApagarDocumento = async (documentos) => {
    try {
        // Use a instância 'api' do Axios em vez de 'axios' com a API_URL
        const response = await api.delete('/documento/apagar', {
            data: { documentos } // Envia o array dentro de um objeto
        });
        return response.data;
    } catch (err) {
        console.error("Erro ao apagar documentos", err);
        throw err;
    }
};
/**
 * Busca a lista de categorias únicas de documentos.
 */
export const apiListarCategorias = async () => {
    try {
        const response = await api.get('/documento/categorias');
        return response.data;
    } catch (error) {
        console.error('Erro ao listar categorias:', error);
        return [];
    }
};

export default api;