import { renderField } from '../../../utils/renderUtils';

/**
 * Componente React para exibir metadados genéricos de um
 * Documento Educacional não classificado especificamente.
 */
const InfoDocEducacionalGenerico = ({ metadados }) => {
  // Retorna uma mensagem padrão se não houver metadados.
  if (!metadados) return <p className="text-gray-500">Nenhum metadado extraído.</p>;

  const { descricao_detectada, dados_identificados } = metadados;

  return (
    <div className="space-y-3 text-sm">
      {/* Exibe a descrição detectada pela IA */}
      {renderField('Descrição Detectada', descricao_detectada)}
      {/* Exibe outros dados identificados pela IA */}
      {renderField('Dados Identificados', dados_identificados)}
    </div>
  );
};

export default InfoDocEducacionalGenerico;