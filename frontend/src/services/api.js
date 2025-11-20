import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

// Intercepta requisições para injetar o token JWT do localStorage no header Authorization
api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem('userInfo');
    if (userInfo) {
      const { token } = JSON.parse(userInfo);
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`; 
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error); 
  }
);

export default api; 

// Envia arquivo e metadados via FormData para análise de categorização
export const apiCategorizarComArquivo = async (contextoSelecionado, subContextoSelecionado, promptUsuario, arquivo) => {
  const formData = new FormData();
  formData.append('contextoSelecionado', contextoSelecionado); 

  if (subContextoSelecionado) {
    formData.append('subContextoSelecionado', subContextoSelecionado);
  }

  formData.append('promptUsuario', promptUsuario); 
  formData.append('arquivo', arquivo); 

  try {
    const response = await api.post('documento/categorizar-com-arquivo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data; 
  } catch (err) {
    console.error("Erro ao chamar API com arquivo:", err);
    throw err;
  }
};

// Recupera lista de documentos aplicando filtros e paginação via query params
export const apiBuscarDocumentos = async (params = {}) => {
  try {
    const response = await api.get('documento/buscar', { params });
    return response.data;
  } catch (err) {
    console.error("Erro ao buscar documentos:", err);
    throw err;
  }
};

// Requisita download de arquivo configurando resposta como blob binário
export const apiDownloadDocumento = async (doc) => {
  try {
    const response = await api.post('documento/download', {
      bucketName: doc.bucketName,
      minioKey: doc.minioKey,
      fileName: doc.fileName
    }, {
      responseType: 'blob',
    });
    return response.data;
  } catch (err) {
    console.error("Erro ao baixar documento:", err);
    throw err;
  }
};

// Executa exclusão de documentos enviando lista de IDs no corpo da requisição
export const apiApagarDocumento = async (documentos) => {
  try {
    const response = await api.delete('documento/apagar', {
      data: { documentos }
    });
    return response.data;
  } catch (err) {
    console.error("Erro ao apagar documentos:", err);
    throw err;
  }
};

// Obtém lista de todas as categorias cadastradas
export const apiListarCategorias = async () => {
  try {
    const response = await api.get('documento/categorias');
    return response.data;
  } catch (err) {
    console.error("Erro ao buscar categorias:", err);
    throw err;
  }
};

// Envia avaliação (rating) do usuário para um documento específico
export const apiSubmitFeedback = async (doc_uuid, rating) => {
    try {
        const response = await api.post('feedback', { doc_uuid, rating });
        return response.data;
    } catch (err) {
        console.error("Erro ao enviar feedback:", err);
        throw err;
    }
};

// Busca dados agregados de feedback para exibição administrativa
export const apiGetFeedbackAggregate = async (doc_uuid) => {
    try {
        const response = await api.get(`feedback/${doc_uuid}`);
        return response.data;
    } catch (err) {
        console.error("Erro ao buscar agregado de feedback:", err);
        throw err;
    }
};

// Verifica se o usuário atual já realizou feedback no documento
export const apiCheckUserFeedback = async (doc_uuid) => {
    try {
        const response = await api.get(`feedback/check/${doc_uuid}`);
        return response.data; 
    } catch (err) {
        console.error("Erro ao verificar feedback:", err);
        throw err;
    }
};

// Atualiza manualmente os metadados extraídos pela IA (Admin)
export const apiAtualizarMetadados = async (doc_uuid, novoResultadoIa) => {
  try {
    const response = await api.put(`documento/metadados/${doc_uuid}`, { novoResultadoIa });
    return response.data;
  } catch (err) {
    console.error("Erro ao atualizar metadados:", err);
    throw err;
  }
};