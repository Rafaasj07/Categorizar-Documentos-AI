// Importa ícone e hooks necessários para navegação e estado.
import icone from '../assets/icone.png';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * components/NavPadrao.jsx
 * * Função Principal:
 * Componente de navegação superior padrão.
 * Exibe logo, título e links para as páginas do sistema.
 * O botão "Sair" realiza o logout do usuário.
 * Os links de navegação e o botão de sair são desativados
 * quando a propriedade `carregando` é verdadeira.
 */
function NavPadrao({ carregando }) {
  const navegar = useNavigate(); // Hook para navegação programática
  // Obtém as funções e estados de autenticação do contexto
  const { signOut, userRole } = useAuth();

  // Lida com a ação de logout
  const handleLogout = async () => {
    // Impede o logout se uma operação estiver em andamento
    if (carregando) return;
    try {
      // Chama a função de logout do contexto de autenticação
      await signOut();
      // Redireciona o usuário para a página de login após o logout
      navegar('/login');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Classes de estilo para os links de navegação
  const linkClasses = `
    flex items-center gap-2 border border-indigo-600 text-indigo-400
    font-semibold py-2 px-6 rounded-full transition duration-300 ease-in-out bg-transparent
    ${carregando
      ? 'opacity-50 cursor-not-allowed'
      : 'hover:bg-indigo-600 hover:text-white cursor-pointer'
    }
  `;

  // Classes de estilo para o botão de sair
  const sairClasses = `
    flex items-center gap-2 bg-red-600 text-white font-semibold
    py-2 px-6 rounded-full transition duration-300 ease-in-out
    ${carregando
      ? 'opacity-50 cursor-not-allowed'
      : 'hover:bg-red-700 cursor-pointer'
    }
  `;

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <nav className="flex items-center justify-between bg-gray-900 border-y border-indigo-600 shadow-md h-24 px-8">
        {/* Logo e título do sistema */}
        <div className="flex items-center gap-4">
          <img
            src={icone}
            alt="Logo do sistema"
            className="h-12 sm:h-14 md:h-16 mt-1 -ml-3 sm:ml-0"
          />
          <h1 className="text-white text-xl md:text-3xl font-semibold select-none">
            Categorizador de Arquivos
          </h1>
        </div>

        {/* Botões de navegação e logout */}
        <div className="hidden md:flex items-center gap-4">
          {/* Renderiza links de usuário se o papel não for 'admin' */}
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
            disabled={carregando} // Desativa o botão se uma operação estiver em andamento
          >
            <i className="bx bx-log-out"></i> Sair
          </button>
        </div>
      </nav>
    </div>
  );
}

export default NavPadrao;
