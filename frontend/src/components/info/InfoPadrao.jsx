import { renderField } from '../../utils/renderUtils';

// Renderiza visualmente as palavras-chave, validando e filtrando a entrada
const renderKeywords = (keywords) => {
  if (keywords === null || keywords === undefined || keywords === 'null' || (Array.isArray(keywords) && keywords.length === 0)) {
      return null;
  }
  // Garante formato de array e remove strings vazias
  const keywordList = Array.isArray(keywords) ? keywords : [String(keywords)];
  const validKeywords = keywordList.filter(kw => kw && String(kw).trim());

  if (validKeywords.length === 0) return null;

  return (
    <div className="mb-2">
      <strong className="text-indigo-400 block">Palavras-Chave:</strong>
      <div className="flex flex-wrap gap-2 mt-1">
        {/* Gera as tags para cada palavra-chave válida */}
        {validKeywords.map((keyword, index) => (
            <span
              key={index}
              className="bg-gray-600 text-gray-200 text-xs font-medium px-2.5 py-0.5 rounded-full"
            >
              {String(keyword)}
            </span>
        ))}
      </div>
    </div>
  );
};

// Componente de fallback para exibir campos genéricos (título, autor, resumo)
const InfoPadrao = ({ metadados }) => {
  if (!metadados) return <p className="text-gray-500">Nenhum metadado extraído.</p>;

  return (
    <div className="space-y-1 text-sm">
      {renderField('Título', metadados.titulo)}
      {renderField('Autor', metadados.autor)}
      {renderField('Data', metadados.data)}
      {renderKeywords(metadados.palavrasChave)}
      {renderField('Resumo Detalhado', metadados.resumo)}
    </div>
  );
};

export default InfoPadrao;