// Importa o cliente e comando para chamar modelos do Amazon Bedrock via AWS SDK (um conjunto de ferramentas que ajuda programadores a 
// usar uma tecnologia específica de forma mais fácil e organizada)
import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

import dotenv from 'dotenv';
dotenv.config(); // Carrega variáveis do arquivo .env (credenciais, região)

// Configura o cliente Bedrock com região e credenciais AWS
const client = new BedrockRuntimeClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
});

// Define qual modelo será usado (Claude 3 Haiku, versão de março/2024)
const modelId = "anthropic.claude-3-haiku-20240307-v1:0";

// Função para enviar prompt ao modelo e receber resposta JSON
export async function invocarBedrock(prompt) {
    try {
        // Monta o corpo da requisição conforme esperado pelo modelo Anthropic
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

        // Cria o comando para enviar ao Bedrock via SDK
        const command = new InvokeModelCommand({
            body: JSON.stringify(payload),
            contentType: "application/json",
            accept: "application/json",
            modelId,
        });

        // Envia a requisição para a AWS Bedrock e aguarda resposta
        const apiResponse = await client.send(command);

        // Decodifica a resposta recebida (vem como um stream binário)
        const decodedBody = new TextDecoder().decode(apiResponse.body);

        // Converte a resposta JSON em objeto JavaScript
        const responseBody = JSON.parse(decodedBody);

        // Extrai o texto da resposta do modelo
        const textoResposta = responseBody.content[0].text;

        // Retorna o texto convertido para JSON (se for JSON válido)
        return JSON.parse(textoResposta);

    } catch (error) {
        console.error("Erro ao invocar o Bedrock:", error);
        throw new Error("Não foi possível obter uma resposta do serviço de IA.");
    }
}
