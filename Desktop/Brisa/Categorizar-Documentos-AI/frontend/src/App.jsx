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

// Componente que gerencia a lógica de rotas e o estado de carregamento.
function AppContent() {
  // Obtém o status de autenticação e o papel do usuário do contexto.
  const { loading, isAuthenticated, userRole } = useAuth();
  // Controla a exibição do spinner apenas no carregamento inicial.
  const isInitialLoad = useRef(true);

  // Marca que o carregamento inicial foi concluído.
  if (!loading) {
    isInitialLoad.current = false;
  }
  
  // Exibe o spinner se for o primeiro carregamento da aplicação.
  if (isInitialLoad.current && loading) {
    return <LoadingSpinner />;
  }

  // Componente para redirecionar o usuário com base no seu status de login e papel.
  const RootRedirect = () => {
    // Se não estiver logado, vai para a página de login.
    if (!isAuthenticated) return <Navigate to="/login" />;
    // Se for admin, vai para o painel de admin, senão, para a página de categorização.
    return userRole === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/categorizar" />;
  };

  // Define todas as rotas da aplicação.
  return (
    <Routes>
      {/* Rotas públicas para login e registro, com redirecionamento se já estiver logado. */}
      <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/login" />} />
      
      {/* Agrupa rotas protegidas para usuários comuns e administradores. */}
      <Route element={<ProtectedRoute allowedRoles={['user', 'admin']} />}>
        <Route path="/categorizar" element={<Categorizar />} />
        <Route path="/buscar" element={<Buscar />} />
      </Route>
      
      {/* Agrupa rotas protegidas exclusivas para administradores. */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<Admin />} />
      </Route>
      
      {/* Rotas raiz e curinga que aplicam o redirecionamento principal. */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<RootRedirect />} />
    </Routes>
  );
}

// Componente principal que envolve a aplicação com o roteador e o provedor de autenticação.
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