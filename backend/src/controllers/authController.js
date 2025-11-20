import User from '../models/user.js';
import jwt from 'jsonwebtoken';

// Registra um novo usuário verificando duplicidade
export const registerUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Verifica se usuário já existe no banco
        const userExists = await User.findOne({ username });
        if (userExists) {
            return res.status(409).json({ mensagem: 'Este nome de usuário já está em uso.' });
        }

        // Cria o registro do usuário
        const user = await User.create({ username, password });

        if (user) {
            res.status(201).json({ message: "Usuário registrado com sucesso!" });
        } else {
            res.status(400).json({ mensagem: 'Dados de usuário inválidos.' });
        }
    } catch (error) {
        res.status(500).json({ mensagem: 'Ocorreu um erro interno no servidor.' });
    }
};

// Autentica o usuário e gera token JWT
export const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ username });

        // Valida existência do usuário e compara hash da senha
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ mensagem: 'Nome de usuário ou senha inválidos.' });
        }

        // Gera token assinado com ID e role, válido por 24h
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '24h',
        });

        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: token,
        });
    } catch (error) {
        res.status(500).json({ mensagem: 'Ocorreu um erro interno no servidor.' });
    }
};