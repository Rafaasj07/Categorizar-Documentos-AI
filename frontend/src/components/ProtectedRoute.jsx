import { Navigate, Outlet } from 'react-router-dom';
import { useRef } from 'react'; 
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ allowedRoles }) => {
    // Obtém estado de autenticação e referência para controle de load inicial
    const { isAuthenticated, userRole, loading } = useAuth();
    const isInitialLoad = useRef(true); 

    if (!loading) {
        isInitialLoad.current = false;
    }

    // Exibe spinner apenas durante a verificação inicial de autenticação
    if (isInitialLoad.current && loading) {
        return <LoadingSpinner />;
    }

    // Redireciona para login se não autenticado
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Valida permissões de acesso baseadas na role do usuário
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/categorizar" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;