import InfoPadrao from './InfoPadrao';
import InfoNotaFiscal from './InfoNotaFiscal';
import InfoCartorio from './InfoCartorio';
import InfoSEI from './InfoSEI';

import InfoDiploma from './infoGestaoEducacional/InfoDiploma';
import InfoHistoricoEscolar from './infoGestaoEducacional/InfoHistoricoEscolar';
import InfoAtaResultados from './infoGestaoEducacional/InfoAtaResultados';
import InfoCertificado from './infoGestaoEducacional/InfoCertificado';
import InfoPlanoEnsino from './infoGestaoEducacional/InfoPlanoEnsino';
import InfoRegimentoInterno from './infoGestaoEducacional/InfoRegimentoInterno';
import InfoPortariaAto from './infoGestaoEducacional/InfoPortariaAto';
import InfoRegistroMatricula from './infoGestaoEducacional/InfoRegistroMatricula';
import InfoDocEducacionalGenerico from './infoGestaoEducacional/InfoDocEducacionalGenerico';

import DocumentoAcoes from '../DocumentoAcoes'; 

// Gerencia a exibição dinâmica de detalhes com base na categoria identificada pela IA
const InfoDocumento = ({ doc, showDownloadOriginal = true, showFeedbackButton = true }) => {
  // Retorna interface de fallback caso o documento ou dados da IA não existam
  if (!doc || !doc.resultadoIa) {
    return (
      <div className="w-full max-w-3xl mt-6 p-6 bg-gray-800 border border-gray-700 rounded-2xl shadow-lg animate-fadeIn">
        <p className="text-gray-400 p-4">
          {doc ? "Metadados da IA não estão disponíveis." : "Nenhum documento selecionado."}
        </p>
        <DocumentoAcoes 
          doc={doc} 
          showDownloadOriginal={showDownloadOriginal} 
          showFeedbackButton={showFeedbackButton} 
        />
      </div>
    );
  }

  const { categoria, metadados } = doc.resultadoIa;

  // Seleciona o componente visualizador específico normalizando a string da categoria
  const renderizarDetalhes = () => {
    if (!metadados) {
      return <p className="text-gray-400">Metadados não disponíveis.</p>;
    }

    const categoriaNormalizada = categoria.toLowerCase();

    switch (categoriaNormalizada) {
      case 'nota fiscal':
        return <InfoNotaFiscal metadados={metadados} />;
      case 'documento de cartório': 
      case 'certidão de nascimento':
      case 'certidão de casamento':
      case 'certidão de óbito':
      case 'escritura pública':
      case 'procuração pública':
      case 'ata notarial':
      case 'registro imobiliário':
      case 'autenticação/reconhecimento':
      case 'outro ato cartorário':
          return <InfoCartorio metadados={metadados} />;
      case 'ofício sei':
      case 'despacho sei':
      case 'memorando sei':
      case 'parecer/nota técnica sei':
      case 'ata sei':
      case 'termo/contrato/convênio sei':
      case 'portaria sei':
      case 'outro documento sei':
        return <InfoSEI metadados={metadados} />;
      case 'diploma':
        return <InfoDiploma metadados={metadados} />;
      case 'histórico escolar':
        return <InfoHistoricoEscolar metadados={metadados} />;
      case 'ata de resultados':
         return <InfoAtaResultados metadados={metadados} />;
      case 'certificado':
         return <InfoCertificado metadados={metadados} />;
      case 'plano de ensino':
         return <InfoPlanoEnsino metadados={metadados} />;
      case 'regimento interno':
        return <InfoRegimentoInterno metadados={metadados} />;
      case 'portaria ou ato':
         return <InfoPortariaAto metadados={metadados} />;
      case 'registro de matrícula':
         return <InfoRegistroMatricula metadados={metadados} />;
      case 'documento educacional genérico':
         return <InfoDocEducacionalGenerico metadados={metadados} />;
      case 'não identificado':
        return <p className="text-yellow-400">{metadados?.resumo_geral_ia || metadados?.resumo || "Tipo não identificado."}</p>;
      case 'indefinida':
        return <p className="text-red-400">{metadados?.resumo_geral_ia || "Categoria indefinida."}</p>;
      default:
        console.warn(`Componente não encontrado para: ${categoria}. Usando InfoPadrao.`);
        return <InfoPadrao metadados={metadados} />;
    }
  };

  return (
    <div className="w-full max-w-3xl mt-6 p-6 bg-gray-800 border border-gray-700 rounded-2xl shadow-lg animate-fadeIn">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-indigo-400 mb-2">Categoria Identificada</h3>
        <p className="text-2xl font-bold text-white bg-gray-700 px-4 py-3 rounded-lg text-center shadow-lg">
          {categoria}
        </p>
      </div>

      <div>
        <h3 className="text-2xl font-bold text-white mb-4">Metadados Extraídos</h3>
        <div className="space-y-3 text-gray-300">
          {renderizarDetalhes()}
          
          {metadados?.resumo_geral_ia && (
            <div className="mt-4 pt-4 border-t border-gray-700">
              <strong className="text-xl font-semibold text-white block mb-2">Resumo (IA):</strong>
              <p className="text-gray-200">{metadados.resumo_geral_ia}</p>
            </div>
          )}
        </div>
      </div>

      <DocumentoAcoes 
        doc={doc} 
        showDownloadOriginal={showDownloadOriginal} 
        showFeedbackButton={showFeedbackButton}
      />
    </div>
  );
};

export default InfoDocumento;