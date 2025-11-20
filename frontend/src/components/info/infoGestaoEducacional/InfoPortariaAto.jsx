import { renderField } from '../../../utils/renderUtils';

// Exibe metadados específicos de documentos do tipo Portaria ou Ato
const InfoPortariaAto = ({ metadados }) => {
  if (!metadados) return <p className="text-gray-500">Nenhum metadado extraído.</p>;

  const {
    identificacao_ato, instituicao, autoridade_expeditora, fundamentacao_legal,
    finalidade_objetivos, dispositivos_principais, vigencia_temporal,
    publicacao_divulgacao, normas_referenciadas, revogacao_alteracao,
    autenticidade, observacoes
  } = metadados;

  return (
    <div className="space-y-3 text-sm">
      {renderField('Identificação do Ato', identificacao_ato)}
      {renderField('Instituição', instituicao)}
      {renderField('Autoridade Expedidora', autoridade_expeditora)}
      {renderField('Fundamentação Legal', fundamentacao_legal)}
      {renderField('Finalidade/Objetivos', finalidade_objetivos)}
      {renderField('Dispositivos Principais', dispositivos_principais)}
      {renderField('Vigência Temporal', vigencia_temporal)}
      {renderField('Publicação/Divulgação', publicacao_divulgacao)}
      {renderField('Normas Referenciadas', normas_referenciadas)}
      {renderField('Revogação/Alteração', revogacao_alteracao)}
      {renderField('Autenticidade', autenticidade)}
      {renderField('Observações', observacoes)}
    </div>
  );
};

export default InfoPortariaAto;