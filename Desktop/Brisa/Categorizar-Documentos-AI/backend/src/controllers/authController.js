import User from '../models/user.js';
import jwt from 'jsonwebtoken';

// Função para registrar um novo usuário no sistema.
export const registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Verifica no banco de dados se o nome de usuário já está sendo utilizado.
        const userExists = await User.findOne({ username });
        if (userExists) {
            // Retorna erro 409 (Conflict) se o usuário já existir.
            return res.status(409).json({ mensagem: 'Este nome de usuário já está em uso.' });
        }

        // Se o usuário não existir, cria um novo registro no banco.
        const user = await User.create({ username, password });

        // Responde à requisição confirmando o sucesso ou informando o erro.
        if (user) {
            res.status(201).json({ message: "Usuário registrado com sucesso!" });
        } else {
            // Retorna erro 400 (Bad Request) para dados inválidos.
            res.status(400).json({ mensagem: 'Dados de usuário inválidos.' });
        }
    } catch (error) {
        // Captura erros inesperados e retorna um erro 500 (Internal Server Error).
        res.status(500).json({ mensagem: 'Ocorreu um erro interno no servidor.' });
    }
};

// Função para autenticar um usuário e gerar um token de acesso.
export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Busca o usuário pelo nome de usuário fornecido.
        const user = await User.findOne({ username });

        // Se o usuário não for encontrado ou a senha for inválida, retorna erro 401 (Unauthorized).
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ mensagem: 'Nome de usuário ou senha inválidos.' });
        }

        // Se a senha estiver correta, gera um token JWT com validade de 24 horas.
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });

        // Retorna os dados do usuário junto com o token de autenticação.
        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: token,
        });
    } catch (error) {
        // Captura erros inesperados e retorna um erro 500 (Internal Server Error).
        res.status(500).json({ mensagem: 'Ocorreu um erro interno no servidor.' });
    }
};