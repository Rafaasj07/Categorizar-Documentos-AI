import { useDocumentos } from '../hooks/useDocumentos';
import FormularioDocumento from '../components/FormularioDocumento';
import InfoDocumento from '../components/InfoDocumento';
import NavPadrao from '../components/NavPadrao';
import NavInferior from '../components/NavInferior';

// Define o componente da página principal de categorização.
function Categorizar() {
  // Utiliza o hook customizado para obter o estado e as funções de análise.
  const { documentosInfo, carregando, erro, progresso, analisarDocumento } = useDocumentos();

  // Formata a mensagem de progresso para que nomes de arquivos longos não quebrem o layout.
  const renderProgresso = () => {
    const match = progresso.match(/(Analisando \d+ de \d+: ")([^"]+)(")/);

    if (match) {
      const prefixo = match[1];
      const nomeArquivo = match[2];
      const sufixo = match[3];

      return (
        <>
          {prefixo}<span className="break-all">{nomeArquivo}</span>{sufixo}
        </>
      );
    }

    return progresso;
  };

  // Estrutura visual da página.
  return (
    <div className="flex flex-col items-center min-h-screen bg-black p-4 pt-24 md:pt-32 pb-24 md:pb-4">
      {/* Componentes de navegação. */}
      <NavPadrao carregando={carregando} />
      <NavInferior carregando={carregando} />

      <div className="w-full max-w-3xl pt-6 md:pt-0">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white shadow-lg">
          Classificação de Documentos PDF
        </h1>

        {/* Exibe um bloco de erro se alguma falha ocorrer. */}
        {erro && (
          <div className="w-full max-w-3xl mt-4 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg text-center">
            <p><strong>Ops, algo deu errado:</strong> {erro}</p>
          </div>
        )}

        {/* Renderiza o formulário de upload. */}
        <FormularioDocumento
          aoAnalisar={analisarDocumento}
          carregando={carregando}
        />

        {/* Exibe a mensagem de progresso durante a análise. */}
        {carregando && progresso && (
          <div className="w-full max-w-3xl my-4 p-3 bg-blue-900/50 border border-blue-700 text-blue-200 rounded-lg text-center">
            <p className="flex items-center justify-center gap-2">
              <i className='bx bx-loader-alt animate-spin'></i> {renderProgresso()}
            </p>
          </div>
        )}

        {/* Exibe a seção de resultados após a conclusão da análise. */}
        {documentosInfo.length > 0 && (
          <div className="space-y-6 mt-8">
            <h2 className="text-3xl font-bold text-center text-white">Resultados da Análise</h2>
            {/* Itera sobre cada resultado e renderiza as informações do documento. */}
            {documentosInfo.map((info, index) => (
              <div key={index}>
                <h3 className="text-xl font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1 break-all">
                  Arquivo: {info.nomeArquivo}
                </h3>
                <InfoDocumento info={info} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Categorizar;