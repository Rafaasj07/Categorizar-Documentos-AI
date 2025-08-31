/**
 * Protege rotas com base no estado de autenticação e no papel (role) do usuário,
 * utilizando o contexto de autenticação.
 */
// Importa componentes do 'react-router-dom' para navegação e renderização de rotas.
import { Outlet, Navigate } from 'react-router-dom';
// Importa o hook 'useAuth' para acessar o estado de autenticação.
import { useAuth } from '../context/AuthContext';
// Importa as constantes de configuração da aplicação (rotas e papéis de usuário).
import { APP_CONFIG, USER_ROLES } from '../constants/appConstants';

// Define o componente 'ProtectedRoute', que decide se um usuário pode acessar uma rota.
// Recebe 'allowedRoles', um array com os papéis de usuário que têm permissão para acessar a rota.
const ProtectedRoute = ({ allowedRoles }) => {
    // Obtém o estado de autenticação, o papel do usuário e o status de carregamento do contexto.
    const { isAuthenticated, userRole, loading } = useAuth();

    // Se a autenticação ainda está sendo verificada, exibe uma mensagem de carregamento.
    if (loading) {
        return <div>Verificando autenticação...</div>;
    }

    // Se o usuário NÃO está autenticado, redireciona para a página de login.
    if (!isAuthenticated) {
        return <Navigate to={APP_CONFIG.LOGIN_PATH} replace />;
    }

    // Se a rota exige um papel específico e o usuário não o possui.
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        // Redireciona o usuário para sua página inicial padrão (admin ou comum).
        const homeRoute = userRole === USER_ROLES.ADMIN ? APP_CONFIG.DEFAULT_ADMIN_PATH : APP_CONFIG.DEFAULT_USER_PATH;
        return <Navigate to={homeRoute} replace />;
    }

    // Se o usuário está autenticado e tem a permissão necessária, renderiza o conteúdo da rota.
    // O '<Outlet />' representa o componente da rota aninhada que está sendo protegida.
    return <Outlet />;
};

// Exporta o componente para ser usado na configuração das rotas da aplicação.
export default ProtectedRoute;