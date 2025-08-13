import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

/**
 * Envia um arquivo PDF junto com uma instrução adicional para análise.
 * Utiliza FormData para multipart/form-data.
 * @param {string} promptUsuario - Texto adicional para a IA usar na análise.
 * @param {File} arquivo - Arquivo PDF selecionado pelo usuário.
 * @returns {Promise<Object>} - Resposta JSON da API com a análise.
 */
export const apiCategorizarComArquivo = async (promptUsuario, arquivo) => {
    try {
        const formData = new FormData();
        formData.append('promptUsuario', promptUsuario);
        formData.append('arquivo', arquivo);

        const response = await axios.post(
            `${API_URL}documento/categorizar-com-arquivo`,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            }
        );
        return response.data;
    } catch (err) {
        console.error("Erro ao chamar a API com arquivo", err);
        throw err;
    }
};

/**
 * Busca documentos na API com filtros, ordenação e paginação.
 * @param {object} params - Objeto com os parâmetros de busca.
 * @returns {Promise<Object>} - Objeto com a lista de documentos e o token da próxima página.
 */
export const apiBuscarDocumentos = async (params = {}) => {
    try {
        // LÓGICA REVERTIDA: A conversão do array de categorias foi removida.
        // Os parâmetros são enviados diretamente como estão.
        const response = await axios.get(`${API_URL}documento/buscar`, { params });
        return response.data;
    } catch (err) {
        console.error("Erro ao buscar documentos", err);
        throw err;
    }
};

/**
 * Solicita a geração da URL pré-assinada para download de um arquivo no S3.
 * @param {string} bucket - Nome do bucket onde está o arquivo.
 * @param {string} key - Chave (caminho) do arquivo no bucket.
 * @returns {Promise<string>} - URL temporária para download do arquivo.
 */
export const apiDownloadDocumento = async (bucket, key) => {
    try {
        // Passa bucket e key como parâmetros query string na requisição GET
        const response = await axios.get(`${API_URL}documento/download`, {
            params: { bucket, key }
        });
        return response.data.downloadUrl;
    } catch (err) {
        console.error("Erro ao obter link de download", err);
        throw err;
    }
};

/**
 * Envia uma requisição para apagar uma lista de documentos.
 * @param {Array<object>} documentos - Um array de objetos de documento a serem apagados.
 */
export const apiApagarDocumento = async (documentos) => {
    try {
        const response = await axios.delete(`${API_URL}documento/apagar`, {
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
 * @returns {Promise<Array>} - Array com as categorias encontradas.
 */
export const apiListarCategorias = async () => {
    try {
        const response = await axios.get(`${API_URL}documento/categorias`);
        return response.data;
    } catch (err) {
        console.error("Erro ao buscar categorias", err);
        throw err;
    }
};