import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useRef } from 'react';
import Categorizar from './pages/Categorizar';
import Buscar from './pages/Buscar';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Register from './pages/Register';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoadingSpinner from './components/LoadingSpinner';

// Gerencia rotas e exibe spinner no carregamento inicial da autenticação
function AppContent() {
  const { loading, isAuthenticated, userRole } = useAuth();
  const isInitialLoad = useRef(true);

  if (!loading) {
    isInitialLoad.current = false;
  }
  
  // Controla exibição do spinner apenas na primeira carga
  if (isInitialLoad.current && loading) {
    return <LoadingSpinner />;
  }

  // Redireciona baseando-se na autenticação e nível de acesso (admin/user)
  const RootRedirect = () => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    return userRole === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/categorizar" />;
  };

  return (
    <Routes>
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/login" />} />
      
      <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
        <Route path="/categorizar" element={<Categorizar />} />
        <Route path="/buscar" element={<Buscar />} />
      </Route>
      
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<Admin />} />
      </Route>
      
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

// Configura provedores globais (Router e Auth) e renderiza conteúdo
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