import User from '../models/user.js';
import jwt from 'jsonwebtoken';

// Função para registrar um novo usuário no sistema.
export const registerUser = async (req, res) => {
    const { username, password } = req.body;

    // Verifica no banco de dados se o nome de usuário já está sendo utilizado.
    const userExists = await User.findOne({ username });
    if (userExists) {
        return res.status(400).json({ message: 'Este nome de usuário já está em uso.' });
    }

    // Se o usuário não existir, cria um novo registro no banco.
    const user = await User.create({ username, password });

    // Responde à requisição confirmando o sucesso ou informando o erro.
    if (user) {
        res.status(201).json({ message: "Usuário registrado com sucesso!" });
    } else {
        res.status(400).json({ message: 'Dados de usuário inválidos.' });
    }
};

// Função para autenticar um usuário e gerar um token de acesso.
export const loginUser = async (req, res) => {
    const { username, password } = req.body;

    // Busca o usuário pelo nome de usuário fornecido.
    const user = await User.findOne({ username });

    // Se o usuário não for encontrado, retorna um erro de não autorizado.
    if (!user) {
        return res.status(401).json({ message: 'Usuário não encontrado.' });
    }

    // Valida se a senha fornecida corresponde à senha armazenada no banco.
    if (await user.matchPassword(password)) {
        // Se a senha estiver correta, gera um token JWT com validade de 24 horas.
        const token = jwt.sign({ id: user._id, role: user.role }, 'sua_chave_secreta_super_forte', {
            expiresIn: '24h',
        });

        // Retorna os dados do usuário junto com o token de autenticação.
        res.json({
            _id: user._id,
            username: user.username,
            role: user.role,
            token: token,
        });
    } else {
        // Se a senha estiver incorreta, retorna um erro.
        res.status(401).json({ message: 'Senha incorreta.' });
    }
};