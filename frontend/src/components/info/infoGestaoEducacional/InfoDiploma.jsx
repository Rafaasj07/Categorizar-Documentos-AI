import { renderField, formatDate } from '../../../utils/renderUtils';

// Exibe metadados específicos de documentos do tipo Diploma
const InfoDiploma = ({ metadados }) => {
  if (!metadados) return <p className="text-gray-500">Nenhum metadado extraído.</p>;

  const {
    numero_diploma, processo_mec, instituicao, curso_detalhes, aluno,
    registro, autoridades_assinantes, autenticidade, local_emissao,
    data_emissao, fundamentacao_legal, observacoes
  } = metadados;

  return (
    <div className="space-y-3 text-sm">
      {renderField('Número Diploma', numero_diploma)}
      {renderField('Processo MEC', processo_mec)}
      {renderField('Instituição', instituicao)}
      {renderField('Detalhes do Curso', curso_detalhes)}
      {renderField('Aluno', aluno)}
      {renderField('Registro', registro)}
      {renderField('Autoridades Assinantes', autoridades_assinantes)}
      {renderField('Autenticidade', autenticidade)}
      {renderField('Local Emissão', local_emissao)}
      {renderField('Data Emissão', formatDate(data_emissao))}
      {renderField('Fundamentação Legal', fundamentacao_legal)}
      {renderField('Observações', observacoes)}
    </div>
  );
};

export default InfoDiploma;