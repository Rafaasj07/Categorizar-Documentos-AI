import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Categorizar from './pages/Categorizar';
import Buscar from './pages/Buscar';
import Admin from './pages/Admin';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import { USER_ROLES, APP_CONFIG } from './constants/appConstants';

// Envolve a aplicação com o BrowserRouter e o AuthProvider
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

// Gerencia a lógica de roteamento com base na autenticação
function AppRoutes() {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return <div>Carregando...</div>;
  }

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
      <Route path={APP_CONFIG.LOGIN_PATH} element={<Login />} />

      {/* Rota protegida para admins */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
        <Route path={APP_CONFIG.DEFAULT_ADMIN_PATH} element={<Admin />} />
      </Route>

      {/* Rotas protegidas para usuários comuns */}
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