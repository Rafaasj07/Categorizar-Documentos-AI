import { renderField, formatDate } from '../../utils/renderUtils';

// Exibe metadados específicos de documentos de Cartório
const InfoCartorio = ({ metadados }) => {
  if (!metadados) return <p className="text-gray-500">Nenhum metadado extraído.</p>;

  const { tipo_ato, cartorio_responsavel, partes_envolvidas, dados_imovel, ...resto } = metadados;

  return (
    <div className="space-y-3 text-sm">
      {renderField('Tipo de Ato', tipo_ato)}
      {renderField('Cartório Responsável', cartorio_responsavel)}
      {renderField('Livro', resto.numero_livro)}
      {renderField('Folha', resto.numero_folha)}
      {renderField('Termo/Registro', resto.numero_termo_ou_registro)}
      {renderField('Data do Ato', formatDate(resto.data_ato))}
      {renderField('Data Emissão Doc.', formatDate(resto.data_emissao_documento))}
      {renderField('Partes Envolvidas', partes_envolvidas)}
      {renderField('Objeto Principal', resto.objeto_principal)}
      {renderField('Valor do Negócio', resto.valor_negocio)}
      {renderField('Selo', resto.selo_digital_ou_fisico)}
      {renderField('Dados do Imóvel', dados_imovel)}
      {renderField('Observações/Averbações', resto.observacoes_averbacoes)}
    </div>
  );
};

export default InfoCartorio;