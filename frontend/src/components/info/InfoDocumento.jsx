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

/**
 * Componente principal que atua como um "roteador" de exibição.
 * Ele decide qual componente de "Info" específico deve ser renderizado
 * com base na categoria do documento recebido.
 */
const InfoDocumento = ({ info }) => {
  // Retorna nulo se não houver dados de info ou categoria.
  if (!info || !info.categoria) {
    return null;
  }

  const { categoria, metadados } = info;

  // Função interna para selecionar o componente de detalhe correto.
  const renderizarDetalhes = () => {
    if (!metadados) {
      return <p className="text-gray-400">Metadados não disponíveis.</p>;
    }

    const categoriaNormalizada = categoria.toLowerCase();

    // Bloco switch principal que mapeia a categoria da IA para um componente React.
    switch (categoriaNormalizada) {
      // Casos gerais
      case 'nota fiscal':
        return <InfoNotaFiscal metadados={metadados} />;
      case 'documento de cartório': 
        return <InfoCartorio metadados={metadados} />;
      // Subtipos específicos do Cartório
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

      // Casos para SEI (todos usam o mesmo componente InfoSEI)
      case 'ofício sei':
      case 'despacho sei':
      case 'memorando sei':
      case 'parecer/nota técnica sei':
      case 'ata sei':
      case 'termo/contrato/convênio sei':
      case 'portaria sei':
      case 'outro documento sei':
        return <InfoSEI metadados={metadados} />;

      // Casos específicos de Gestão Educacional
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

      // Casos de falha na identificação
      case 'não identificado':
        return <p className="text-yellow-400">{metadados?.resumo_geral_ia || metadados?.resumo || "Tipo não identificado."}</p>;
      case 'indefinida':
        return <p className="text-red-400">{metadados?.resumo_geral_ia || "Categoria indefinida."}</p>;

      // Componente padrão (fallback) para categorias não mapeadas.
      default:
        console.warn(`Componente não encontrado para: ${categoria}. Usando InfoPadrao.`);
        return <InfoPadrao metadados={metadados} />;
    }
  };

  return (
    <div className="w-full max-w-3xl mt-6 p-6 bg-gray-800 border border-gray-700 rounded-2xl shadow-lg animate-fadeIn">
      <h2 className="text-3xl font-bold text-white mb-4">Análise do Documento</h2>
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-indigo-400 mb-2">Categoria Identificada</h3>
        <p className="text-lg text-gray-200 bg-gray-700 px-4 py-2 rounded-lg">{categoria}</p>
      </div>
      <div>
        <h3 className="text-xl font-semibold text-indigo-400 mb-3">Metadados Extraídos</h3>
        <div className="space-y-3 text-gray-300">
          {/* Renderiza o componente de detalhe escolhido pela função */}
          {renderizarDetalhes()}
          
          {/* Renderiza o resumo geral da IA (se existir) no final de todos os cards. */}
          {metadados?.resumo_geral_ia && (
            <p className="mt-4 pt-3 border-t border-gray-600">
              <strong className="text-indigo-400">Resumo (IA):</strong> {metadados.resumo_geral_ia}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoDocumento;