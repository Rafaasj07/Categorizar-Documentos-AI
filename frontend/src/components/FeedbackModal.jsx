import { useState, useEffect } from 'react';
import Modal from './Modal';
import { apiSubmitFeedback, apiCheckUserFeedback } from '../services/api';

const feedbackOptions = [
  { rating: 5, label: 'Excelente', emoji: '🤩', color: 'text-pink-500' },
  { rating: 4, label: 'Bom', emoji: '😊', color: 'text-green-500' },
  { rating: 3, label: 'Neutro', emoji: '😐', color: 'text-yellow-500' },
  { rating: 2, label: 'Ruim', emoji: '😕', color: 'text-orange-500' },
  { rating: 1, label: 'Muito Ruim', emoji: '😡', color: 'text-red-500' },
];

const FeedbackModal = ({ isOpen, onClose, doc }) => {
  const [selectedRating, setSelectedRating] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [hasAlreadyVoted, setHasAlreadyVoted] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Reseta estados e verifica existência de feedback anterior ao abrir o modal
  useEffect(() => {
    if (isOpen && doc) {
      setSelectedRating(null);
      setIsLoading(false);
      setError('');
      setIsSuccess(false);
      setHasAlreadyVoted(false);
      setIsChecking(true);
      setIsConfirmModalOpen(false);

      const checkFeedback = async () => {
        try {
          const data = await apiCheckUserFeedback(doc.doc_uuid);
          setHasAlreadyVoted(data.hasVoted);
        } catch (err) {
          setError("Não foi possível verificar seu feedback anterior.");
        } finally {
          setIsChecking(false);
        }
      };
      checkFeedback();
    }
  }, [isOpen, doc]);

  const handleClose = () => {
    onClose();
  };

  const handleOpenSubmitModal = () => {
    if (!selectedRating || !doc) return;
    setError('');
    setIsConfirmModalOpen(true);
  };

  const handleCancelSubmit = () => {
    setIsConfirmModalOpen(false);
  };

  // Envia o feedback à API e trata respostas de sucesso ou conflito (voto duplicado)
  const handleDoSubmit = async () => {
    if (!selectedRating || !doc) return;

    setIsLoading(true);
    setError('');

    try {
      await apiSubmitFeedback(doc.doc_uuid, selectedRating);

      setIsSuccess(true);
      setIsConfirmModalOpen(false);
      setTimeout(handleClose, 2000);

    } catch (err) {
      if (err.response && err.response.status === 409) {
        setError('Feedback já foi realizado para este documento.');
        setHasAlreadyVoted(true);
      } else {
        setError(err.response?.data?.erro || 'Falha ao enviar feedback.');
      }
      setIsConfirmModalOpen(false);

    } finally {
      setIsLoading(false);
    }
  };

  // Define o conteúdo visual com base no estado atual (verificando, sucesso, já votou ou formulário)
  const renderContent = () => {
    if (isChecking) {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <i className="bx bx-loader-alt animate-spin text-5xl text-indigo-400"></i>
          <p className="text-lg text-gray-300 mt-4">Verificando...</p>
        </div>
      );
    }

    if (isSuccess) {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <i className="bx bx-check-circle text-green-500 text-6xl mb-4"></i>
          <p className="text-xl text-white">Obrigado pelo seu feedback!</p>
        </div>
      );
    }

    if (hasAlreadyVoted) {
      return (
        <div className="flex flex-col items-center justify-center h-48">
          <i className="bx bx-error-circle text-yellow-500 text-6xl mb-4"></i>
          <p className="text-xl text-white">O Feedback já foi realizado.</p>
          <p className="text-gray-400 mt-2">Você já deu seu feedback para este documento.</p>
        </div>
      );
    }

    return (
      <>
        <p className="text-gray-300 mb-2">
          O que você achou da categorização do documento:
        </p>
        <p className="text-indigo-400 font-semibold break-words mb-6">
          {doc?.fileName}
        </p>

        <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-2 mb-6">
          {feedbackOptions.map((opt) => (
            <button
              key={opt.rating}
              onClick={() => setSelectedRating(opt.rating)}
              disabled={isLoading}
              className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 w-full md:w-24
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

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

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

  return (
    <>
      <Modal isOpen={isOpen} onClose={handleClose} title="Qual seu feedback?">
        <div className="text-center">
          {renderContent()}
        </div>
      </Modal>

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
            <button
              onClick={handleCancelSubmit}
              disabled={isLoading}
              className="px-8 py-2.5 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-500 disabled:opacity-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleDoSubmit}
              disabled={isLoading}
              className="flex items-center justify-center gap-2 w-28 px-10 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-wait transition-colors"
            >
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