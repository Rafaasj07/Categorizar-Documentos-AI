// --- IMPORTAÇÕES ESSENCIAIS ---
// 1. Carrega as variáveis de ambiente PRIMEIRO
import dotenv from 'dotenv';
dotenv.config();
// 2. Importa os outros módulos
import express from 'express';
import documentoRoute from './src/routes/documentoRoute.js';
import cors from 'cors';

// Cria a aplicação Express
const app = express();

// Define a porta do servidor, usando a variável de ambiente ou 3001 por padrão
const PORT = process.env.PORT || 3001;

// --- CONFIGURAÇÃO DE CORS CORRIGIDA ---
// Configura as permissões de CORS de forma mais aberta para desenvolvimento
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Permite todos os métodos
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token'], // Permite cabeçalhos importantes
  credentials: true,
};

// Aplica o middleware de CORS com as opções definidas
app.use(cors(corsOptions));

// Habilita a resposta automática para todos os pedidos pre-flight (OPTIONS)
// Isto é crucial para que o navegador permita o pedido POST principal
app.options('*', cors(corsOptions));

// Middleware para interpretar requisições com corpo JSON
app.use(express.json());

// Usa o arquivo de rotas para lidar com as requisições que começarem com "/api/documento"
app.use('/api/documento', documentoRoute);

// Inicia o servidor e exibe uma mensagem no terminal quando estiver rodando
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});