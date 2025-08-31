// Importa o hook 'useState' do React para gerenciar o estado do componente.
import { useState } from 'react';

// Define o componente funcional 'FormularioDocumento'.
// Ele recebe as propriedades 'aoAnalisar' (uma função) e 'carregando' (um booleano).
const FormularioDocumento = ({ aoAnalisar, carregando }) => {
  // Cria um estado para armazenar o texto da instrução adicional do usuário.
  const [promptUsuario, setPromptUsuario] = useState('');
  // Cria um estado para armazenar os objetos de arquivo selecionados.
  const [arquivos, setArquivos] = useState([]);
  // Cria um estado para armazenar apenas os nomes dos arquivos para exibição na tela.
  const [nomesArquivos, setNomesArquivos] = useState([]);
  // Cria um estado para armazenar mensagens de erro relacionadas ao upload de arquivos.
  const [arquivoErro, setArquivoErro] = useState('');

  // Define o tamanho máximo permitido por arquivo em bytes (14MB).
  const TAMANHO_MAXIMO_EM_BYTES = 14 * 1024 * 1024;
  // Define a quantidade máxima de arquivos que podem ser enviados de uma vez.
  const MAXIMO_ARQUIVOS = 10;

  // Função executada quando o usuário seleciona arquivos no input.
  const aoMudarArquivo = (evento) => {
    // Pega a lista de arquivos do evento do input.
    const files = evento.target.files;

    // Limpa os estados de arquivos e erros anteriores.
    setArquivos([]);
    setNomesArquivos([]);
    setArquivoErro('');

    // Se nenhum arquivo foi selecionado, não faz nada.
    if (!files || files.length === 0) return;

    // Valida se o número de arquivos não excede o limite máximo.
    if (files.length > MAXIMO_ARQUIVOS) {
      setArquivoErro(`Você só pode selecionar no máximo ${MAXIMO_ARQUIVOS} arquivos por vez.`);
      evento.target.value = ''; // Limpa o input de arquivo.
      return;
    }

    // Arrays para armazenar os arquivos que passarem na validação.
    const arquivosValidos = [];
    const nomesValidos = [];
    let erroEncontrado = '';

    // Itera sobre cada arquivo selecionado para validar o tamanho.
    for (const file of files) {
      // Verifica se o tamanho do arquivo excede o limite.
      if (file.size > TAMANHO_MAXIMO_EM_BYTES) {
        const tamanhoEmMb = (TAMANHO_MAXIMO_EM_BYTES / (1024 * 1024)).toFixed(1);
        erroEncontrado = `O arquivo "${file.name}" é muito grande! O máximo é ${tamanhoEmMb}MB.`;
        break; // Interrompe o loop se encontrar um arquivo inválido.
      }
      // Adiciona o arquivo e seu nome às listas de válidos.
      arquivosValidos.push(file);
      nomesValidos.push(file.name);
    }

    // Se um erro foi encontrado durante a validação.
    if (erroEncontrado) {
      setArquivoErro(erroEncontrado); // Exibe a mensagem de erro.
      evento.target.value = ''; // Limpa o input.
    } else {
      // Se todos os arquivos forem válidos, atualiza os estados.
      setArquivos(arquivosValidos);
      setNomesArquivos(nomesValidos);
    }
  };

  // Função executada quando o formulário é enviado.
  const aoSubmeter = (evento) => {
    evento.preventDefault(); // Impede o recarregamento padrão da página.
    aoAnalisar(promptUsuario, arquivos); // Chama a função de análise (passada pelo componente pai).
  };

  // Retorna a estrutura JSX (HTML) do componente.
  return (
    <div className="w-full max-w-3xl px-4 rounded-lg mb-8">
      <form onSubmit={aoSubmeter}>
        <div className="mb-6">
          <label htmlFor="arquivo" className="block text-gray-300 text-lg font-semibold mb-2">
            1. Envie até 10 PDFs (Máx: 14MB cada)
          </label>
          <input
            type="file"
            id="arquivo"
            accept=".pdf" // Aceita apenas arquivos com a extensão .pdf.
            onChange={aoMudarArquivo} // Define a função para lidar com a seleção de arquivos.
            disabled={carregando} // Desabilita o input enquanto a análise estiver em andamento.
            multiple // Permite que múltiplos arquivos sejam selecionados.
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-700 file:text-gray-200 hover:file:bg-gray-600 cursor-pointer"
          />
          {/* Exibe a lista de arquivos selecionados se houver algum. */}
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
          {/* Exibe a mensagem de erro se houver alguma. */}
          {arquivoErro && <p className="text-red-500 text-sm mt-2">{arquivoErro}</p>}
        </div>

        <div className="mb-6">
          <label htmlFor="promptUsuario" className="block text-gray-300 text-lg font-semibold mb-2">
            2. Instrução Adicional (Opcional)
          </label>
          <input
            type="text"
            id="promptUsuario"
            value={promptUsuario} // O valor do input é controlado pelo estado 'promptUsuario'.
            onChange={(e) => setPromptUsuario(e.target.value)} // Atualiza o estado quando o usuário digita.
            className="shadow-inner appearance-none border border-gray-700 rounded-lg w-full py-3 px-4 bg-gray-800 text-gray-200 leading-tight focus:outline-none focus:ring-2 focus:ring-indigo-500 placeholder-gray-500"
            placeholder="Ex: Foque nos aspectos financeiros dos documentos."
          />
        </div>

        <div className="flex items-center justify-center mt-8">
          <button
            type="submit"
            // O botão é desabilitado se estiver carregando, se não houver arquivos ou se houver erro.
            disabled={carregando || arquivos.length === 0 || !!arquivoErro}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 text-lg rounded-lg focus:outline-none focus:shadow-outline disabled:bg-gray-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
          >
            {/* O texto do botão muda dependendo se está carregando ou não. */}
            {carregando ? 'Analisando...' : `Analisar ${arquivos.length} Documento(s)`}
          </button>
        </div>
      </form>
    </div>
  );
};

// Exporta o componente para que ele possa ser usado em outras partes da aplicação.
export default FormularioDocumento;