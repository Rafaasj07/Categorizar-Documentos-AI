import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Cria uma instância do axios pré-configurada com a URL base da API.
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor do axios que adiciona o token JWT (do localStorage)
// ao cabeçalho 'Authorization' de todas as requisições enviadas.
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
 * Envia um arquivo e seus metadados (contexto, subcontexto, prompt)
 * para a API de categorização usando FormData.
 * Retorna o JSON da análise da IA.
 */
export const apiCategorizarComArquivo = async (contextoSelecionado, subContextoSelecionado, promptUsuario, arquivo) => {
  // FormData é necessário para enviar arquivos (multipart/form-data).
  const formData = new FormData();
  formData.append('contextoSelecionado', contextoSelecionado); 

  // Adiciona o subContexto ao FormData apenas se ele tiver um valor.
  if (subContextoSelecionado) {
    formData.append('subContextoSelecionado', subContextoSelecionado);
  }

  formData.append('promptUsuario', promptUsuario); 
  formData.append('arquivo', arquivo); 

  try {
    const response = await api.post('documento/categorizar-com-arquivo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Define o tipo de conteúdo
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