import axios from 'axios';
import { extrairJson } from '../utils/jsonValidator.js';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;

// Realiza chamada à API OpenRouter com mecanismo de retry automático
export async function invocarIA(prompt, tentativasMaximas = 3) {
    let tentativaAtual = 0;

    // Loop para garantir o processamento mesmo em caso de instabilidade na rede
    while (tentativaAtual < tentativasMaximas) {
        tentativaAtual++;
        try {
            console.log(`Invocando API OpenRouter (Tentativa ${tentativaAtual}/${tentativasMaximas})...`);

            const payload = {
                model: "google/gemini-2.0-flash-exp:free",
                messages: [
                    {
                        role: "system",
                        content: "Você é um analista de documentos sênior. Extraia informações estruturadas com precisão e responda exclusivamente em JSON."
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ]
            };

            // Executa requisição POST para o OpenRouter com o modelo Gemini
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

            // Lança exceção definitiva ao atingir o limite máximo de tentativas
            if (tentativaAtual >= tentativasMaximas) {
                throw new Error("Não foi possível obter resposta da IA após várias tentativas.");
            }

            // Pausa a execução por 2 segundos antes de tentar novamente
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }
}
