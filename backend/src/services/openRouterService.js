import axios from 'axios';
import { extrairJson } from '../utils/jsonValidator.js';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Realiza chamada à API OpenRouter com mecanismo de retry automático
export async function invocarIA(prompt, tentativasMaximas = 3) {
    let tentativaAtual = 0;

    // Loop de tentativas para garantir resiliência a falhas
    while (tentativaAtual < tentativasMaximas) {
        tentativaAtual++;
        try {
            console.log(`Invocando API OpenRouter (Tentativa ${tentativaAtual}/${tentativasMaximas})...`);

            const payload = {
                model: "meta-llama/llama-3.3-70b-instruct:free", 
                messages: [
                    {
                        role: "system",
                        content: "Você é um analista de documentos sênior, especializado em extrair informações estruturadas de textos complexos com altíssima precisão."
                    },
                    {
                        role: "user",
                        content: prompt 
                    }
                ],
                response_format: { type: "json_object" }, 
            };

            // Executa requisição POST autenticada
            const response = await axios.post(OPENROUTER_API_URL, payload, {
                headers: {
                    'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            });

            const textoResposta = response.data.choices[0].message.content;
            console.log("Resposta da IA recebida.");

            return extrairJson(textoResposta);

        } catch (error) {
            console.error(`Erro OpenRouter (Tentativa ${tentativaAtual}):`, error.message);
            if (error.response) {
                console.error("Detalhes do erro:", error.response.data);
            }

            // Lança exceção se o limite de tentativas for excedido
            if (tentativaAtual >= tentativasMaximas) {
                throw new Error("Não foi possível obter resposta da IA após várias tentativas.");
            }

            // Aplica delay de 2 segundos antes da próxima tentativa
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}
