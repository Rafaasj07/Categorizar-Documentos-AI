import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Define a função que executa a conexão com o banco.
const connectDB = async () => {
    try {
        // Tenta se conectar usando a URL guardada no arquivo .env.
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB conectado com sucesso.');
    } catch (error) {
        // Em caso de falha, exibe o erro e encerra a aplicação.
        console.error('Erro ao conectar com o MongoDB:', error.message);
        process.exit(1);
    }
};

export default connectDB;