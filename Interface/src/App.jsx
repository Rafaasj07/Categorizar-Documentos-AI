import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Categorizar from './pages/Categorizar';
import Buscar from './pages/Buscar';
import Admin from './pages/Admin';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { USER_ROLES, APP_CONFIG } from './constants/appConstants';

// Envolve toda a aplicação com o BrowserRouter e o nosso AuthProvider
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes /> {/* Componente que contém a lógica de rotas */}
      </AuthProvider>
    </BrowserRouter>
  );
}

// Componente separado para gerenciar as rotas com base no estado de autenticação
function AppRoutes() {
  const { isAuthenticated, userRole, loading } = useAuth();

  // Exibe uma mensagem de carregamento enquanto a sessão é verificada
  if (loading) {
    return <div>Carregando...</div>;
  }

  // Função para determinar a rota de redirecionamento correta
  const getRedirectPath = () => {
    if (isAuthenticated) {
      return userRole === USER_ROLES.ADMIN
        ? APP_CONFIG.DEFAULT_ADMIN_PATH
        : APP_CONFIG.DEFAULT_USER_PATH;
    }
    return APP_CONFIG.LOGIN_PATH;
  };

  return (
    <Routes>
      {/* Rota pública para a página de login */}
      <Route path={APP_CONFIG.LOGIN_PATH} element={<Login />} />

      {/* Rotas protegidas que só podem ser acessadas por administradores */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
        <Route path={APP_CONFIG.DEFAULT_ADMIN_PATH} element={<Admin />} />
      </Route>

      {/* Rotas protegidas que só podem ser acessadas por usuários comuns */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.USER]} />}>
        <Route path={APP_CONFIG.DEFAULT_USER_PATH} element={<Categorizar />} />
        <Route path="/buscar" element={<Buscar />} />
      </Route>

      {/* Redireciona qualquer rota não encontrada para a página apropriada */}
      <Route path="*" element={<Navigate to={getRedirectPath()} replace />} />
    </Routes>
  );
}

export default App;