import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Categorizar from './pages/Categorizar';
import Buscar from './pages/Buscar';
import Admin from './pages/Admin';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './context/AuthContext'; // Importe do AuthProvider e o useAuth
// Importa as constantes de configuração para os papéis de usuário e caminhos da aplicação.
import { USER_ROLES, APP_CONFIG } from './constants/appConstants';

// O componente principal App apenas envolve o AppRoutes com AuthProvider
// para que as informações de autenticação estejam disponíveis em toda a árvore de componentes.
function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes /> {/* Componente separado para usar o hook useAuth, descende do AuthProvider */}
      </AuthProvider>
    </BrowserRouter>
  );
}

// Lida com as rotas e usa o contexto de autenticação
function AppRoutes() {
  const { isAuthenticated, userRole, loading } = useAuth(); // Obtém o estado de autenticação do contexto
  // Exibe uma mensagem de carregamento enquanto o estado de autenticação é verificado
  if (loading) {
    return <div>Carregando aplicação...</div>;
  }

    // Função auxiliar para rotas de redirect
    const getRedirectPath = () => {
      // Se o usuário está autenticado, determina a rota com base no papel.
      if (isAuthenticated) {
        if (userRole === USER_ROLES.ADMIN) {
          return APP_CONFIG.DEFAULT_ADMIN_PATH;
        }
        // Se não for admin, assume que é um usuário comum e redireciona para o caminho padrão de usuário.
        // Ou pode ser um caminho padrão para qualquer usuário logado se não houver distinção de papel.
        return APP_CONFIG.DEFAULT_USER_PATH;
      }
      // Se o usuário NÃO está autenticado, redireciona para a página de login.
      return APP_CONFIG.LOGIN_PATH;
    };

  return (
    <Routes>
      {/* Rota pública de Login.*/}
      <Route path={APP_CONFIG.LOGIN_PATH} element={<Login />} />

      {/* Rotas protegidas */}
      {/* Rotas para usuários comuns (Categorizar, Buscar) - Admin também pode acessar */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.USER, USER_ROLES.ADMIN]} />}>
        <Route path={APP_CONFIG.DEFAULT_USER_PATH} element={<Categorizar />} />
        <Route path="/buscar" element={<Buscar />} />
      </Route>

      {/* Rota exclusiva para o Admin */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
        {/* Caminho padrão para a área administrativa. */}
        <Route path={APP_CONFIG.DEFAULT_ADMIN_PATH} element={<Admin />} />
      </Route>

      {/* Redireciona a rota raiz e qualquer outra rota inválida para a página inicial correta */}
      {/* A rota "*" pega qualquer coisa que não foi definida acima */}
      <Route
        path="/"
        element={<Navigate to={getRedirectPath()} replace />}
      />
      <Route
        path="*" // Captura qualquer rota não definida e redireciona para página válida
        element={<Navigate to={getRedirectPath()} replace />}
      />
    </Routes>
  );
}

export default App;