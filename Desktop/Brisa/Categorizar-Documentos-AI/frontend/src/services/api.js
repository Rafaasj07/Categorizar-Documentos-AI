import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Cria uma instância do axios pré-configurada com a URL base da API.
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor que adiciona o token JWT (do localStorage)
// ao cabeçalho de autorização de todas as requisições.
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

/**
 * Envia um arquivo e metadados (contexto, prompt) para a API
 * de categorização usando FormData.
 * Retorna o JSON da análise da IA.
 */
export const apiCategorizarComArquivo = async (contextoSelecionado, subContextoSelecionado, promptUsuario, arquivo) => {
  // FormData é necessário para enviar arquivos (multipart/form-data).
  const formData = new FormData();
  formData.append('contextoSelecionado', contextoSelecionado); 

  if (subContextoSelecionado) {
    formData.append('subContextoSelecionado', subContextoSelecionado);
  }

  formData.append('promptUsuario', promptUsuario); 
  formData.append('arquivo', arquivo); 

  try {
    // Realiza a requisição POST com o FormData.
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

/**
 * Busca uma lista paginada de documentos com base em filtros (params).
 * Retorna um objeto contendo { documentos, nextToken }.
 */
export const apiBuscarDocumentos = async (params = {}) => {
  try {
    const response = await api.get('documento/buscar', { params });
    return response.data;
  } catch (err) {
    console.error("Erro ao buscar documentos:", err);
    throw err;
  }
};

/**
 * Solicita o download de um documento específico (identificado pelo bucket/key).
 * Retorna o arquivo como um 'blob' (dados binários).
 */
export const apiDownloadDocumento = async (doc) => {
  try {
    const response = await api.post('documento/download', {
      bucketName: doc.bucketName,
      minioKey: doc.minioKey,
      fileName: doc.fileName
    }, {
      responseType: 'blob', // Indica ao axios para esperar uma resposta binária.
    });
    return response.data;
  } catch (err) {
    console.error("Erro ao baixar documento:", err);
    throw err;
  }
};

/**
 * Solicita a exclusão de um ou mais documentos.
 * Envia a lista de documentos no corpo (data) de uma requisição DELETE.
 */
export const apiApagarDocumento = async (documentos) => {
  try {
    const response = await api.delete('documento/apagar', {
      data: { documentos } // Passa os dados no corpo da requisição DELETE
    });
    return response.data;
  } catch (err) {
    console.error("Erro ao apagar documentos:", err);
    throw err;
  }
};

/**
 * Busca a lista de todas as categorias únicas já processadas.
 * Retorna um array de strings.
 */
export const apiListarCategorias = async () => {
  try {
    const response = await api.get('documento/categorias');
    return response.data;
  } catch (err) {
    console.error("Erro ao buscar categorias:", err);
    throw err;
  }
};

/**
 * Envia um novo feedback (rating) para um documento.
 */
export const apiSubmitFeedback = async (doc_uuid, rating) => {
    try {
        const response = await api.post('feedback', { doc_uuid, rating });
        return response.data;
    } catch (err) {
        console.error("Erro ao enviar feedback:", err);
        throw err;
    }
};

/**
 * (Admin) Busca os dados de feedback (voto único) para um documento.
 */
export const apiGetFeedbackAggregate = async (doc_uuid) => {
    try {
        const response = await api.get(`feedback/${doc_uuid}`);
        return response.data;
    } catch (err) {
        console.error("Erro ao buscar agregado de feedback:", err);
        throw err;
    }
};

/**
 * Verifica se o usuário já votou em um documento específico.
 */
export const apiCheckUserFeedback = async (doc_uuid) => {
    try {
        const response = await api.get(`feedback/check/${doc_uuid}`);
        return response.data; // Espera um objeto { hasVoted: boolean }
    } catch (err) {
        console.error("Erro ao verificar feedback:", err);
        throw err;
    }
};

/**
 * (Admin) Atualiza os metadados (resultadoIa) de um documento.
 */
export const apiAtualizarMetadados = async (doc_uuid, novoResultadoIa) => {
  try {
    const response = await api.put(`documento/metadados/${doc_uuid}`, { novoResultadoIa });
    return response.data;
  } catch (err) {
    console.error("Erro ao atualizar metadados:", err);
    throw err;
  }
};