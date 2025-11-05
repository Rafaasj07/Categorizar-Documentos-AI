import icone from '../assets/icone.png';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente da barra de navegação superior (desktop).
 * Exibe links de navegação e botão de logout, adaptando-se ao 'userRole'.
 */
function NavPadrao({ carregando: carregandoDocs }) {
  const location = useLocation();
  const { userRole, logout, loading: loadingAuth } = useAuth();

  // Combina o estado de loading da autenticação com o do processamento de docs.
  const isLoading = loadingAuth || carregandoDocs;

  /**
   * Gera classes CSS dinâmicas para o link, destacando a rota ativa
   * e aplicando o estado 'disabled' se estiver carregando.
   */
  const getLinkClasses = (path) => {
    const isActive = location.pathname === path;
    let classes = `flex items-center gap-2 border font-semibold py-2 px-6 rounded-full transition duration-300 ease-in-out `;
    // Aplica classes de 'ativo' (fundo indigo) se a rota corresponder.
    if (isActive) {
      classes += " bg-indigo-600 text-white border-indigo-600 ";
    } else {
      classes += " border-indigo-600 text-indigo-400 bg-transparent hover:bg-indigo-600 hover:text-white ";
    }
    // Aplica classes de 'desabilitado' se qualquer carregamento estiver ativo.
    if (isLoading) {
      classes += " opacity-50 cursor-not-allowed ";
    } else {
      classes += " cursor-pointer ";
    }
    return classes;
  };

  const sairClasses = `flex items-center justify-center gap-2 bg-red-600 text-white font-semibold
    py-2 px-6 rounded-full transition duration-300 ease-in-out
    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700 cursor-pointer'}`;

  return (
    // Barra de navegação fixa no topo, visível em telas 'md' (desktop) ou maiores.
    <div className="fixed top-0 left-0 w-full z-50">
      <nav className="flex items-center justify-between bg-gray-900 border-b border-indigo-600 shadow-md h-24 px-8">

        {/* Logo e Título */}
        <div className="flex items-center gap-4">
          <img src={icone} alt="Logo do sistema" className="h-12 sm:h-14 md:h-16 mt-1 -ml-3 sm:ml-0" />
          <h1 className="text-white text-xl md:text-3xl font-semibold select-none">
            Categorizador de Arquivos
          </h1>
        </div>

        {/* Links de navegação e botão Sair (visíveis apenas em desktop) */}
        <div className="hidden md:flex items-center gap-4">
          {/* Renderiza os links de navegação "Categorizar" e "Buscar" apenas para 'user'. */}
          {userRole === 'user' && (
            <>
              <Link
                to="/categorizar"
                className={getLinkClasses('/categorizar')}
                // Previne a navegação no link se a aplicação estiver carregando.
                onClick={e => isLoading && e.preventDefault()}
              >
                <i className="bx bx-folder-open"></i> Categorizar
              </Link>

              <Link
                to="/buscar"
                className={getLinkClasses('/buscar')}
                // Previne a navegação no link se a aplicação estiver carregando.
                onClick={e => isLoading && e.preventDefault()}
              >
                <i className="bx bx-search"></i> Buscar
              </Link>
            </>
          )}

          {/* Botão de Logout */}
          <button onClick={logout} className={sairClasses} disabled={isLoading}>
            {/* Mostra um spinner (ícone de load) enquanto o logout está em progresso. */}
            {loadingAuth ? <i className='bx bx-loader-alt animate-spin'></i> : <i className='bx bx-log-out'></i>}
            Sair
          </button>
        </div>
      </nav>
    </div>
  );
}

export default NavPadrao;