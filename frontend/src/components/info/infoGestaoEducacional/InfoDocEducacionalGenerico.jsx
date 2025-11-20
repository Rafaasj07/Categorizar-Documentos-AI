import { renderField } from '../../../utils/renderUtils';

// Exibe metadados genéricos para documentos educacionais não classificados
const InfoDocEducacionalGenerico = ({ metadados }) => {
  if (!metadados) return <p className="text-gray-500">Nenhum metadado extraído.</p>;

  const { descricao_detectada, dados_identificados } = metadados;

  return (
    <div className="space-y-3 text-sm">
      {renderField('Descrição Detectada', descricao_detectada)}
      {renderField('Dados Identificados', dados_identificados)}
    </div>
  );
};

export default InfoDocEducacionalGenerico;