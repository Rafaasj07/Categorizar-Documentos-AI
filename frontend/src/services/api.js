import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
});

// Intercepta requisições para injetar o token JWT
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

// Envia arquivo para categorização
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

// Busca documentos com filtros
export const apiBuscarDocumentos = async (params = {}) => {
  try {
    const response = await api.get('documento/buscar', { params });
    return response.data;
  } catch (err) {
    console.error("Erro ao buscar documentos:", err);
    throw err;
  }
};

// Download de arquivo
export const apiDownloadDocumento = async (doc) => {
  try {
    const response = await api.post('documento/download', {
      bucketName: doc.bucketName,
      storageKey: doc.storageKey,
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

// Exclusão de documentos
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

// Lista categorias
export const apiListarCategorias = async () => {
  try {
    const response = await api.get('documento/categorias');
    return response.data;
  } catch (err) {
    console.error("Erro ao buscar categorias:", err);
    throw err;
  }
};

// Envia feedback
export const apiSubmitFeedback = async (doc_uuid, rating) => {
    try {
        const response = await api.post('feedback', { doc_uuid, rating });
        return response.data;
    } catch (err) {
        console.error("Erro ao enviar feedback:", err);
        throw err;
    }
};

// Busca agregado de feedback
export const apiGetFeedbackAggregate = async (doc_uuid) => {
    try {
        const response = await api.get(`feedback/${doc_uuid}`);
        return response.data;
    } catch (err) {
        console.error("Erro ao buscar agregado de feedback:", err);
        throw err;
    }
};

// Verifica feedback do usuário
export const apiCheckUserFeedback = async (doc_uuid) => {
    try {
        const response = await api.get(`feedback/check/${doc_uuid}`);
        return response.data; 
    } catch (err) {
        console.error("Erro ao verificar feedback:", err);
        throw err;
    }
};

// Atualiza metadados manualmente
export const apiAtualizarMetadados = async (doc_uuid, novoResultadoIa) => {
  try {
    const response = await api.put(`documento/metadados/${doc_uuid}`, { novoResultadoIa });
    return response.data;
  } catch (err) {
    console.error("Erro ao atualizar metadados:", err);
    throw err;
  }
};