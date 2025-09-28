import axios from 'axios';
import { extrairJson } from '../utils/jsonValidator.js';

// Define a URL do serviço Ollama rodando no Docker.
const OLLAMA_API_URL = 'http://ollama:11434/api/chat';

// Envia um prompt para a IA e processa a resposta.
export async function invocarOllama(prompt) {
    try {
        console.log("Invocando o modelo local do Ollama...");
        
        // Monta o corpo da requisição com o modelo, prompt e formato desejado.
        const payload = {
            model: "llama3",
            messages: [
                {
                    role: "user",
                    content: prompt
                }
            ],
            format: "json", // Garante que a IA retorne um JSON válido.
            stream: false
        };

        // Envia a requisição para a API do Ollama.
        const response = await axios.post(OLLAMA_API_URL, payload);

        const textoResposta = response.data.message.content;

        console.log("--- Resposta Bruta do Ollama (Antes de extrair JSON) ---");
        console.log(textoResposta);
        console.log("-------------------------------------------------------");

        // Extrai e valida o JSON da resposta de texto da IA.
        return extrairJson(textoResposta);

    } catch (error) {
        // Em caso de erro, exibe detalhes e lança uma exceção.
        console.error("Erro no serviço Ollama:", error.message);
        if (error.response) {
            console.error("Dados do erro:", error.response.data);
        }
        throw new Error("Não foi possível obter uma resposta válida do serviço de IA local.");
    }
}