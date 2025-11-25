import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

//Conecta ao banco de dados MongoDB via URI definida no ambiente 
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