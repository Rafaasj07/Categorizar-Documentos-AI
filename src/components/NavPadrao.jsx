import icone from '../assets/icone.png';
import { useNavigate, Link } from 'react-router-dom';

function NavPadrao({ carregando }) {
  const navegar = useNavigate(); // Hook para navegação
  const userRole = localStorage.getItem('userRole'); // Pega o papel do usuário

  // Função de logout
  const handleLogout = () => {
    if (carregando) return; // Não permite logout se estiver carregando
    localStorage.removeItem('authToken'); // Remove token
    localStorage.removeItem('userRole'); // Remove role
    navegar('/login'); // Redireciona para login
  };

  // Classes de estilo para links de navegação
  const linkClasses = `flex items-center gap-2 border border-indigo-600 text-indigo-400
    font-semibold py-2 px-6 rounded-full transition duration-300 ease-in-out bg-transparent
    ${carregando ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600 hover:text-white cursor-pointer'}`;

  // Classes de estilo para botão de sair
  const sairClasses = `flex items-center gap-2 bg-red-600 text-white font-semibold
    py-2 px-6 rounded-full transition duration-300 ease-in-out
    ${carregando ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700 cursor-pointer'}`;

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <nav className="flex items-center justify-between bg-gray-900 border-y border-indigo-600 shadow-md h-24 px-8">
        {/* Logo e título do sistema */}
        <div className="flex items-center gap-4"> 
          <img src={icone} alt="Logo do sistema" className="h-12 sm:h-14 md:h-16 mt-1 -ml-3 sm:ml-0" />
          <h1 className="text-white text-xl md:text-3xl font-semibold select-none">
            Categorizador de Arquivos
          </h1>
        </div>
        
        {/* Botões de navegação e logout */}
        <div className="hidden md:flex items-center gap-4">
          {userRole !== 'admin' && (
            <>
              {/* Link para categorização */}
              <Link
                to="/categorizar"
                className={linkClasses}
                onClick={e => carregando && e.preventDefault()} // Bloqueia clique se carregando
              >
                <i className="bx bx-folder-open"></i> Categorizar
              </Link>

              {/* Link para busca */}
              <Link
                to="/buscar"
                className={linkClasses}
                onClick={e => carregando && e.preventDefault()} // Bloqueia clique se carregando
              >
                <i className="bx bx-search"></i> Buscar
              </Link>
            </>
          )}

          {/* Botão de logout */}
          <button
            onClick={handleLogout}
            className={sairClasses}
            disabled={carregando} // Desativa botão se carregando
          >
            <i className='bx bx-log-out'></i> Sair
          </button>
        </div>
      </nav>
    </div>
  );
}

export default NavPadrao;
