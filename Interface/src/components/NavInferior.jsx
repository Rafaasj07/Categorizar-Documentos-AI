// Importa o hook 'useNavigate' para navegação entre páginas.
import { useNavigate } from 'react-router-dom';
// Importa o hook 'useAuth' para acessar informações de autenticação do usuário.
import { useAuth } from '../context/AuthContext';

// Define o componente da barra de navegação inferior.
// Ele recebe a propriedade 'carregando' para saber se alguma operação está em andamento.
const NavInferior = ({ carregando }) => {
  // Inicializa a função de navegação.
  const navegar = useNavigate();
  // Obtém o tipo de usuário (role) e a função de logout do contexto de autenticação.
  const { userRole, signOut } = useAuth();

  // Função para lidar com o clique no botão de logout.
  const handleLogout = async () => {
    // Se uma operação já estiver carregando, não faz nada.
    if (carregando) return;
    try {
      // Chama a função de logout.
      await signOut();
      // Redireciona o usuário para a página de login.
      navegar('/login');
    } catch (error) {
      // Em caso de erro, exibe no console.
      console.error("Erro ao fazer logout:", error);
    }
  };

  // Define as classes de estilo padrão para os botões da barra de navegação.
  const buttonClasses = "flex flex-col items-center gap-1 text-indigo-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  // Define como os botões serão alinhados com base no tipo de usuário.
  // Se for admin, o botão de sair fica centralizado. Se não, os botões são espaçados.
  const justificationClass = userRole === 'admin' ? 'justify-center' : 'justify-around';

  // Retorna a estrutura JSX (HTML) da barra de navegação.
  return (
    // A barra de navegação é fixa na parte inferior e só aparece em telas pequenas (md:hidden).
    <nav className={`md:hidden fixed bottom-0 left-0 w-full h-20 bg-gray-900 border-y border-indigo-600 shadow-md flex items-center z-50 px-4 ${justificationClass}`}>

      {/* Renderização condicional: verifica se o usuário é um administrador. */}
      {userRole === 'admin' ? (
        // Se for um administrador, mostra apenas o botão de SAIR.
        <button
          onClick={handleLogout}
          disabled={carregando}
          className={buttonClasses}
          aria-label="Sair"
        >
          <i className="bx bx-log-out text-2xl"></i>
          <span className="text-xs font-semibold">Sair</span>
        </button>
      ) : (
        // Se for um usuário comum, mostra os botões de Categorizar, Buscar e Sair.
        <>
          {/* Botão para navegar para a página de categorização. */}
          <button
            onClick={() => navegar('/categorizar')}
            disabled={carregando}
            className={buttonClasses}
            aria-label="Categorizar"
          >
            <i className="bx bx-folder-open text-2xl"></i>
            <span className="text-xs font-semibold">Categorizar</span>
          </button>

          {/* Botão para navegar para a página de busca. */}
          <button
            onClick={() => navegar('/buscar')}
            disabled={carregando}
            className={`${buttonClasses} pr-3`}
            aria-label="Buscar"
          >
            <i className="bx bx-search text-2xl"></i>
            <span className="text-xs font-semibold">Buscar</span>
          </button>

          {/* Botão para fazer logout. */}
          <button
            onClick={handleLogout}
            disabled={carregando}
            className={buttonClasses}
            aria-label="Sair"
          >
            <i className="bx bx-log-out text-2xl"></i>
            <span className="text-xs font-semibold">Sair</span>
          </button>
        </>
      )}
    </nav>
  );
};

// Exporta o componente para ser usado em outras partes da aplicação.
export default NavInferior;