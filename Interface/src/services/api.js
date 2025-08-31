/**
 * Configura e exporta uma instância do Axios para chamadas HTTP
 * ao backend.
 * Inclui um interceptor para inserir automaticamente o token
 * de autenticação do Cognito em cada requisição.
 */

// Importa a biblioteca Axios para fazer requisições HTTP.
import axios from 'axios';
// Importa a função do AWS Amplify para buscar a sessão de autenticação atual.
import { fetchAuthSession } from 'aws-amplify/auth';

// Pega a URL base da API a partir das variáveis de ambiente (.env).
const API_URL = import.meta.env.VITE_API_URL;

// Cria uma instância do Axios com a URL base pré-configurada.
const api = axios.create({
    baseURL: API_URL
});

// Adiciona um "interceptor" que executa uma função antes de cada requisição ser enviada.
api.interceptors.request.use(
    // Função que será executada antes de cada requisição.
    async (config) => {
        try {
            // Tenta recuperar a sessão do usuário logado.
            const session = await fetchAuthSession();
            
            // Extrai o token de autenticação (ID Token) da sessão.
            const token = session.tokens?.idToken?.toString();
            
            // Se um token for encontrado, adiciona-o ao cabeçalho 'Authorization' da requisição.
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            // Se não houver um usuário logado, apenas exibe um aviso no console.
            console.warn('Nenhuma sessão de usuário autenticado encontrada.');
        }
        // Retorna a configuração da requisição, modificada ou не, para que ela possa continuar.
        return config;
    },
    // Função que é executada se ocorrer um erro ao configurar a requisição.
    (error) => {
        // Rejeita a promessa, repassando o erro.
        return Promise.reject(error);
    }
);

// ====================== FUNÇÕES DE API ======================

/**
 * Envia um arquivo e um prompt para o endpoint de categorização da API.
 * @param {string} promptUsuario - O texto de instrução adicional.
 * @param {File} arquivo - O arquivo PDF a ser analisado.
 * @returns {Promise<Object>} A resposta JSON da API com a análise.
 */
export const apiCategorizarComArquivo = async (promptUsuario, arquivo) => {
    // Cria um objeto FormData para enviar dados de arquivo.
    const formData = new FormData();
    formData.append('promptUsuario', promptUsuario);
    formData.append('arquivo', arquivo);

    try {
        // Faz uma requisição POST para a rota de categorização.
        const response = await api.post('documento/categorizar-com-arquivo', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }, // Define o tipo de conteúdo como multipart.
        });
        return response.data; // Retorna os dados da resposta.
    } catch (err) {
        console.error("Erro ao chamar a API com arquivo", err);
        throw err; // Lança o erro para ser tratado pelo componente que chamou a função.
    }
};

/**
 * Busca documentos na API usando parâmetros de filtro e paginação.
 * @param {object} params - Os parâmetros de busca (ex: termo, categoria).
 * @returns {Promise<Object>} Um objeto contendo a lista de documentos.
 */
export const apiBuscarDocumentos = async (params = {}) => {
    try {
        // Faz uma requisição GET para a rota de busca, passando os parâmetros.
        const response = await api.get('documento/buscar', { params });
        return response.data;
    } catch (err) {
        console.error("Erro ao buscar documentos", err);
        throw err;
    }
};

/**
 * Solicita à API uma URL segura e temporária para download de um arquivo.
 * @param {string} bucket - O nome do bucket S3 onde o arquivo está.
 * @param {string} key - A chave (caminho) do arquivo no S3.
 * @returns {Promise<string>} A URL de download.
 */
export const apiDownloadDocumento = async (bucket, key) => {
    try {
        // Faz uma requisição GET para a rota de download.
        const response = await api.get(`documento/download`, {
            params: { bucket, key } // Envia o bucket e a key como parâmetros.
        });
        return response.data.downloadUrl; // Retorna apenas a URL da resposta.
    } catch (err) {
        console.error("Erro ao obter link de download", err);
        throw err;
    }
};

/**
 * Envia uma requisição para apagar uma lista de documentos.
 * @param {Array<object>} documentos - A lista de documentos a serem apagados.
 */
export const apiApagarDocumento = async (documentos) => {
    try {
        // Faz uma requisição DELETE para a rota de apagar.
        const response = await api.delete('documento/apagar', {
            data: { documentos } // Envia a lista de documentos no corpo da requisição.
        });
        return response.data;
    } catch (err) {
        console.error("Erro ao apagar documentos", err);
        throw err;
    }
};

/**
 * Busca a lista de todas as categorias de documentos únicas.
 * @returns {Promise<Array>} Um array com os nomes das categorias.
 */
export const apiListarCategorias = async () => {
    try {
        // Faz uma requisição GET para a rota que lista as categorias.
        const response = await api.get('documento/categorias');
        return response.data;
    } catch (err) {
        console.error("Erro ao buscar categorias", err);
        throw err;
    }
};