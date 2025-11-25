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
import swaggerSpec from './src/config/swagger.js';

const app = express();

// Conecta DB e cria usuários padrão
connectDB().then(() => {
    seedUsers();
});

const PORT = process.env.PORT || 3001;
const corsOptions = {
    origin: process.env.CORS_ORIGIN || '*',
};

app.use(cors(corsOptions));
app.use(express.json());

// Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Rotas
app.use('/api/documento', documentoRoute);
app.use('/api/auth', authRoute);
app.use('/api/feedback', feedbackRoute);

app.listen(PORT, async () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});