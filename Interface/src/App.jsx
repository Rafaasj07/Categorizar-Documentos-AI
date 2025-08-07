// Importa o hook que faz a análise do documento com IA
import { useDocumentos } from './hooks/useDocumentos';

// Importa os componentes de formulário e exibição de resultados
import FormularioDocumento from './components/FormularioDocumento';
import InfoDocumento from './components/InfoDocumento';

function App() {
  // Usa o hook personalizado para controlar o estado da análise
  const { documentoInfo, carregando, erro, analisarDocumento } = useDocumentos();

  return (
    <div className="flex flex-col items-center min-h-screen bg-gradient-to-r from-gray-950 via-gray-900 to-gray-800 p-4 pt-10">
      
      {/* Título principal da página */}
      <h1 className="text-5xl font-bold text-center mb-6 text-white shadow-lg">
        Categorizar Documentos AI
      </h1>

      {/* Exibe mensagem de erro, se houver */}
      {erro && (
        <div className="w-full max-w-3xl mt-4 p-4 bg-red-900 border border-red-700 text-red-200 rounded-lg text-center">
          <p>
            <strong>Ops, algo deu errado:</strong> {erro}
          </p>
        </div>
      )}
      
      {/* Formulário para enviar o prompt e o arquivo PDF */}
      <FormularioDocumento 
        aoAnalisar={analisarDocumento} // Função de análise do hook
        carregando={carregando} // Estado de loading para desabilitar/enfeitar o botão
      />
      
      {/* Exibe as informações do documento após análise */}
      {documentoInfo && <InfoDocumento info={documentoInfo} />}
    </div>
  );
}

export default App;
