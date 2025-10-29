import { useEffect } from 'react';

/**
 * Componente React genérico para renderizar um pop-up modal.
 * Controla o scroll da página e o fechamento.
 */
const Modal = ({ isOpen, onClose, children, title }) => {
  // Efeito que trava ou destrava o scroll da página (body) com base no 'isOpen'.
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'; // Impede scroll
    } else {
      document.body.style.overflow = 'unset'; // Restaura scroll
    }
    // Função de limpeza: restaura o scroll ao desmontar o componente.
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Não renderiza nada se a prop 'isOpen' for falsa.
  if (!isOpen) return null;

  return (
    // Overlay de fundo. Clicar aqui (fora do modal) chama a função 'onClose'.
    <div
      className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex justify-center items-center p-4 animate-fadeIn"
      onClick={onClose} 
    >
      {/* Container do conteúdo. Impede que o clique se propague para o overlay. */}
      <div
        className="bg-gray-800 rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-gray-700 relative"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Botão 'X' para fechar o modal explicitamente. */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-3xl z-10"
          aria-label="Fechar modal"
        >
          &times; 
        </button>

        {/* Renderiza o título do modal, se um 'title' for fornecido. */}
        {title && (
            <h2 className="text-2xl font-bold text-white p-6 pb-4 border-b border-gray-700">
                {title}
            </h2>
        )}

        {/* Renderiza o conteúdo (children) passado para o modal. */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;