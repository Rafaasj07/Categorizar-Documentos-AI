import { useState, useEffect } from 'react';
import Modal from './Modal';
import { apiSubmitFeedback, apiCheckUserFeedback } from '../services/api';

// Mapeia os ratings de feedback (valor, texto, emoji, cor).
const feedbackOptions = [
  { rating: 5, label: 'Excelente', emoji: '🤩', color: 'text-pink-500' },
  { rating: 4, label: 'Bom', emoji: '😊', color: 'text-green-500' },
  { rating: 3, label: 'Neutro', emoji: '😐', color: 'text-yellow-500' },
  { rating: 2, label: 'Ruim', emoji: '😕', color: 'text-orange-500' },
  { rating: 1, label: 'Muito Ruim', emoji: '😡', color: 'text-red-500' },
];

/**
 * Renderiza o modal para coletar feedback (rating) de um documento.
 */
const FeedbackModal = ({ isOpen, onClose, doc }) => {
  const [selectedRating, setSelectedRating] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasAlreadyVoted, setHasAlreadyVoted] = useState(false);
  // Estado para controlar o modal de confirmação.
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Efeito para verificar o status de voto quando o modal abre.
  useEffect(() => {
    if (isOpen && doc) {
      // Reseta os estados para a exibição inicial.
      setSelectedRating(null);
      setIsLoading(false);
      setError('');
      setIsSuccess(false);
      setHasAlreadyVoted(false);
      setIsChecking(true);
      setIsConfirmModalOpen(false); 

      // Função interna para verificar o feedback na API.
      const checkFeedback = async () => {
        try {
          // Chama a API para verificar se já existe voto.
          const data = await apiCheckUserFeedback(doc.doc_uuid);
          setHasAlreadyVoted(data.hasVoted); // Define se o voto já existe.
        } catch (err) {
          setError("Não foi possível verificar seu feedback anterior.");
        } finally {
          setIsChecking(false); // Finaliza a verificação.
        }
      };
      checkFeedback();
    }
  }, [isOpen, doc]);

  // Função para fechar o modal principal.
  const handleClose = () => {
    onClose();
  };

  // Abre o modal de confirmação.
  const handleOpenSubmitModal = () => {
    if (!selectedRating || !doc) return;
    setError(''); // Limpa erros antigos ao tentar enviar.
    setIsConfirmModalOpen(true);
  };

  // Fecha o modal de confirmação.
  const handleCancelSubmit = () => {
    setIsConfirmModalOpen(false);
  };

  /**
   * Executa o envio do feedback (chamada pelo modal de confirmação).
   * Gerencia o estado de 'isLoading' para suavizar a transição.
   */
  const handleDoSubmit = async () => {
    if (!selectedRating || !doc) return;

    // 1. Ativa o 'isLoading' (afeta o modal de confirmação).
    setIsLoading(true);
    setError('');

    try {
      // 2. Chama a API para submeter o feedback.
      await apiSubmitFeedback(doc.doc_uuid, selectedRating);

      // 3. Sucesso: Define o estado de sucesso do modal principal.
      setIsSuccess(true);
      setIsConfirmModalOpen(false);
      // Agenda o fechamento do modal principal após 2 segundos.
      setTimeout(handleClose, 2000);

    } catch (err) {
      // 4. Erro: Trata o erro (ex: voto duplicado).
      if (err.response && err.response.status === 409) {
        setError('Feedback já foi realizado para este documento.');
        setHasAlreadyVoted(true);
      } else {
        setError(err.response?.data?.erro || 'Falha ao enviar feedback.');
      }
      // Fecha o modal de confirmação, revelando o erro no modal principal.
      setIsConfirmModalOpen(false);

    } finally {
      // 5. Finaliza o 'isLoading' (em caso de erro).
      setIsLoading(false);
    }
  };

  // Renderiza o conteúdo interno do modal principal baseado no estado.
  const renderContent = () => {
    // 1. Estado de Verificação (Loading inicial)
    if (isChecking) {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <i className="bx bx-loader-alt animate-spin text-5xl text-indigo-400"></i>
          <p className="text-lg text-gray-300 mt-4">Verificando...</p>
        </div>
      );
    }

    // 2. Estado de Sucesso (Após enviar)
    if (isSuccess) {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <i className="bx bx-check-circle text-green-500 text-6xl mb-4"></i>
          <p className="text-xl text-white">Obrigado pelo seu feedback!</p>
        </div>
      );
    }

    // 3. Estado "Já Votou"
    if (hasAlreadyVoted) {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <i className="bx bx-error-circle text-yellow-500 text-6xl mb-4"></i>
          <p className="text-xl text-white">O Feedback já foi realizado.</p>
          <p className="text-gray-400 mt-2">Você já deu seu feedback para este documento.</p>
        </div>
      );
    }

    // 4. Estado Padrão (Pronto para votar)
    return (
      <>
        <p className="text-gray-300 mb-2">
          O que você achou da categorização do documento:
        </p>
        <p className="text-indigo-400 font-semibold break-words mb-6">
          {doc?.fileName}
        </p>

        {/* Mapeia as opções de feedback (botões). */}
        <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-2 mb-6">
          {feedbackOptions.map((opt) => (
            <button
              key={opt.rating}
              onClick={() => setSelectedRating(opt.rating)}
              disabled={isLoading} // Desabilita durante o envio final.
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 w-full md:w-24
                {/* Estilo condicional para o botão selecionado */}
                ${selectedRating === opt.rating
                  ? 'border-indigo-500 bg-indigo-900/50 scale-105'
                  : 'border-gray-700 bg-gray-900 hover:border-gray-500'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              <span className={`text-4xl ${opt.color}`}>{opt.emoji}</span>
              <span className="text-sm font-medium text-white mt-1">{opt.label}</span>
              <span className="text-xs text-gray-400">({opt.rating})</span>
            </button>
          ))}
        </div>

        {/* Exibe mensagem de erro, se houver. */}
        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        {/* Botão de Envio (abre o modal de confirmação) */}
        <button
          onClick={handleOpenSubmitModal}
          disabled={!selectedRating || isLoading}
          className="w-full flex justify-center items-center gap-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
        >
          Enviar Feedback
        </button>
      </>
    );
  };

  // Renderiza o componente Modal principal com o conteúdo dinâmico.
  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Qual seu feedback?">
        <div className="text-center">
          {renderContent()}
        </div>
      </Modal>

      {/* Modal de Confirmação (exibe estado de loading) */}
      <Modal
        isOpen={isConfirmModalOpen}
        onClose={handleCancelSubmit}
        title="Confirmar Avaliação"
      >
        <div className="text-center p-4">
          <p className="text-lg text-gray-300 mb-8">
            Você confirma esta avaliação? Não será possível alterar seu voto depois de concluído.
          </p>
          <div className="flex justify-center gap-4">
            {/* Botão Cancelar (desabilitado durante o loading) */}
            <button
              onClick={handleCancelSubmit}
              disabled={isLoading}
              className="px-8 py-2.5 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-500 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            {/* Botão OK (mostra spinner durante o loading) */}
            <button
              onClick={handleDoSubmit}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 w-28 px-10 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-wait transition-colors"
            >
              {/* Lógica para exibir loading ou texto */}
              {isLoading ? (
                <i className="bx bx-loader-alt animate-spin text-xl"></i>
              ) : (
                'Ok'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default FeedbackModal;