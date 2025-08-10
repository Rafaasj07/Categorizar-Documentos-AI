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

// Configura as permissões de CORS, permitindo acesso do frontend
const corsOptions = {
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// Aplica o middleware de CORS com as opções definidas
app.use(cors(corsOptions));

// Middleware para interpretar requisições com corpo JSON
app.use(express.json());

// Usa o arquivo de rotas para lidar com as requisições que começarem com "/api/documento"
app.use('/api/documento', documentoRoute);

// Inicia o servidor e exibe uma mensagem no terminal quando estiver rodando
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});