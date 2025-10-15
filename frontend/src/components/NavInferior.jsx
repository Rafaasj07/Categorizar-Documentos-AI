import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NavInferior = ({ carregando: carregandoDocs }) => {
  const navegar = useNavigate();
  const { userRole, logout, loading: loadingAuth } = useAuth();

  // Combina o estado de loading da autenticação com o da categorização de documentos
  const isLoading = loadingAuth || carregandoDocs;

  // dispara o logout apenas se não estiver em carregamento
  const handleLogoutClick = () => {
    if (isLoading) return;
    logout();
  };

  // classes padrão dos botões e ajuste de alinhamento conforme o tipo de usuário
  const buttonClasses = "flex flex-col items-center gap-1 text-indigo-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed";
  const justificationClass = userRole === 'admin' ? 'justify-center' : 'justify-around';

  return (
    // barra de navegação fixa na parte inferior da tela (mobile)
    <nav className={`md:hidden fixed bottom-0 left-0 w-full h-20 bg-gray-900 border-y border-indigo-600 shadow-md flex items-center z-50 px-4 ${justificationClass}`}>
      {userRole === 'user' ? (
        <>
          {/* botão para tela de categorização */}
          <button
            onClick={() => navegar('/categorizar')}
            disabled={isLoading}
            className={buttonClasses}
            aria-label="Categorizar"
          >
            <i className="bx bx-folder-open text-2xl"></i>
            <span className="text-xs font-semibold">Categorizar</span>
          </button>

          {/* botão para tela de busca */}
          <button
            onClick={() => navegar('/buscar')}
            disabled={isLoading}
            className={`${buttonClasses} pr-3`}
            aria-label="Buscar"
          >
            <i className="bx bx-search text-2xl"></i>
            <span className="text-xs font-semibold">Buscar</span>
          </button>
          
          {/* botão de logout com ícone dinâmico (spinner ou sair) */}
          <button
            onClick={handleLogoutClick}
            disabled={isLoading}
            className={buttonClasses}
            aria-label="Sair"
          >
            {loadingAuth ? <i className='bx bx-loader-alt animate-spin text-2xl'></i> : <i className="bx bx-log-out text-2xl"></i>}
            <span className="text-xs font-semibold">Sair</span>
          </button>
        </>
      ) : (
        // se for admin, mostra apenas o botão de sair
        <button
          onClick={handleLogoutClick}
          disabled={isLoading}
          className={buttonClasses}
          aria-label="Sair"
        >
          {loadingAuth ? <i className='bx bx-loader-alt animate-spin text-2xl'></i> : <i className="bx bx-log-out text-2xl"></i>}
          <span className="text-xs font-semibold">Sair</span>
        </button>
      )}
    </nav>
  );
};

export default NavInferior;