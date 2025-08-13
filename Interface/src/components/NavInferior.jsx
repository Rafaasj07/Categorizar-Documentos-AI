import { useNavigate } from 'react-router-dom';

const NavInferior = ({ carregando }) => {
  const navegar = useNavigate(); // Hook para navegar entre páginas
  const userRole = localStorage.getItem('userRole'); // Pega o papel do usuário do localStorage

  // Se o usuário for admin, não renderiza nada no rodapé
  if (userRole === 'admin') {
    return null;
  }

  // Classes de estilo para os botões do usuário comum
  const buttonClasses = "flex flex-col items-center gap-1 text-indigo-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed";

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 bg-gray-900 border-y border-indigo-600 shadow-md flex items-center justify-around px-4 z-50">
      {/* Botão para página de categorização */}
      <button
        onClick={() => navegar('/categorizar')}
        disabled={carregando} // Bloqueia se estiver carregando
        className={buttonClasses}
        aria-label="Categorizar"
      >
        <i className="bx bx-folder-open text-2xl"></i>
        <span className="text-xs font-semibold">Categorizar</span>
      </button>

      {/* Botão para página de busca */}
      <button
        onClick={() => navegar('/buscar')}
        disabled={carregando} // Bloqueia se estiver carregando
        className={buttonClasses}
        aria-label="Buscar"
      >
        <i className="bx bx-search text-2xl"></i>
        <span className="text-xs font-semibold">Buscar</span>
      </button>
    </nav>
  );
};

export default NavInferior;
