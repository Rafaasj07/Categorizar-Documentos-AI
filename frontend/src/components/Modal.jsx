import { useEffect } from 'react';

// Componente genérico de Modal com controle de scroll e fechamento externo
const Modal = ({ isOpen, onClose, children, title }) => {
  // Gerencia o bloqueio do scroll da página enquanto o modal estiver visível
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex justify-center items-center p-4 animate-fadeIn"
      onClick={onClose} 
    >
      <div
        className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-700 relative"
        onClick={(e) => e.stopPropagation()} // Previne fechamento ao clicar no conteúdo interno
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl z-10"
          aria-label="Fechar modal"
        >
          &times; 
        </button>

        {title && (
            <h2 className="text-2xl font-bold text-white p-6 pb-4 border-b border-gray-700">
                {title}
            </h2>
        )}

        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;