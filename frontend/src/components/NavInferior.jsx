import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente de navegação inferior (mobile).
 * Exibe botões de navegação e logout, adaptando-se ao 'userRole'.
 */
const NavInferior = ({ carregando: carregandoDocs }) => {
  const navegar = useNavigate();
  const location = useLocation(); 
  const { userRole, logout, loading: loadingAuth } = useAuth();

  // Combina o estado de loading da autenticação com o do processamento de documentos.
  const isLoading = loadingAuth || carregandoDocs;

  const handleLogoutClick = () => {
    if (isLoading) return;
    logout();
  };

  /**
   * Retorna classes CSS dinâmicas para o botão, destacando a rota ativa.
   * @param {string} path - A rota associada ao botão.
   * @returns {string} As classes CSS para o botão.
   */
  const getButtonClasses = (path) => {
    // Verifica se o pathname atual é igual ao do botão.
    const isActive = location.pathname === path; 
    let classes = "flex flex-col items-center gap-1 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2 rounded-lg "; 
    // Aplica classes de 'ativo' (fundo indigo) se a rota corresponder.
    if (isActive) {
      classes += " bg-indigo-600 text-white "; 
    } else {
      classes += " text-indigo-400 hover:text-white hover:bg-indigo-700/50 "; 
    }
    return classes;
  };

  // Ajusta o alinhamento dos itens (centralizado para admin, espaçado para user).
  const justificationClass = userRole === 'admin' ? 'justify-center' : 'justify-around';

  return (
    // A tag <nav> define a barra fixa inferior, visível apenas em telas 'md' (médias) para baixo.
    <nav className={`md:hidden fixed bottom-0 left-0 w-full h-20 bg-gray-900 border-t border-indigo-600 shadow-md flex items-center z-50 px-4 ${justificationClass}`}>
      {/* Renderização condicional baseada na role do usuário */}
      {userRole === 'user' ? (
        <>
          {/* Botão para a rota '/categorizar', com estilo dinâmico */}
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

          {/* Botão de Logout */}
          <button
            onClick={handleLogoutClick}
            disabled={isLoading}
            className="flex flex-col items-center gap-1 text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed px-3 py-2" 
            aria-label="Sair"
          >
            {/* Mostra um ícone de spinner enquanto o logout está em progresso */}
            {loadingAuth ? <i className='bx bx-loader-alt animate-spin text-2xl'></i> : <i className="bx bx-log-out text-2xl"></i>}
            <span className="text-xs font-semibold">Sair</span>
          </button>
        </>
      ) : (
        // Se for admin, mostra apenas o botão de Sair centralizado.
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