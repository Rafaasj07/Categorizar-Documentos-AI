/**
 * components/ProtectedRoute.jsx
 * * Função Principal:
 * Componente de ordem superior que protege rotas na aplicação. Ele verifica
 * se o usuário está autenticado e se possui a permissão (role) necessária
 * para acessar a rota filha.
 * * Lógica:
 * 1.  Exibe uma mensagem de carregamento enquanto a autenticação é verificada.
 * 2.  Se não autenticado, redireciona para a página de login.
 * 3.  Se autenticado mas sem a permissão necessária, redireciona para uma página padrão.
 * 4.  Se autenticado e autorizado, renderiza o conteúdo da rota (`<Outlet />`).
 */

import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, userRole, loading } = useAuth();

    // Exibe uma mensagem de carregamento centralizada enquanto verifica a sessão
    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p>Verificando autenticação...</p>
            </div>
        );
    }

    // Se não estiver autenticado, redireciona para a página de login
    if (!isAuthenticated) {
        console.warn("Acesso negado: Usuário não autenticado. Redirecionando para /login.");
        return <Navigate to="/login" replace />;
    }

    // Se a rota exige papéis específicos e o usuário não os possui
    if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
        console.warn(`Acesso negado: Papel '${userRole}' não permitido. Redirecionando...`);
        // Redireciona para uma rota padrão com base no papel do usuário
        const redirectTo = userRole === 'admin' ? '/admin' : '/categorizar';
        return <Navigate to={redirectTo} replace />;
    }

    // Se o usuário está autenticado e autorizado, renderiza as rotas filhas
    return <Outlet />;
};

export default ProtectedRoute;
