/**
 * Protege rotas com base no estado de autenticação e no papel (role) do usuário,
 * utilizando o contexto de autenticação.
 */

import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { APP_CONFIG, USER_ROLES } from '../constants/appConstants';

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, userRole, loading } = useAuth();

    // Mostra uma mensagem de carregamento enquanto a autenticação é verificada
    if (loading) {
        return <div>Verificando autenticação...</div>;
    }

    // Se não está autenticado, redireciona para a página de login
    if (!isAuthenticated) {
        return <Navigate to={APP_CONFIG.LOGIN_PATH} replace />;
    }

    // Se a rota exige um papel e o usuário não o tem, redireciona
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        const homeRoute = userRole === USER_ROLES.ADMIN ? APP_CONFIG.DEFAULT_ADMIN_PATH : APP_CONFIG.DEFAULT_USER_PATH;
        return <Navigate to={homeRoute} replace />;
    }

    // Se estiver autenticado e autorizado, renderiza a rota filha
    return <Outlet />;
};

export default ProtectedRoute;