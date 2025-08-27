import { useDocumentos } from '../hooks/useDocumentos';
import FormularioDocumento from '../components/FormularioDocumento';
import InfoDocumento from '../components/InfoDocumento';
import NavPadrao from '../components/NavPadrao';
import NavInferior from '../components/NavInferior';
import AuthStatus from '../components/AuthStatus';
import UploadForm from '../components/UploadForm';

function Categorizar() {
  const handleUploadSuccess = () => {
      // Lógica para quando o upload for bem-sucedido:
      // recarrega uma lista de docs (FileList) ou mostra uma notificação.
    console.log("Upload concluído na página Categorizar.");
    return (
      <div>
        <AuthStatus /> {/* Exibe o status de autenticação e o botão Sair */}
        <h1>Categorizar Documentos</h1>
        <p>Esta é a página onde os usuários podem carregar e categorizar documentos.</p>
        <UploadForm onUploadSuccess={handleUploadSuccess} />
      </div>
    );
  };

  /* Aqui chamar FileList para mostrar o STATUS de documentos enviados*/
  const { documentosInfo, carregando, erro, progresso, analisarDocumento } = useDocumentos();

  return (
    <div className="flex flex-col items-center min-h-screen bg-black p-4 pt-24 md:pt-32 pb-24 md:pb-4">
      {/* Navegação superior e inferior, passando estado de carregamento */}
      <NavPadrao carregando={carregando} />
      <NavInferior carregando={carregando} />

      <div className="w-full max-w-3xl pt-6 md:pt-0">
        {/* Título da página */}
        <h1 className="text-4xl md:text-5xl font-bold text-center mb-4 text-white shadow-lg">
          Classificação de Documentos PDF
        </h1>

        {/* Exibe mensagem de erro caso exista */}
        {erro && (
          <div className="w-full max-w-3xl mt-4 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg text-center">
            <p><strong>Ops, algo deu errado:</strong> {erro}</p>
          </div>
        )}

        {/* Formulário para upload/análise de documentos */}
        <FormularioDocumento
          aoAnalisar={analisarDocumento} // Callback para iniciar análise
          carregando={carregando} // Desabilita formulário se estiver carregando
        />

        {/* Mensagem de progresso durante análise */}
        {carregando && progresso && (
          <div className="w-full max-w-3xl my-4 p-3 bg-blue-900/50 border border-blue-700 text-blue-200 rounded-lg text-center">
            <p className="flex items-center justify-center gap-2">
              <i className='bx bx-loader-alt animate-spin'></i> {progresso}
            </p>
          </div>
        )}

        {/* Exibe resultados da análise, se existirem */}
        {documentosInfo.length > 0 && (
          <div className="space-y-6 mt-8">
            <h2 className="text-3xl font-bold text-center text-white">Resultados da Análise</h2>
            {documentosInfo.map((info, index) => (
              <div key={index}>
                <h3 className="text-xl font-semibold text-gray-300 mb-2 border-b border-gray-700 pb-1">
                  Arquivo: {info.nomeArquivo}
                </h3>
                {/* Componente que mostra detalhes do documento */}
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
