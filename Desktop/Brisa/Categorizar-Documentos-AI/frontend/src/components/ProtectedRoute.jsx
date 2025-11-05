import { Navigate, Outlet } from 'react-router-dom';
import { useRef } from 'react'; 
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from './LoadingSpinner';

const ProtectedRoute = ({ allowedRoles }) => {
    // Obtém o status de autenticação e os dados do usuário.
    const { isAuthenticated, userRole, loading } = useAuth();
    // Controla a exibição do spinner apenas no carregamento inicial da página.
    const isInitialLoad = useRef(true); 

    // Marca que o carregamento inicial foi concluído.
    if (!loading) {
        isInitialLoad.current = false;
    }

    // Exibe o spinner se for o primeiro carregamento da aplicação.
    if (isInitialLoad.current && loading) {
        return <LoadingSpinner />;
    }

    // Se o usuário não estiver autenticado, redireciona para a página de login.
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Se o usuário não tiver a permissão necessária, redireciona para uma página padrão.
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/categorizar" replace />;
    }

    // Se todas as verificações passarem, renderiza o conteúdo da rota protegida.
    return <Outlet />;
};

export default ProtectedRoute;