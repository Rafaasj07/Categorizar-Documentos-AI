import icone from '../assets/icone.png';
import { useNavigate } from 'react-router-dom';

// Navegação padrão no topo, aceita prop 'carregando' para desabilitar botões
function NavPadrao({ carregando }) {
  const navegar = useNavigate(); // Hook para navegação

  return (
    <div className="fixed top-0 left-0 w-full z-50">
      <nav className="flex items-center justify-between bg-gray-900 shadow-md h-24 px-8">
        {/* Logo e título */}
        <div className="flex items-center gap-4">
          <img src={icone} alt="Logo do sistema" className="h-16 mt-1" />
          <h1 className="text-white text-xl md:text-3xl font-semibold select-none">
            Categorizador de Arquivos
          </h1>
        </div>

        {/* Botões visíveis só em telas md+ */}
        <div className="hidden md:flex gap-4">
          {/* Botão Categorizar, bloqueia se carregando */}
          <button
            onClick={() => navegar('/Categorizar')}
            disabled={carregando}
            className="
              flex items-center gap-2
              border border-indigo-600 text-indigo-600
              hover:bg-indigo-600 hover:text-white
              font-semibold py-2 px-6 rounded-full
              transition duration-300 ease-in-out
              disabled:opacity-50 disabled:cursor-not-allowed
              bg-transparent
            "
          >
            <i className="bx bx-home"></i> Categorizar
          </button>

          {/* Botão Buscar, bloqueia se carregando */}
          <button
            onClick={() => navegar('/Buscar')}
            disabled={carregando}
            className="
              flex items-center gap-2
              border border-indigo-600 text-indigo-600
              hover:bg-indigo-600 hover:text-white
              font-semibold py-2 px-6 rounded-full
              transition duration-300 ease-in-out
              disabled:opacity-50 disabled:cursor-not-allowed
              bg-transparent
            "
          >
            <i className="bx bx-search"></i> Buscar
          </button>
        </div>
      </nav>
    </div>
  );
}

export default NavPadrao;
