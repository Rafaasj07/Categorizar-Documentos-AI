import { useDocumentos } from '../hooks/useDocumentos';
import FormularioDocumento from '../components/FormularioDocumento';
import InfoDocumento from '../components/info/InfoDocumento';
import NavPadrao from '../components/NavPadrao';
import NavInferior from '../components/NavInferior';

function Categorizar() {
  // Gerencia estado e lógica de análise via hook customizado
  const { documentosInfo, carregando, erro, progresso, analisarDocumento } = useDocumentos();

  // Formata visualmente o progresso, permitindo quebra de linha em nomes de arquivos longos
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

  return (
    <div className="flex flex-col items-center min-h-screen bg-black p-4 pt-24 md:pt-32 pb-24 md:pb-4">
      <NavPadrao carregando={carregando} />
      <NavInferior carregando={carregando} />

      <div className="w-full max-w-3xl pt-6 md:pt-0">
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white shadow-lg">
          Classificação de Documentos PDF
        </h1>

        {erro && (
          <div className="w-full max-w-3xl mt-4 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg text-center">
            <p><strong>Ops, algo deu errado:</strong> {erro}</p>
          </div>
        )}

        <FormularioDocumento
          aoAnalisar={analisarDocumento} 
          carregando={carregando}
        />

        {carregando && progresso && (
          <div className="w-full max-w-3xl my-4 p-3 bg-blue-900/50 border border-blue-700 text-blue-200 rounded-lg text-center">
            <p className="flex items-center justify-center gap-2">
              <i className='bx bx-loader-alt animate-spin'></i> {renderProgresso()}
            </p>
          </div>
        )}

        {/* Renderiza a lista de resultados processados */}
        {documentosInfo.length > 0 && (
          <div className="space-y-6 mt-8">
            <h2 className="text-3xl font-bold text-center text-white">Resultados da Análise</h2>
            
            {documentosInfo.map((info, index) => (
              <div key={index}>
                <h3 className="text-xl font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1 break-all">
                  Arquivo: {info.nomeArquivo}
                </h3>
                <InfoDocumento doc={info} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Categorizar;