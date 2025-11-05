import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Define a estrutura (schema) para o modelo de usuário no banco de dados.
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, default: 'user' }
});

// Middleware que é executado ANTES de um usuário ser salvo no banco.
// Sua função é criptografar a senha automaticamente.
UserSchema.pre('save', async function(next) {
    // Se a senha não foi modificada, pula a criptografia.
    if (!this.isModified('password')) {
        return next();
    }
    // Gera um 'salt' para aumentar a segurança da criptografia.
    const salt = await bcrypt.genSalt(10);
    // Criptografa a senha e a substitui no documento antes de salvar.
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Adiciona um método ao modelo de usuário para comparar senhas.
UserSchema.methods.matchPassword = async function(enteredPassword) {
    // Compara a senha fornecida (texto plano) com a senha criptografada no banco.
    return await bcrypt.compare(enteredPassword, this.password);
};

// Cria o modelo 'User' a partir do schema definido.
const User = mongoose.model('User', UserSchema);

export default User;