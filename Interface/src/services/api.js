/**
 * Configura e exporta uma instância do Axios para chamadas HTTP
 * ao backend monolítico.
 * Inclui um interceptor para inserir automaticamente o token
 * de autenticação JWT do Cognito em cada requisição.
 */

import axios from 'axios';
import { fetchAuthSession } from 'aws-amplify/auth';

// Pega a URL base da API do backend a partir das variáveis de ambiente (.env)
const API_URL = import.meta.env.VITE_API_URL;

// Cria uma instância do Axios com a baseURL configurada
const api = axios.create({
    baseURL: API_URL
});

// Interceptor de requisição: executa antes de cada chamada HTTP
api.interceptors.request.use(
    async (config) => {
        try {
            // Recupera a sessão atual do usuário autenticado pelo Cognito
            const session = await fetchAuthSession();
            
            // Extrai o token JWT de autenticação (ID Token)
            const token = session.tokens?.idToken?.toString();
            
            // Se existir token, adiciona no cabeçalho "Authorization"
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            // Caso não haja usuário autenticado, apenas avisa no console
            console.warn('Nenhuma sessão de usuário autenticado encontrada.');
        }
        return config; // Retorna a config da requisição (com ou sem token)
    },
    (error) => {
        // Em caso de erro no interceptor, rejeita a promessa
        return Promise.reject(error);
    }
);

// ====================== FUNÇÕES DE API ======================

// Envia um arquivo + prompt para categorização
export const apiCategorizarComArquivo = async (promptUsuario, arquivo) => {
    const formData = new FormData();
    formData.append('promptUsuario', promptUsuario);
    formData.append('arquivo', arquivo);

    try {
        // POST multipart/form-data para a rota "documento/categorizar-com-arquivo"
        const response = await api.post('documento/categorizar-com-arquivo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    } catch (err) {
        console.error("Erro ao chamar a API com arquivo", err);
        throw err;
    }
};

// Busca documentos com filtros (params são enviados como query string)
export const apiBuscarDocumentos = async (params = {}) => {
    try {
        const response = await api.get('documento/buscar', { params });
        return response.data;
    } catch (err) {
        console.error("Erro ao buscar documentos", err);
        throw err;
    }
};

// Obtém link de download de um documento (pré-assinado pelo backend)
export const apiDownloadDocumento = async (bucket, key) => {
    try {
        const response = await api.get(`documento/download`, {
            params: { bucket, key } // bucket e key enviados como query string
        });
        return response.data.downloadUrl;
    } catch (err) {
        console.error("Erro ao obter link de download", err);
        throw err;
    }
};

// Apaga documentos enviando lista de IDs/nomes no corpo da requisição
export const apiApagarDocumento = async (documentos) => {
    try {
        const response = await api.delete('documento/apagar', {
            data: { documentos } // DELETE com payload (lista de documentos)
        });
        return response.data;
    } catch (err) {
        console.error("Erro ao apagar documentos", err);
        throw err;
    }
};

// Lista todas as categorias disponíveis no backend
export const apiListarCategorias = async () => {
    try {
        const response = await api.get('documento/categorias');
        return response.data;
    } catch (err) {
        console.error("Erro ao buscar categorias", err);
        throw err;
    }
};
