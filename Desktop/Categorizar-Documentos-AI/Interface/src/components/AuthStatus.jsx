/**
 * components/AuthStatus.jsx
 * * Função Principal:
 * Exibe o status de autenticação do usuário no canto superior direito da tela.
 * Permite que o usuário faça login ou logout.
 * * Estilização:
 * Utiliza Tailwind CSS para um design limpo e responsivo.
 */

import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

function AuthStatus() {
  const { user, userRole, loading, signOut } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="absolute top-2.5 right-2.5 text-sm">
        Verificando status de autenticação...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="absolute top-2.5 right-2.5 text-sm">
        <p>
          Não logado.
          <button
            onClick={() => navigate('/login')}
            className="ml-2 bg-transparent text-blue-500 border-none cursor-pointer underline p-0"
          >
            Login
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="absolute top-2.5 right-2.5 text-sm text-right">
      <p className="mb-2">
        Olá, {user.attributes?.email || user.username}
        <span className="font-semibold"> ({userRole})</span>!
      </p>
      <button
        onClick={async () => {
          await signOut();
          navigate('/login'); // Redireciona para a página de login após o logout
        }}
        className="py-2 px-4 text-xs cursor-pointer bg-red-600 text-white border-none rounded-md hover:bg-red-700 transition-colors"
      >
        Sair
      </button>
    </div>
  );
}

export default AuthStatus;
