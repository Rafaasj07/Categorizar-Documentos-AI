import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Estabelece conexão assíncrona com o banco de dados MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB conectado com sucesso.');
    } catch (error) {
        console.error('Erro ao conectar com o MongoDB:', error.message);
        process.exit(1);
    }
};

export default connectDB;