import { renderField, formatDate } from '../../../utils/renderUtils';

// Exibe metadados específicos de documentos do tipo Histórico Escolar
const InfoHistoricoEscolar = ({ metadados }) => {
  if (!metadados) return <p className="text-gray-500">Nenhum metadado extraído.</p>;

  const {
    instituicao, aluno, data_emissao, disciplinas, resumo_final,
    assinaturas, autenticidade, observacoes
  } = metadados;

  return (
    <div className="space-y-3 text-sm">
      {renderField('Instituição', instituicao)}
      {renderField('Aluno', aluno)}
      {renderField('Data Emissão', formatDate(data_emissao))}
      {renderField('Disciplinas', disciplinas)}
      {renderField('Resumo Final', resumo_final)}
      {renderField('Assinaturas', assinaturas)}
      {renderField('Autenticidade', autenticidade)}
      {renderField('Observações', observacoes)}
    </div>
  );
};

export default InfoHistoricoEscolar;