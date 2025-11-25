import { renderField } from '../../../utils/renderUtils';

/**
 * Componente React para exibir os metadados específicos
 * de um documento do tipo "Certificado".
 */
const InfoCertificado = ({ metadados }) => {
  // Retorna uma mensagem padrão se não houver metadados.
  if (!metadados) return <p className="text-gray-500">Nenhum metadado extraído.</p>;

  const {
    instituicao, aluno, certificacao, assinaturas, autenticidade, observacoes
  } = metadados;

  return (
    // Renderiza os campos de metadados usando um utilitário.
    <div className="space-y-3 text-sm">
      {renderField('Instituição', instituicao)}
      {renderField('Aluno/Participante', aluno)}
      {renderField('Certificação', certificacao)}
      {renderField('Assinaturas', assinaturas)}
      {renderField('Autenticidade', autenticidade)}
      {renderField('Observações', observacoes)}
    </div>
  );
};

export default InfoCertificado;