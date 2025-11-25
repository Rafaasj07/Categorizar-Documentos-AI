import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import documentoRoute from './src/routes/documentoRoute.js';
import authRoute from './src/routes/authRoute.js';
import cors from 'cors';
import connectDB from './src/config/db.js';
import { criarBucketSeNaoExistir } from './src/services/minioService.js';
import seedUsers from './src/config/seed.js';

const app = express();

// conecta ao banco de dados e insere usuários iniciais
connectDB().then(() => {
    seedUsers();
});

const PORT = process.env.PORT || 3001;
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

app.use(cors(corsOptions)); // habilita CORS com opções configuradas
app.use(express.json());    // permite receber requisições em JSON

// rotas principais da API
app.use('/api/documento', documentoRoute);
app.use('/api/auth', authRoute);

app.listen(PORT, async () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    await criarBucketSeNaoExistir(); // garante que o bucket do MinIO exista ao iniciar
});
