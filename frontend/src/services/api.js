import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Instância base do Axios configurada com a URL da API.
const api = axios.create({
  baseURL: API_URL,
});

// Adiciona um interceptor que anexa o token JWT a cada requisição.
api.interceptors.request.use(
  (config) => {
    // Pega as informações do usuário salvas no localStorage.
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      // Se o usuário estiver logado, adiciona o token ao cabeçalho Authorization.
      const { token } = JSON.parse(userInfo);
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Em caso de erro na configuração da requisição, rejeita a promessa.
    return Promise.reject(error);
  }
);

export default api;

// Envia um PDF e prompt do usuário para categorização.
export const apiCategorizarComArquivo = async (promptUsuario, arquivo) => {
  const formData = new FormData();
  formData.append('promptUsuario', promptUsuario);
  formData.append('arquivo', arquivo);
  try {
    // O cabeçalho 'Content-Type' é definido automaticamente pelo navegador para FormData.
    // O interceptor adicionará o cabeçalho 'Authorization' necessário.
    const response = await api.post('documento/categorizar-com-arquivo', formData);
    return response.data;
  } catch (err) {
    console.error("Erro ao chamar API com arquivo", err);
    throw err;
  }
};

// Busca documentos com parâmetros opcionais.
export const apiBuscarDocumentos = async (params = {}) => {
  try {
    const response = await api.get('documento/buscar', { params });
    return response.data;
  } catch (err) {
    console.error("Erro ao buscar documentos", err);
    throw err;
  }
};

// Obtém link de download de um documento específico.
export const apiDownloadDocumento = async (bucket, key) => {
  try {
    const response = await api.get('documento/download', {
      params: { bucket, key }
    });
    return response.data.downloadUrl;
  } catch (err) {
    console.error("Erro ao obter link de download", err);
    throw err;
  }
};

// Apaga documentos passados como array.
export const apiApagarDocumento = async (documentos) => {
  try {
    const response = await api.delete('documento/apagar', {
      data: { documentos }
    });
    return response.data;
  } catch (err) {
    console.error("Erro ao apagar documentos", err);
    throw err;
  }
};

// Lista todas as categorias disponíveis.
export const apiListarCategorias = async () => {
  try {
    const response = await api.get('documento/categorias');
    return response.data;
  } catch (err) {
    console.error("Erro ao buscar categorias", err);
    throw err;
  }
};