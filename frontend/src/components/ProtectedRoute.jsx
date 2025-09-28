import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ allowedRoles }) => {
    const { isAuthenticated, userRole, loading } = useAuth();

    // exibe um spinner enquanto valida autenticação
    if (loading) {
        return <LoadingSpinner />;
    }

    // redireciona para login se não estiver autenticado
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // bloqueia acesso caso a role não esteja permitida
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/categorizar" replace />;
    }

    // se passou por todas as checagens, renderiza a rota protegida
    return <Outlet />;
};

export default ProtectedRoute;
