import { renderField, formatDate } from '../../../utils/renderUtils';

/**
 * Componente React para exibir os metadados específicos
 * de um documento do tipo "Plano de Ensino".
 */
const InfoPlanoEnsino = ({ metadados }) => {
  // Retorna uma mensagem padrão se não houver metadados.
  if (!metadados) return <p className="text-gray-500">Nenhum metadado extraído.</p>;

  const {
    instituicao, disciplina, docente_responsavel, ementa, objetivos_gerais,
    objetivos_especificos, competencias_habilidades, conteudos_programaticos,
    metodologia, criterios_avaliacao, instrumentos_avaliacao, bibliografia_basica,
    bibliografia_complementar, data_aprovacao, coordenacao, autenticidade, observacoes
  } = metadados;

  return (
    // Renderiza os campos de metadados usando um utilitário.
    <div className="space-y-3 text-sm">
      {renderField('Instituição', instituicao)}
      {renderField('Disciplina', disciplina)}
      {renderField('Docente Responsável', docente_responsavel)}
      {renderField('Ementa', ementa)}
      {renderField('Objetivos Gerais', objetivos_gerais)}
      {renderField('Objetivos Específicos', objetivos_especificos)}
      {renderField('Competências e Habilidades', competencias_habilidades)}
      {renderField('Conteúdos Programáticos', conteudos_programaticos)}
      {renderField('Metodologia', metodologia)}
      {renderField('Critérios de Avaliação', criterios_avaliacao)}
      {renderField('Instrumentos de Avaliação', instrumentos_avaliacao)}
      {renderField('Bibliografia Básica', bibliografia_basica)}
      {renderField('Bibliografia Complementar', bibliografia_complementar)}
      {renderField('Data Aprovação', formatDate(data_aprovacao))}
      {renderField('Coordenação', coordenacao)}
      {renderField('Autenticidade', autenticidade)}
      {renderField('Observações', observacoes)}
    </div>
  );
};

export default InfoPlanoEnsino;