import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Categorizar from './pages/Categorizar';
import Buscar from './pages/Buscar';
import Admin from './pages/Admin';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  // Função auxiliar para determinar a rota inicial correta
  const getHomeRoute = () => {
    const token = localStorage.getItem('authToken');
    if (!token) return "/login";
    
    const role = localStorage.getItem('userRole');
    if (role === 'admin') return "/admin";
    
    return "/categorizar";
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública de Login */}
        <Route path="/login" element={<Login />} />
        
        {/* Rotas exclusivas para o usuário comum */}
        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
          <Route path="/categorizar" element={<Categorizar />} />
          <Route path="/buscar" element={<Buscar />} />
        </Route>
        
        {/* Rota exclusiva para o Admin */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin" element={<Admin />} />
        </Route>

        {/* Redireciona a rota raiz e qualquer outra rota inválida para a página inicial correta */}
        <Route path="*" element={<Navigate to={getHomeRoute()} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;