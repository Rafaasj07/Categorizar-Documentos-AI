import User from '../models/user.js';
import jwt from 'jsonwebtoken';

// Registra novo usuário e loga a ação
export const registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const userExists = await User.findOne({ username });
        if (userExists) {
            console.warn(`[AUTH] Tentativa de cadastro duplicado: ${username}`);
            return res.status(409).json({ mensagem: 'Este nome de usuário já está em uso.' });
        }

        const user = await User.create({ username, password });

        if (user) {
            console.log(`[AUTH] Novo usuário registrado: ${username} (ID: ${user._id})`);
            res.status(201).json({ message: "Usuário registrado com sucesso!" });
        } else {
            res.status(400).json({ mensagem: 'Dados de usuário inválidos.' });
        }
    } catch (error) {
        console.error(`[AUTH] Erro no registro: ${error.message}`);
        res.status(500).json({ mensagem: 'Ocorreu um erro interno no servidor.' });
    }
};

// Realiza login e gera token JWT
export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        if (!user || !(await user.matchPassword(password))) {
            console.warn(`[AUTH] Falha de login para: ${username}`);
            return res.status(401).json({ mensagem: 'Nome de usuário ou senha inválidos.' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });

        console.log(`[AUTH] Login efetuado: ${username} (${user.role})`);

        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: token,
        });
    } catch (error) {
        console.error(`[AUTH] Erro no login: ${error.message}`);
        res.status(500).json({ mensagem: 'Ocorreu um erro interno no servidor.' });
    }
};