import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Categorizar from './pages/Categorizar';
import Buscar from './pages/Buscar';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

// Componente que gerencia a exibição do conteúdo ou do spinner inicial
function AppContent() {
  const { loading, isAuthenticated, userRole } = useAuth();

  // Mostra um spinner em tela cheia durante o carregamento inicial
  if (loading) {
    return <LoadingSpinner />;
  }

  // Define a rota de redirecionamento padrão após o login
  const RootRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    return userRole === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/categorizar" />;
  };

  return (
    <Routes>
      {/* Rotas Públicas */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/login" />} />
      
      {/* Rotas Protegidas para USER e ADMIN */}
      <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
        <Route path="/categorizar" element={<Categorizar />} />
        <Route path="/buscar" element={<Buscar />} />
      </Route>
      
      {/* Rota Protegida apenas para ADMIN */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<Admin />} />
      </Route>
      
      {/* Rota Raiz e Fallback */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

// Componente principal que envolve a aplicação com os provedores
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;