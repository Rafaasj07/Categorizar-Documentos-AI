import { useNavigate } from 'react-router-dom';

// Componente de navegação inferior, recebe prop 'carregando' para bloquear botões
const NavInferior = ({ carregando }) => {
  const navegar = useNavigate(); // Hook para navegação programática

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full h-20 bg-gray-900 border-t border-indigo-600 shadow-md flex items-center justify-around px-4 z-50">
      {/* Botão Categorizar - desabilita se carregando */}
      <button
        onClick={() => navegar('/Categorizar')}
        disabled={carregando}
        className="flex flex-col items-center gap-1 text-indigo-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Categorizar"
      >
        <i className="bx bx-folder-open text-2xl"></i>
        <span className="text-xs font-semibold">Categorizar</span>
      </button>

      {/* Botão Buscar - desabilita se carregando */}
      <button
        onClick={() => navegar('/Buscar')}
        disabled={carregando}
        className="flex flex-col items-center gap-1 text-indigo-400 hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Buscar"
      >
        <i className="bx bx-search text-2xl"></i>
        <span className="text-xs font-semibold">Buscar</span>
      </button>
    </nav>
  );
};

export default NavInferior;
