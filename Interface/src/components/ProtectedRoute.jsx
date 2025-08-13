import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles }) => {
  const token = localStorage.getItem('authToken'); // Pega token de autenticação
  const userRole = localStorage.getItem('userRole'); // Pega papel do usuário

  // Se não estiver logado, redireciona para a tela de login
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  // Se a rota exige um papel específico e o usuário não tem, redireciona
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Define rota inicial de acordo com o papel do usuário
    const homeRoute = userRole === 'admin' ? '/admin' : '/categorizar';
    return <Navigate to={homeRoute} replace />;
  }

  // Se estiver logado e tiver permissão, exibe o conteúdo da rota
  return <Outlet />;
};

export default ProtectedRoute;
