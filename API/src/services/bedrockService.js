// Importa o cliente do Bedrock e o comando para invocar o modelo da AWS.
import {
    BedrockRuntimeClient,
    InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";
// Importa a biblioteca 'dotenv' para carregar variáveis de ambiente de um arquivo .env.
import dotenv from 'dotenv';
// Importa uma função local para extrair e validar JSON de uma string.
import { extrairJson } from '../utils/jsonValidator.js';

// Carrega as variáveis de ambiente do arquivo .env.
dotenv.config();

// Cria uma instância do cliente do Bedrock, configurado para a região da AWS definida nas variáveis de ambiente.
const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
// Define o ID do modelo de IA (Claude 3 Haiku) que será usado.
const modelId = "anthropic.claude-3-haiku-20240307-v1:0";

/**
 * Envia um prompt para o modelo de IA da AWS (Bedrock) e processa a resposta.
 * @param {string} prompt - O texto de entrada para a IA.
 * @returns {Promise<object>} O objeto JSON extraído da resposta da IA.
 */
export async function invocarBedrock(prompt) {
    try {
        // Monta o payload (dados) que será enviado para a IA, incluindo o prompt e configurações.
        const payload = {
            anthropic_version: "bedrock-2023-05-31", // Versão da API da Anthropic.
            max_tokens: 2048, // Limite máximo de palavras na resposta.
            messages: [{
                role: "user", // Define que a mensagem é do usuário.
                content: [{
                    type: "text", // O conteúdo é do tipo texto.
                    text: prompt, // O prompt fornecido.
                }],
            }],
        };

        // Cria o comando para invocar o modelo de IA com o payload formatado.
        const command = new InvokeModelCommand({
            body: JSON.stringify(payload), // O corpo da requisição deve ser uma string JSON.
            contentType: "application/json", // Informa que o conteúdo é JSON.
            accept: "application/json", // Informa que esperamos uma resposta em JSON.
            modelId, // O ID do modelo a ser usado.
        });

        // Envia o comando para o serviço Bedrock e aguarda a resposta.
        const apiResponse = await client.send(command);
        // Decodifica o corpo da resposta, que vem em formato binário.
        const decodedBody = new TextDecoder().decode(apiResponse.body);
        // Converte a string da resposta em um objeto JavaScript.
        const responseBody = JSON.parse(decodedBody);
        // Extrai o texto principal da resposta da IA.
        const textoResposta = responseBody.content[0].text;

        // Exibe a resposta bruta da IA no console para fins de depuração.
        console.log("--- Resposta Bruta da IA (Antes de extrair JSON) ---");
        console.log(textoResposta);
        console.log("----------------------------------------------------");

        // Utiliza a função 'extrairJson' para limpar e validar o JSON recebido da IA.
        return extrairJson(textoResposta);

    } catch (error) {
        // Se ocorrer qualquer erro, exibe a mensagem no console.
        console.error("Erro no serviço Bedrock:", error.message);
        // Lança um novo erro para ser tratado por quem chamou esta função.
        throw new Error("Não foi possível obter e processar uma resposta válida do serviço de IA.");
    }
}