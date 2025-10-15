import icone from '../assets/icone.png';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function NavPadrao({ carregando: carregandoDocs }) {
  const { userRole, logout, loading: loadingAuth } = useAuth();

  // Combina os dois estados de carregamento
  const isLoading = loadingAuth || carregandoDocs;

  // estilos padrão para links e botão de sair (ajustados pelo estado "isLoading")
  const linkClasses = `flex items-center gap-2 border border-indigo-600 text-indigo-400
    font-semibold py-2 px-6 rounded-full transition duration-300 ease-in-out bg-transparent
    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600 hover:text-white cursor-pointer'}`;
  
  const sairClasses = `flex items-center justify-center gap-2 bg-red-600 text-white font-semibold
    py-2 px-6 rounded-full transition duration-300 ease-in-out
    ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700 cursor-pointer'}`;

  return (
    // barra de navegação fixa no topo (versão desktop)
    <div className="fixed top-0 left-0 w-full z-50">
      <nav className="flex items-center justify-between bg-gray-900 border-b border-indigo-600 shadow-md h-24 px-8">
        
        {/* logo + título */}
        <div className="flex items-center gap-4"> 
          <img src={icone} alt="Logo do sistema" className="h-12 sm:h-14 md:h-16 mt-1 -ml-3 sm:ml-0" />
          <h1 className="text-white text-xl md:text-3xl font-semibold select-none">
            Categorizador de Arquivos
          </h1>
        </div>
        
        {/* links visíveis apenas em telas médias+ */}
        <div className="hidden md:flex items-center gap-4">
          {userRole === 'user' && (
            <>
              {/* link para categorização */}
              <Link 
                to="/categorizar" 
                className={linkClasses} 
                onClick={e => isLoading && e.preventDefault()}
              >
                <i className="bx bx-folder-open"></i> Categorizar
              </Link>

              {/* link para busca */}
              <Link 
                to="/buscar" 
                className={linkClasses} 
                onClick={e => isLoading && e.preventDefault()}
              >
                <i className="bx bx-search"></i> Buscar
              </Link>
            </>
          )}
          
          {/* botão de logout com ícone dinâmico (spinner ou sair) */}
          <button onClick={logout} className={sairClasses} disabled={isLoading}>
            {loadingAuth ? <i className='bx bx-loader-alt animate-spin'></i> : <i className='bx bx-log-out'></i>}
            Sair
          </button>
        </div>
      </nav>
    </div>
  );
}

export default NavPadrao;