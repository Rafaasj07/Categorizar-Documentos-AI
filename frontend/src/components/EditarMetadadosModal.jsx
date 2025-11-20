import { useState, useEffect } from 'react';
import Modal from './Modal';
import { apiAtualizarMetadados } from '../services/api';

const EditarMetadadosModal = ({ isOpen, onClose, doc, onUpdateSuccess }) => {
  const [jsonTexto, setJsonTexto] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Sincroniza o estado local com o JSON do documento ao abrir e reseta ao fechar
  useEffect(() => {
    if (isOpen && doc && doc.resultadoIa) {
      try {
        setJsonTexto(JSON.stringify(doc.resultadoIa, null, 2));
        setError('');
      } catch (e) {
        setError("Erro ao formatar JSON original.");
        setJsonTexto("Erro de formatação.");
      }
    } else if (!isOpen) {
      setJsonTexto('');
      setError('');
      setIsLoading(false);
    }
  }, [isOpen, doc]);

  // Valida o JSON, estrutura de dados e envia a atualização via API
  const handleSubmit = async () => {
    let parsedJson;

    try {
      parsedJson = JSON.parse(jsonTexto);
    } catch (parseError) {
      setError(`JSON inválido: ${parseError.message}`);
      return;
    }

    if (!parsedJson.categoria || typeof parsedJson.metadados !== 'object') {
      setError('O JSON deve ter uma chave "categoria" (string) e "metadados" (objeto).');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await apiAtualizarMetadados(doc.doc_uuid, parsedJson);
      onUpdateSuccess(doc.doc_uuid, parsedJson); 
    } catch (apiError) {
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

        <textarea
          value={jsonTexto}
          onChange={(e) => setJsonTexto(e.target.value)}
          disabled={isLoading}
          className="w-full h-96 p-2 bg-gray-900 text-white border border-gray-600 rounded-md font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          spellCheck="false"
        />

        {error && (
          <p className="text-red-500 text-sm text-center">{error}</p>
        )}

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