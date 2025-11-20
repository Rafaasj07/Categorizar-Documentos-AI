import { renderField, formatDate } from '../../../utils/renderUtils';

// Exibe metadados específicos de documentos de Registro de Matrícula
const InfoRegistroMatricula = ({ metadados }) => {
  if (!metadados) return <p className="text-gray-500">Nenhum metadado extraído.</p>;

  const {
    instituicao, estudante, matricula, disciplinas_matriculadas, financeiro,
    documentacao_apresentada, historico_academico, responsavel_legal,
    data_emissao, secretaria_academica, autenticidade, observacoes
  } = metadados;

  return (
    <div className="space-y-3 text-sm">
      {renderField('Instituição', instituicao)}
      {renderField('Estudante', estudante)}
      {renderField('Matrícula', matricula)}
      {renderField('Disciplinas Matriculadas', disciplinas_matriculadas)}
      {renderField('Financeiro', financeiro)}
      {renderField('Documentação Apresentada', documentacao_apresentada)}
      {renderField('Histórico Acadêmico Anterior', historico_academico)}
      {renderField('Responsável Legal', responsavel_legal)}
      {renderField('Data Emissão Doc.', formatDate(data_emissao))}
      {renderField('Secretaria Acadêmica', secretaria_academica)}
      {renderField('Autenticidade', autenticidade)}
      {renderField('Observações', observacoes)}
    </div>
  );
};

export default InfoRegistroMatricula;