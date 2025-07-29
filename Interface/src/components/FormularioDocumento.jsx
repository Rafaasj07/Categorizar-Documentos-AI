import { useState } from 'react';

// Componente React que exibe um formulário de upload e instrução para análise de um PDF
const FormularioDocumento = ({ aoAnalisar, carregando }) => {
  // Estado para armazenar a instrução extra do usuário
  const [promptUsuario, setPromptUsuario] = useState('');
  // Estado para armazenar o arquivo selecionado
  const [arquivo, setArquivo] = useState(null);
  // Nome do arquivo selecionado (para exibir)
  const [nomeArquivo, setNomeArquivo] = useState('');
  // Mensagem de erro relacionada ao arquivo (ex: se for grande demais)
  const [arquivoErro, setArquivoErro] = useState('');

  // Define o tamanho máximo do arquivo (5 MB)
  const TAMANHO_MAXIMO_EM_BYTES = 5 * 1024 * 1024;

  // Função chamada sempre que o usuário troca o arquivo selecionado
  const aoMudarArquivo = (evento) => {
    const file = evento.target.files[0];

    // Resetar os estados relacionados ao arquivo
    setArquivo(null);
    setArquivoErro('');
    setNomeArquivo('');

    // Se nenhum arquivo for selecionado, sai da função
    if (!file) return;

    // Verifica se o tamanho do arquivo excede o limite
    if (file.size > TAMANHO_MAXIMO_EM_BYTES) {
      const tamanhoEmMb = (TAMANHO_MAXIMO_EM_BYTES / (1024 * 1024)).toFixed(1);
      setArquivoErro(`Arquivo muito grande! O máximo permitido é de ${tamanhoEmMb}MB.`);
      evento.target.value = ''; // Limpa o input
    } else {
      // Tudo certo: atualiza os estados com o arquivo selecionado
      setArquivo(file);
      setNomeArquivo(file.name);
    }
  };

  // Função chamada quando o formulário é enviado
  const aoSubmeter = (evento) => {
    evento.preventDefault(); // Evita o recarregamento da página
    aoAnalisar(promptUsuario, arquivo); // Chama a função que vai lidar com os dados (enviada via props)
  };

  return (
    <div className="w-full max-w-3xl p-4 rounded-lg mb-8">
      <form onSubmit={aoSubmeter}>
        
        {/* Upload do arquivo */}
        <div className="mb-6">
          <label htmlFor="arquivo" className="block text-gray-300 text-lg font-semibold mb-2">
            1. Envie um documento PDF (Máx: 5MB)
          </label>
          <input
            type="file"
            id="arquivo"
            accept=".pdf"
            onChange={aoMudarArquivo}
            disabled={carregando}
            className="block w-full text-sm text-gray-400 
              file:mr-4 file:py-2 file:px-4 file:rounded-full 
              file:border-0 file:text-sm file:font-semibold 
              file:bg-gray-700 file:text-gray-200 
              hover:file:bg-gray-600 cursor-pointer"
          />
          {/* Feedback visual do nome do arquivo ou erro */}
          {nomeArquivo && <p className="text-green-400 text-sm mt-2">Arquivo selecionado: {nomeArquivo}</p>}
          {arquivoErro && <p className="text-red-500 text-sm mt-2">{arquivoErro}</p>}
        </div>

        {/* Instrução extra opcional */}
        <div className="mb-6">
          <label htmlFor="promptUsuario" className="block text-gray-300 text-lg font-semibold mb-2">
            2. Instrução Adicional (Opcional)
          </label>
          <input
            type="text"
            id="promptUsuario"
            value={promptUsuario}
            onChange={(e) => setPromptUsuario(e.target.value)}
            className="shadow-inner appearance-none border border-gray-700 rounded-lg w-full py-3 px-4 bg-gray-800 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
            placeholder="Ex: Foque nos aspectos financeiros do documento."
          />
        </div>

        {/* Botão de submissão */}
        <div className="flex items-center justify-center mt-8">
          <button
            type="submit"
            disabled={carregando || !arquivo || !!arquivoErro} // Desabilita se estiver carregando, sem arquivo ou com erro
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 text-lg rounded-lg 
              focus:outline-none focus:shadow-outline disabled:bg-gray-600 
              disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            {carregando ? 'Analisando...' : 'Analisar Documento'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioDocumento;
