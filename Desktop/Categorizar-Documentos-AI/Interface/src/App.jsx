import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Categorizar from './pages/Categorizar';
import Buscar from './pages/Buscar';
import Admin from './pages/Admin';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { USER_ROLES, APP_CONFIG } from './constants/appConstants';

// Componente principal que envolve a aplicação com o BrowserRouter e nosso AuthProvider
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes /> {/* Onde as rotas são definidas */}
      </AuthProvider>
    </BrowserRouter>
  );
}

// Componente que gerencia a lógica de roteamento
function AppRoutes() {
  const { isAuthenticated, userRole, loading } = useAuth();

  // Exibe uma mensagem de carregamento centralizada
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Carregando aplicação...</p>
      </div>
    );
  }

  // Função que decide para onde redirecionar o usuário
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
      {/* Rota pública */}
      <Route path={APP_CONFIG.LOGIN_PATH} element={<Login />} />

      {/* Rota protegida exclusiva para admins */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
        <Route path={APP_CONFIG.DEFAULT_ADMIN_PATH} element={<Admin />} />
      </Route>

      {/* Rotas protegidas para usuários comuns */}
      {/* CORREÇÃO: Remova o 'USER_ROLES.ADMIN' daqui. Apenas 'user' deve ter acesso */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.USER]} />}>
        <Route path={APP_CONFIG.DEFAULT_USER_PATH} element={<Categorizar />} />
        <Route path="/buscar" element={<Buscar />} />
      </Route>

      {/* Redirecionamento para rotas não encontradas */}
      <Route path="*" element={<Navigate to={getRedirectPath()} replace />} />
    </Routes>
  );
}

export default App;