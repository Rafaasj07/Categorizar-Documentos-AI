// Importa os componentes necessários para criar e gerenciar as rotas da aplicação.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
// Importa os componentes de página da aplicação.
import Categorizar from './pages/Categorizar';
import Buscar from './pages/Buscar';
import Admin from './pages/Admin';
import Login from './pages/Login';
// Importa o componente que protege rotas, permitindo acesso apenas a usuários autorizados.
import ProtectedRoute from './components/ProtectedRoute';
// Importa o provedor e o hook do contexto de autenticação.
import { AuthProvider, useAuth } from './context/AuthContext';
// Importa as constantes de configuração, como papéis de usuário e caminhos de rotas.
import { USER_ROLES, APP_CONFIG } from './constants/appConstants';

// Componente principal da aplicação.
function App() {
  return (
    // 'BrowserRouter' habilita o roteamento na aplicação.
    <BrowserRouter>
      {/* 'AuthProvider' disponibiliza os dados de autenticação para todos os componentes filhos. */}
      <AuthProvider>
        {/* 'AppRoutes' é o componente que define todas as rotas da aplicação. */}
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

// Componente que gerencia a lógica de qual rota exibir com base na autenticação.
function AppRoutes() {
  // Obtém os dados de autenticação do usuário usando o hook 'useAuth'.
  const { isAuthenticated, userRole, loading } = useAuth();

  // Se a autenticação ainda estiver sendo verificada, exibe uma mensagem de "Carregando...".
  if (loading) {
    return <div>Carregando...</div>;
  }

  // Função para decidir para qual página o usuário deve ser redirecionado.
  const getRedirectPath = () => {
    // Se o usuário estiver autenticado...
    if (isAuthenticated) {
      // ...redireciona para a página de admin ou de usuário comum, dependendo do seu papel.
      return userRole === USER_ROLES.ADMIN
        ? APP_CONFIG.DEFAULT_ADMIN_PATH
        : APP_CONFIG.DEFAULT_USER_PATH;
    }
    // Se não estiver autenticado, redireciona para a página de login.
    return APP_CONFIG.LOGIN_PATH;
  };

  // Retorna a definição de todas as rotas da aplicação.
  return (
    <Routes>
      {/* Define a rota pública para a página de login. */}
      <Route path={APP_CONFIG.LOGIN_PATH} element={<Login />} />

      {/* Define um grupo de rotas protegidas que só podem ser acessadas por administradores. */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.ADMIN]} />}>
        {/* Rota para a página de administração. */}
        <Route path={APP_CONFIG.DEFAULT_ADMIN_PATH} element={<Admin />} />
      </Route>

      {/* Define um grupo de rotas protegidas que só podem ser acessadas por usuários comuns. */}
      <Route element={<ProtectedRoute allowedRoles={[USER_ROLES.USER]} />}>
        {/* Rota para a página de categorização de documentos. */}
        <Route path={APP_CONFIG.DEFAULT_USER_PATH} element={<Categorizar />} />
        {/* Rota para a página de busca de documentos. */}
        <Route path="/buscar" element={<Buscar />} />
      </Route>

      {/* Rota de "fallback": se o usuário acessar uma URL que não existe, ele é redirecionado. */}
      <Route path="*" element={<Navigate to={getRedirectPath()} replace />} />
    </Routes>
  );
}

// Exporta o componente principal 'App'.
export default App;