import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime"; // SDK AWS para usar Bedrock
import dotenv from 'dotenv';
import { extrairJson } from '../utils/jsonValidator.js'; // Função para validar e extrair JSON

dotenv.config(); // Carrega variáveis do arquivo .env

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION }); // Inicializa cliente Bedrock
const modelId = "anthropic.claude-3-haiku-20240307-v1:0"; // ID do modelo a ser usado

// Função para enviar prompt ao Bedrock e retornar a resposta processada
export async function invocarBedrock(prompt) {
    try {
        // Monta payload com o prompt do usuário
        const payload = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 2048, // Limite de tokens
            messages: [{
                role: "user",
                content: [{
                    type: "text",
                    text: prompt, // Texto enviado ao modelo
                }],
            }],
        };

        // Cria comando para invocar o modelo Bedrock
        const command = new InvokeModelCommand({
            body: JSON.stringify(payload), // Converte payload para JSON
            contentType: "application/json",
            accept: "application/json",
            modelId,
        });

        const apiResponse = await client.send(command); // Envia comando para Bedrock
        const decodedBody = new TextDecoder().decode(apiResponse.body); // Decodifica resposta em texto
        const responseBody = JSON.parse(decodedBody); // Converte texto para objeto
        const textoResposta = responseBody.content[0].text; // Pega texto da resposta

        // Extrai JSON da resposta usando função utilitária
        return extrairJson(textoResposta);

    } catch (error) {
        // Captura erro de envio ou de parsing de JSON
        console.error("Erro no serviço Bedrock:", error.message);
        throw new Error("Não foi possível obter e processar uma resposta válida do serviço de IA.");
    }
}
