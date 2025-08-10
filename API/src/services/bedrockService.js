import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime"; // SDK AWS para usar Bedrock
import dotenv from 'dotenv';

dotenv.config(); // Carrega variáveis do .env

// Cria cliente Bedrock usando região definida no .env
const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

// ID do modelo Claude no Bedrock
const modelId = "anthropic.claude-3-haiku-20240307-v1:0";

// Função para enviar prompt ao Bedrock e retornar resposta
export async function invocarBedrock(prompt) {
    try {
        // Monta payload da requisição
        const payload = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 2048,
            messages: [
                {
                    role: "user",
                    content: [
                        {
                            type: "text",
                            text: prompt,
                        },
                    ],
                },
            ],
        };

        // Cria comando para invocar o modelo
        const command = new InvokeModelCommand({
            body: JSON.stringify(payload),
            contentType: "application/json",
            accept: "application/json",
            modelId,
        });

        // Envia requisição para Bedrock
        const apiResponse = await client.send(command);

        // Decodifica e interpreta a resposta
        const decodedBody = new TextDecoder().decode(apiResponse.body);
        const responseBody = JSON.parse(decodedBody);
        const textoResposta = responseBody.content[0].text;

        // Retorna a resposta já convertida para objeto JSON
        return JSON.parse(textoResposta);

    } catch (error) {
        console.error("Erro ao invocar o Bedrock:", error);
        throw new Error("Não foi possível obter uma resposta do serviço de IA.");
    }
}
