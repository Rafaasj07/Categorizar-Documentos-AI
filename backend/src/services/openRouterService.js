import axios from 'axios';
import { extrairJson } from '../utils/jsonValidator.js';

// URL da API OpenRouter e chave de acesso (das variáveis de ambiente).
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Envia o prompt para a IA da OpenRouter e processa a resposta.
export async function invocarIA(prompt) {
    try {
        console.log("Invocando a API da OpenRouter...");

        // Monta o corpo da requisição com o modelo, prompt e formato desejado.
        const payload = {
            model: "mistralai/mistral-7b-instruct:free", // Modelo ultilizado
            messages: [
                {
                    role: "system",
                    content: "Você é um analista de documentos sênior, especializado em extrair informações estruturadas de textos complexos com altíssima precisão."
                },
                {
                    role: "user",
                    content: prompt // O prompt final do controller
                }
            ],
            response_format: { type: "json_object" }, // Garante que a IA retorne um JSON válido.
        };

        // Envia a requisição para a API da OpenRouter com autenticação.
        const response = await axios.post(OPENROUTER_API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const textoResposta = response.data.choices[0].message.content;

        console.log("--- Resposta Bruta da OpenRouter (Antes de extrair JSON) ---");
        console.log(textoResposta);
        console.log("-------------------------------------------------------");

        // Extrai e valida o JSON da resposta de texto da IA.
        return extrairJson(textoResposta);

    } catch (error) {
        // Em caso de erro, exibe detalhes e lança uma exceção.
        console.error("Erro no serviço OpenRouter:", error.message);
        if (error.response) {
            console.error("Dados do erro:", error.response.data);
        }
        throw new Error("Não foi possível obter uma resposta válida do serviço de IA.");
    }
}