import axios from 'axios';

// A URL base da API é lida do arquivo .env (usando Vite)
const API_URL = import.meta.env.VITE_API_URL;

// Função que envia o prompt + arquivo para a API
export const apiCategorizarComArquivo = async (promptUsuario, arquivo) => {
    try {
        // Cria um FormData, que é necessário para enviar arquivos via HTTP
        const formData = new FormData();

        // Adiciona o prompt do usuário no corpo da requisição
        formData.append('promptUsuario', promptUsuario);

        // Adiciona o arquivo PDF com o nome esperado pelo backend: 'arquivo'
        formData.append('arquivo', arquivo);

        // Faz uma requisição POST para o endpoint backend
        const response = await axios.post(
            `${API_URL}documento/categorizar-com-arquivo`, // URL final da rota
            formData, // Corpo da requisição
            {
                headers: {
                    // Define o cabeçalho correto para envio de arquivos
                    'Content-Type': 'multipart/form-data'
                }
            }
        );

        // Retorna o corpo da resposta (JSON) com os dados gerados pela IA
        return response.data;

    } catch (err) {
        // Loga o erro no console para fins de debug
        console.error("Erro ao chamar a API com arquivo", err);

        // Repassa o erro para quem chamou essa função (ex: hook ou componente)
        throw err;
    }
};
