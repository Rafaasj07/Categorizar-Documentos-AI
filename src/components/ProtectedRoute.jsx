//  Usará o AuthContext para proteger as rotas com base no estado de autenticação e no papel do usuário.

import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, userRole, loading } = useAuth(); // Obtém o estado do AuthContext

  // Enquanto a verificação inicial de autenticação estiver em andamento
  if (loading) {
    return <div>Verificando autenticação...</div>; // Pode mudar para componente de spinner mais elaborado
  }

  // Se não estiver autenticado, redireciona para a página de login
  if (!isAuthenticated) {
    console.warn("Acesso negado: Usuário não autenticado. Redirecionando para /login.");
    return <Navigate to="/login" replace />;
  }

  // Se estiver autenticado, mas o papel não é permitido para esta rota
  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    console.warn(`Acesso negado: Usuário com papel '${userRole}' tentou acessar uma rota restrita. Papéis permitidos: ${allowedRoles.join(', ')}`);
    // Redireciona para uma rota padrão baseada no papel atual ou para uma página de erro, caso tente outra rota não permitida
    if (userRole === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/categorizar" replace />;
  }
  // Se o usuário está autenticado e autorizado, renderiza as rotas filhas
   return <Outlet />;
};

export default ProtectedRoute;