import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Componente de navegação inferior para dispositivos móveis
const NavInferior = ({ carregando: carregandoDocs }) => {
  const navegar = useNavigate();
  const location = useLocation(); 
  const { userRole, logout, loading: loadingAuth } = useAuth();

  // Unifica status de carregamento da autenticação e documentos
  const isLoading = loadingAuth || carregandoDocs;

  // Executa logout prevenindo ação se houver carregamento
  const handleLogoutClick = () => {
    if (isLoading) return;
    logout();
  };

  // Gera classes CSS dinâmicas para destacar a rota ativa
  const getButtonClasses = (path) => {
    const isActive = location.pathname === path; 
    let classes = "flex flex-col items-center gap-1 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg "; 
    if (isActive) {
      classes += " bg-indigo-600 text-white "; 
    } else {
      classes += " text-indigo-400 hover:text-white hover:bg-indigo-700/50 "; 
    }
    return classes;
  };

  // Define alinhamento condicional baseado no perfil do usuário
  const justificationClass = userRole === 'admin' ? 'justify-center' : 'justify-around';

  return (
    <nav className={`md:hidden fixed bottom-0 left-0 w-full h-20 bg-gray-900 border-t border-indigo-600 shadow-md flex items-center z-50 px-4 ${justificationClass}`}>
      {/* Renderiza botões específicos conforme o papel do usuário */}
      {userRole === 'user' ? (
        <>
          <button
            onClick={() => navegar('/categorizar')}
            disabled={isLoading}
            className={getButtonClasses('/categorizar')} 
            aria-label="Categorizar"
          >
            <i className="bx bx-folder-open text-2xl"></i>
            <span className="text-xs font-semibold">Categorizar</span>
          </button>

          <button
            onClick={() => navegar('/buscar')}
            disabled={isLoading}
            className={getButtonClasses('/buscar')} 
            aria-label="Buscar"
          >
            <i className="bx bx-search text-2xl"></i>
            <span className="text-xs font-semibold">Buscar</span>
          </button>

          <button
            onClick={handleLogoutClick}
            disabled={isLoading}
            className="flex flex-col items-center gap-1 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2" 
            aria-label="Sair"
          >
            {loadingAuth ? <i className='bx bx-loader-alt animate-spin text-2xl'></i> : <i className="bx bx-log-out text-2xl"></i>}
            <span className="text-xs font-semibold">Sair</span>
          </button>
        </>
      ) : (
        <button
          onClick={handleLogoutClick}
          disabled={isLoading}
          className="flex flex-col items-center gap-1 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2" 
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