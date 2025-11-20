import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import documentoRoute from './src/routes/documentoRoute.js';
import authRoute from './src/routes/authRoute.js';
import feedbackRoute from './src/routes/feedbackRoute.js';
import connectDB from './src/config/db.js';
import seedUsers from './src/config/seed.js';
import { criarBucketSeNaoExistir } from './src/services/minioService.js';
import swaggerSpec from './src/config/swagger.js';

const app = express();

// Conecta DB e popula usuários
connectDB().then(() => {
    seedUsers();
});

const PORT = process.env.PORT || 3001;
const corsOptions = {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
};

app.use(cors(corsOptions));
app.use(express.json());

// Rota da Documentação Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas da API
app.use('/api/documento', documentoRoute);
app.use('/api/auth', authRoute);
app.use('/api/feedback', feedbackRoute);

// Inicialização
app.listen(PORT, async () => {
    console.log(`Servidor rodando na porta ${PORT}`);
    console.log(`Documentação Swagger disponível em http://localhost:${PORT}/api-docs`);
    await criarBucketSeNaoExistir();
});