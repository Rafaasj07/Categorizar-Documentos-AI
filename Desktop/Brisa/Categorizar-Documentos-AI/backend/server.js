import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import documentoRoute from './src/routes/documentoRoute.js';
import authRoute from './src/routes/authRoute.js';
import feedbackRoute from './src/routes/feedbackRoute.js'; 
import cors from 'cors';
import connectDB from './src/config/db.js';
import { criarBucketSeNaoExistir } from './src/services/minioService.js';
import seedUsers from './src/config/seed.js';

const app = express();

// Conecta ao MongoDB e, se bem-sucedido, executa o seed de usuários.
connectDB().then(() => {
    seedUsers();
});

const PORT = process.env.PORT || 3001;
// Configura as opções de CORS com base no .env ou usa um padrão.
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

// Aplica o middleware de CORS para permitir requisições externas.
app.use(cors(corsOptions)); 
// Aplica o middleware para fazer o parse de requisições com body JSON.
app.use(express.json());    

// Define as rotas principais da aplicação.
app.use('/api/documento', documentoRoute);
app.use('/api/auth', authRoute);
app.use('/api/feedback', feedbackRoute); 

// Inicia o servidor Express na porta definida.
app.listen(PORT, async () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    // Garante que o bucket no MinIO exista antes de aceitar uploads.
    await criarBucketSeNaoExistir(); 
});