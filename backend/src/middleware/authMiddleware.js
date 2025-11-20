import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Valida token JWT e anexa usuário autenticado à requisição
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Decodifica token e busca usuário no banco sem retornar a senha
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({ message: 'Não autorizado, usuário não encontrado.' });
            }

            next();
        } catch (error) {
            return res.status(401).json({ message: 'Não autorizado, token inválido.' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Não autorizado, token não encontrado.' });
    }
};

// Restringe o acesso da rota apenas para administradores
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(401).json({ message: 'Não autorizado como administrador.' });
    }
};

export { protect, admin };