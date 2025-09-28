import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// instância base do Axios configurada com a URL da API
const api = axios.create({
  baseURL: API_URL,
});

export default api;

// envia um PDF e prompt do usuário para categorização
export const apiCategorizarComArquivo = async (promptUsuario, arquivo) => {
  const formData = new FormData();
  formData.append('promptUsuario', promptUsuario);
  formData.append('arquivo', arquivo);
  try {
    const response = await api.post('documento/categorizar-com-arquivo', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (err) {
    console.error("Erro ao chamar API com arquivo", err);
    throw err;
  }
};

// busca documentos com parâmetros opcionais
export const apiBuscarDocumentos = async (params = {}) => {
  try {
    const response = await api.get('documento/buscar', { params });
    return response.data;
  } catch (err) {
    console.error("Erro ao buscar documentos", err);
    throw err;
  }
};

// obtém link de download de um documento específico
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

// apaga documentos passados como array
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

// lista todas as categorias disponíveis
export const apiListarCategorias = async () => {
  try {
    const response = await api.get('documento/categorias');
    return response.data;
  } catch (err) {
    console.error("Erro ao buscar categorias", err);
    throw err;
  }
};
