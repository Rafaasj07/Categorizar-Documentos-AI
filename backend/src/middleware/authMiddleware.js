import jwt from 'jsonwebtoken';
import User from '../models/user.js';

// Middleware para proteger rotas, verificando se o usuário está autenticado via token JWT.
const protect = async (req, res, next) => {
    let token;

    // Procura pelo token no cabeçalho 'Authorization' da requisição.
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Extrai apenas a string do token, removendo o prefixo 'Bearer '.
            token = req.headers.authorization.split(' ')[1];
            // Decodifica e verifica a validade do token.
            const decoded = jwt.verify(token, 'sua_chave_secreta_super_forte');

            // Busca o usuário correspondente ao ID do token no banco de dados.
            // O campo 'password' é omitido da resposta por segurança.
            req.user = await User.findById(decoded.id).select('-password');
            
            // Confirma que o usuário do token ainda existe no sistema.
            if (!req.user) {
                return res.status(401).json({ message: 'Não autorizado, usuário não encontrado.' });
            }
            
            // Se a autenticação for bem-sucedida, passa para a próxima etapa da requisição.
            next();
        } catch (error) {
            // Se o token for inválido ou expirado, retorna um erro de autorização.
            return res.status(401).json({ message: 'Não autorizado, token inválido.' });
        }
    }

    // Se nenhum token for encontrado, retorna um erro.
    if (!token) {
        return res.status(401).json({ message: 'Não autorizado, token não encontrado.' });
    }
};

// Middleware para verificar se o usuário autenticado tem permissões de administrador.
const admin = (req, res, next) => {
    // Checa se o usuário foi anexado à requisição (pelo middleware 'protect') e se sua role é 'admin'.
    if (req.user && req.user.role === 'admin') {
        // Se for um administrador, permite que a requisição continue.
        next();
    } else {
        // Caso contrário, bloqueia o acesso com um erro de autorização.
        res.status(401).json({ message: 'Não autorizado como administrador.' });
    }
};

export { protect, admin };