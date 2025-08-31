// Importa o hook customizado 'useDocumentos' que contém a lógica para análise de arquivos.
import { useDocumentos } from '../hooks/useDocumentos';
// Importa os componentes que serão usados na página.
import FormularioDocumento from '../components/FormularioDocumento';
import InfoDocumento from '../components/InfoDocumento';
import NavPadrao from '../components/NavPadrao';
import NavInferior from '../components/NavInferior';

// Define o componente da página 'Categorizar'.
function Categorizar() {
  // Utiliza o hook 'useDocumentos' para obter os estados e a função de análise.
  const { documentosInfo, carregando, erro, progresso, analisarDocumento } = useDocumentos();

  // Função para formatar a mensagem de progresso, evitando que nomes de arquivos longos quebrem o layout.
  const renderProgresso = () => {
    // Usa uma expressão regular para encontrar e separar o nome do arquivo da mensagem.
    const match = progresso.match(/(Analisando \d+ de \d+: ")([^"]+)(")/);

    // Se a expressão regular encontrar um padrão correspondente.
    if (match) {
      // Separa a mensagem em prefixo, nome do arquivo e sufixo.
      const prefixo = match[1];
      const nomeArquivo = match[2];
      const sufixo = match[3];

      // Retorna o nome do arquivo dentro de um 'span' que permite a quebra de linha.
      return (
        <>
          {prefixo}<span className="break-all">{nomeArquivo}</span>{sufixo}
        </>
      );
    }

    // Se o padrão não for encontrado, retorna a mensagem de progresso original.
    return progresso;
  };

  // Retorna a estrutura JSX (HTML) da página.
  return (
    <div className="flex flex-col items-center min-h-screen bg-black p-4 pt-24 md:pt-32 pb-24 md:pb-4">
      {/* Renderiza as barras de navegação, passando o estado de 'carregando'. */}
      <NavPadrao carregando={carregando} />
      <NavInferior carregando={carregando} />

      <div className="w-full max-w-3xl pt-6 md:pt-0">
        {/* Título da página. */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white shadow-lg">
          Classificação de Documentos PDF
        </h1>

        {/* Exibe um bloco de erro se a variável 'erro' tiver algum conteúdo. */}
        {erro && (
          <div className="w-full max-w-3xl mt-4 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg text-center">
            <p><strong>Ops, algo deu errado:</strong> {erro}</p>
          </div>
        )}

        {/* Renderiza o formulário de upload de documentos. */}
        <FormularioDocumento
          aoAnalisar={analisarDocumento} // Passa a função que inicia a análise.
          carregando={carregando} // Passa o estado de carregamento para desabilitar o formulário.
        />

        {/* Exibe a mensagem de progresso se estiver carregando e houver uma mensagem. */}
        {carregando && progresso && (
          <div className="w-full max-w-3xl my-4 p-3 bg-blue-900/50 border border-blue-700 text-blue-200 rounded-lg text-center">
            <p className="flex items-center justify-center gap-2">
              <i className='bx bx-loader-alt animate-spin'></i> {renderProgresso()}
            </p>
          </div>
        )}

        {/* Exibe a seção de resultados apenas se houver informações de documentos analisados. */}
        {documentosInfo.length > 0 && (
          <div className="space-y-6 mt-8">
            <h2 className="text-3xl font-bold text-center text-white">Resultados da Análise</h2>
            {/* Itera sobre cada resultado de análise e renderiza as informações. */}
            {documentosInfo.map((info, index) => (
              <div key={index}>
                <h3 className="text-xl font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1 break-all">
                  Arquivo: {info.nomeArquivo}
                </h3>
                {/* Renderiza o componente que exibe os detalhes da análise do documento. */}
                <InfoDocumento info={info} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Exporta o componente para ser usado em outras partes da aplicação.
export default Categorizar;