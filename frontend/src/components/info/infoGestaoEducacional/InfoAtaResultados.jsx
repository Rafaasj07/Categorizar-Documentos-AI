import { renderField } from '../../../utils/renderUtils';

/**
 * Componente React para exibir os metadados específicos
 * de um documento do tipo "Ata de Resultados".
 */
const InfoAtaResultados = ({ metadados }) => {
  // Retorna uma mensagem padrão se não houver metadados.
  if (!metadados) return <p className="text-gray-500">Nenhum metadado extraído.</p>;

  const {
    instituicao, periodo_letivo, reuniao, participantes,
    alunos_resultados, resumo_geral, assinaturas, autenticidade, observacoes
  } = metadados;

  return (
    // Renderiza os campos de metadados usando um utilitário.
    <div className="space-y-3 text-sm">
      {renderField('Instituição', instituicao)}
      {renderField('Período Letivo', periodo_letivo)}
      {renderField('Reunião', reuniao)}
      {renderField('Participantes', participantes)}
      {renderField('Resultados dos Alunos', alunos_resultados)}
      {renderField('Resumo Geral (Ata)', resumo_geral)}
      {renderField('Assinaturas', assinaturas)}
      {renderField('Autenticidade', autenticidade)}
      {renderField('Observações', observacoes)}
    </div>
  );
};

export default InfoAtaResultados;