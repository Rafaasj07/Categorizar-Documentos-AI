import { renderField } from '../../../utils/renderUtils';

// Exibe metadados específicos de documentos do tipo Certificado
const InfoCertificado = ({ metadados }) => {
  if (!metadados) return <p className="text-gray-500">Nenhum metadado extraído.</p>;

  const {
    instituicao, aluno, certificacao, assinaturas, autenticidade, observacoes
  } = metadados;

  return (
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