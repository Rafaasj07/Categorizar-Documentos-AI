/**
 * Componente de navegação superior padrão. Utiliza o contexto de autenticação
 * para exibir os links corretos e para realizar o logout.
 */

// Importa o ícone da aplicação.
import icone from '../assets/icone.png';
// Importa hooks do 'react-router-dom' para navegação.
import { useNavigate, Link } from 'react-router-dom';
// Importa o hook 'useAuth' para acessar dados de autenticação.
import { useAuth } from '../context/AuthContext';

// Define o componente da barra de navegação superior.
// Recebe 'carregando' para desabilitar botões durante operações.
function NavPadrao({ carregando }) {
  // Inicializa a função para navegar entre páginas.
  const navegar = useNavigate();
  // Obtém a função de logout e o tipo de usuário (role) do contexto de autenticação.
  const { signOut, userRole } = useAuth();

  // Função para lidar com o clique no botão de logout.
  const handleLogout = async () => {
    // Impede o logout se uma operação estiver em andamento.
    if (carregando) return;
    try {
      // Chama a função de logout do contexto.
      await signOut();
      // Redireciona para a página de login.
      navegar('/login');
    } catch (error) {
      // Exibe um erro no console se o logout falhar.
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Define as classes de estilo para os links de navegação.
  // A aparência muda se os botões estiverem desabilitados.
  const linkClasses = `flex items-center gap-2 border border-indigo-600 text-indigo-400
    font-semibold py-2 px-6 rounded-full transition duration-300 ease-in-out bg-transparent
    ${carregando ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-600 hover:text-white cursor-pointer'}`;
  
  // Define as classes de estilo para o botão de sair.
  const sairClasses = `flex items-center gap-2 bg-red-600 text-white font-semibold
    py-2 px-6 rounded-full transition duration-300 ease-in-out
    ${carregando ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700 cursor-pointer'}`;

  // Retorna a estrutura JSX (HTML) do componente.
  return (
    // Container principal da barra de navegação, fixo no topo da página.
    <div className="fixed top-0 left-0 w-full z-50">
      <nav className="flex items-center justify-between bg-gray-900 border-b border-indigo-600 shadow-md h-24 px-8">
        {/* Lado esquerdo da barra: ícone e título. */}
        <div className="flex items-center gap-4"> 
          <img src={icone} alt="Logo do sistema" className="h-12 sm:h-14 md:h-16 mt-1 -ml-3 sm:ml-0" />
          <h1 className="text-white text-xl md:text-3xl font-semibold select-none">
            Categorizador de Arquivos
          </h1>
        </div>
        
        {/* Lado direito da barra: links de navegação. Fica escondido em telas pequenas. */}
        <div className="hidden md:flex items-center gap-4">
          {/* Mostra os links 'Categorizar' e 'Buscar' apenas se o usuário não for admin. */}
          {userRole !== 'admin' && (
            <>
              {/* Link para a página de categorização. */}
              <Link to="/categorizar" className={linkClasses} onClick={e => carregando && e.preventDefault()}>
                <i className="bx bx-folder-open"></i> Categorizar
              </Link>
              {/* Link para a página de busca. */}
              <Link to="/buscar" className={linkClasses} onClick={e => carregando && e.preventDefault()}>
                <i className="bx bx-search"></i> Buscar
              </Link>
            </>
          )}
          {/* Botão para fazer logout. */}
          <button onClick={handleLogout} className={sairClasses} disabled={carregando}>
            <i className='bx bx-log-out'></i> Sair
          </button>
        </div>
      </nav>
    </div>
  );
}

// Exporta o componente para ser usado em outras partes da aplicação.
export default NavPadrao;