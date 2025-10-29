import { useDocumentos } from '../hooks/useDocumentos';
import FormularioDocumento from '../components/FormularioDocumento';
import InfoDocumento from '../components/info/InfoDocumento';
import NavPadrao from '../components/NavPadrao';
import NavInferior from '../components/NavInferior';

/**
 * Componente principal da página de categorização de documentos.
 * Gerencia o estado da análise e exibe o formulário e os resultados.
 */
function Categorizar() {
  // Hook customizado que gerencia a lógica de chamada da API de análise.
  const { documentosInfo, carregando, erro, progresso, analisarDocumento } = useDocumentos();

  // Formata a string de progresso para permitir quebra de linha em nomes de arquivos longos.
  const renderProgresso = () => {
    // Tenta extrair o nome do arquivo da string de progresso.
    const match = progresso.match(/(Analisando \d+ de \d+: ")([^"]+)(")/);

    if (match) {
      const prefixo = match[1];
      const nomeArquivo = match[2];
      const sufixo = match[3];

      // Retorna JSX com o nome do arquivo dentro de um <span> para quebra de linha.
      return (
        <>
          {prefixo}<span className="break-all">{nomeArquivo}</span>{sufixo}
        </>
      );
    }

    // Retorna a string de progresso original se não houver match.
    return progresso;
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-black p-4 pt-24 md:pt-32 pb-24 md:pb-4">
      <NavPadrao carregando={carregando} />
      <NavInferior carregando={carregando} />

      <div className="w-full max-w-3xl pt-6 md:pt-0">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white shadow-lg">
          Classificação de Documentos PDF
        </h1>

        {/* Exibe um bloco de feedback se ocorrer um erro na análise. */}
        {erro && (
          <div className="w-full max-w-3xl mt-4 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg text-center">
            <p><strong>Ops, algo deu errado:</strong> {erro}</p>
          </div>
        )}

        {/* Componente do formulário de upload de arquivos e seleção de contexto. */}
        <FormularioDocumento
          aoAnalisar={analisarDocumento}
          carregando={carregando}
        />

        {/* Exibe a mensagem de progresso durante o carregamento (análise). */}
        {carregando && progresso && (
          <div className="w-full max-w-3xl my-4 p-3 bg-blue-900/50 border border-blue-700 text-blue-200 rounded-lg text-center">
            <p className="flex items-center justify-center gap-2">
              <i className='bx bx-loader-alt animate-spin'></i> {renderProgresso()}
            </p>
          </div>
        )}

        {/* Renderiza a seção de resultados se houver documentos analisados. */}
        {documentosInfo.length > 0 && (
          <div className="space-y-6 mt-8">
            <h2 className="text-3xl font-bold text-center text-white">Resultados da Análise</h2>
            {/* Itera sobre cada resultado e renderiza o componente InfoDocumento. */}
            {documentosInfo.map((info, index) => (
              <div key={index}>
                <h3 className="text-xl font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1 break-all">
                  Arquivo: {info.nomeArquivo}
                </h3>
                {/* InfoDocumento decide qual card de detalhes exibir com base na categoria. */}
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