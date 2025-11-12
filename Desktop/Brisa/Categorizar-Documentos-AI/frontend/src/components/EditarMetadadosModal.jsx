import { useState, useEffect } from 'react';
import Modal from './Modal';
import { apiAtualizarMetadados } from '../services/api';

const EditarMetadadosModal = ({ isOpen, onClose, doc, onUpdateSuccess }) => {
  const [jsonTexto, setJsonTexto] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Efeito para popular o textarea quando o modal é aberto ou o documento muda
  useEffect(() => {
    if (isOpen && doc && doc.resultadoIa) {
      // Formata o JSON do documento para exibição legível no textarea.
      try {
        setJsonTexto(JSON.stringify(doc.resultadoIa, null, 2));
        setError('');
      } catch (e) {
        setError("Erro ao formatar JSON original.");
        setJsonTexto("Erro de formatação.");
      }
    } else if (!isOpen) {
      // Limpa os estados (texto, erro, loading) quando o modal é fechado.
      setJsonTexto('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen, doc]);

  // Handler para submeter a alteração
  const handleSubmit = async () => {
    let parsedJson;

    // 1. Tenta validar se o texto é um JSON válido
    try {
      parsedJson = JSON.parse(jsonTexto);
    } catch (parseError) {
      setError(`JSON inválido: ${parseError.message}`);
      return;
    }

    // 2. Validação da estrutura mínima esperada (categoria e metadados).
    if (!parsedJson.categoria || typeof parsedJson.metadados !== 'object') {
      setError('O JSON deve ter uma chave "categoria" (string) e "metadados" (objeto).');
      return;
    }

    setIsLoading(true);
    setError('');

    // 3. Chama a API para enviar o JSON atualizado.
    try {
      await apiAtualizarMetadados(doc.doc_uuid, parsedJson);
      // 4. Sucesso: Chama a função de callback (do Admin) para atualizar a UI.
      onUpdateSuccess(doc.doc_uuid, parsedJson); 
    } catch (apiError) {
      // 5. Erro: Exibe o erro retornado pela API.
      setError(apiError.response?.data?.erro || 'Falha ao salvar na API.');
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Editar Metadados: ${doc?.fileName || ''}`}>
      <div className="flex flex-col space-y-4">
        <p className="text-sm text-yellow-400">
          <strong>Atenção:</strong> Você está editando o JSON bruto retornado pela IA. 
          Alterações incorretas podem quebrar a exibição dos dados.
        </p>

        {/* O Textarea para edição */}
        <textarea
          value={jsonTexto}
          onChange={(e) => setJsonTexto(e.target.value)}
          disabled={isLoading}
          className="w-full h-96 p-2 bg-gray-900 text-white border border-gray-600 rounded-md font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          spellCheck="false"
        />

        {/* Exibição de Erro */}
        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 rounded-lg bg-gray-600 text-white font-medium hover:bg-gray-500 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 w-32 px-6 py-2.5 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-700 disabled:opacity-70 disabled:cursor-wait transition-colors"
          >
            {/* Alterna entre o ícone de loading e o texto 'Salvar' */}
            {isLoading ? (
              <i className="bx bx-loader-alt animate-spin text-xl"></i>
            ) : (
              'Salvar'
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default EditarMetadadosModal;