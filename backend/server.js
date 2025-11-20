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

// Conecta ao banco de dados e popula usuários iniciais
connectDB().then(() => {
    seedUsers();
});

const PORT = process.env.PORT || 3001;
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

app.use(cors(corsOptions)); 
app.use(express.json());    

app.use('/api/documento', documentoRoute);
app.use('/api/auth', authRoute);
app.use('/api/feedback', feedbackRoute); 

// Inicia servidor e garante a criação do bucket de armazenamento
app.listen(PORT, async () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    await criarBucketSeNaoExistir(); 
});