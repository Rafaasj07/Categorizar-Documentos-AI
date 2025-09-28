import { useState } from 'react';

const FormularioDocumento = ({ aoAnalisar, carregando }) => {
  // controla os campos do formulário, lista de arquivos e mensagens de erro
  const [promptUsuario, setPromptUsuario] = useState('');
  const [arquivos, setArquivos] = useState([]);
  const [nomesArquivos, setNomesArquivos] = useState([]);
  const [arquivoErro, setArquivoErro] = useState('');

  // limites para upload de arquivos (tamanho e quantidade)
  const TAMANHO_MAXIMO_EM_BYTES = 5 * 1024 * 1024;
  const MAXIMO_ARQUIVOS = 10;

  // chamada ao selecionar arquivos: valida quantidade e tamanho
  const aoMudarArquivo = (evento) => {
    const files = evento.target.files;

    // limpa seleção anterior
    setArquivos([]);
    setNomesArquivos([]);
    setArquivoErro('');

    if (!files || files.length === 0) return;

    if (files.length > MAXIMO_ARQUIVOS) {
      setArquivoErro(`Você só pode selecionar no máximo ${MAXIMO_ARQUIVOS} arquivos por vez.`);
      evento.target.value = '';
      return;
    }

    // valida cada arquivo e armazena apenas os válidos
    const arquivosValidos = [];
    const nomesValidos = [];
    let erroEncontrado = '';

    for (const file of files) {
      if (file.size > TAMANHO_MAXIMO_EM_BYTES) {
        const tamanhoEmMb = (TAMANHO_MAXIMO_EM_BYTES / (1024 * 1024)).toFixed(1);
        erroEncontrado = `O arquivo "${file.name}" é muito grande! O máximo é ${tamanhoEmMb}MB.`;
        break;
      }
      arquivosValidos.push(file);
      nomesValidos.push(file.name);
    }

    if (erroEncontrado) {
      setArquivoErro(erroEncontrado);
      evento.target.value = '';
    } else {
      setArquivos(arquivosValidos);
      setNomesArquivos(nomesValidos);
    }
  };

  // chamada no envio do formulário: dispara a função recebida por props
  const aoSubmeter = (evento) => {
    evento.preventDefault();
    aoAnalisar(promptUsuario, arquivos);
  };

  return (
    <div className="w-full max-w-3xl px-4 rounded-lg mb-8">
      <form onSubmit={aoSubmeter}>
        {/* upload de arquivos */}
        <div className="mb-6">
          <label htmlFor="arquivo" className="block text-gray-300 text-lg font-semibold mb-2">
            1. Envie até 10 PDFs (Máx: 5MB cada)
          </label>
          <input
            type="file"
            id="arquivo"
            accept=".pdf"
            onChange={aoMudarArquivo}
            disabled={carregando}
            multiple
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600 cursor-pointer"
          />
          {/* mostra lista de arquivos válidos */}
          {nomesArquivos.length > 0 && (
            <div className="text-green-400 text-sm mt-2">
              <p>{nomesArquivos.length} arquivo(s) selecionado(s):</p>
              <ul className="list-disc list-inside">
                {nomesArquivos.map((name, index) => (
                  <li key={index} className="break-all">{name}</li>
                ))}
              </ul>
            </div>
          )}
          {/* mostra mensagem de erro */}
          {arquivoErro && <p className="text-red-500 text-sm mt-2">{arquivoErro}</p>}
        </div>

        {/* campo de instrução adicional */}
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
            placeholder="Ex: Foque nos aspectos financeiros dos documentos."
          />
        </div>

        {/* botão de envio */}
        <div className="flex items-center justify-center mt-8">
          <button
            type="submit"
            disabled={carregando || arquivos.length === 0 || !!arquivoErro}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 text-lg rounded-lg focus:outline-none focus:shadow-outline disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            {carregando ? 'Analisando...' : `Analisar ${arquivos.length} Documento(s)`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormularioDocumento;
