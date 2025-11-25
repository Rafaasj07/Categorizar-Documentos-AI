import { renderField } from '../../utils/renderUtils';

/**
 * Helper function para renderizar um array de palavras-chave
 * como tags (badges) formatadas.
 */
const renderKeywords = (keywords) => {
  // Validação para não renderizar nada se as keywords forem nulas, indefinidas ou vazias.
  if (keywords === null || keywords === undefined || keywords === 'null' || (Array.isArray(keywords) && keywords.length === 0)) {
      return null;
  }
  // Garante que o input seja um array e filtra itens vazios.
  const keywordList = Array.isArray(keywords) ? keywords : [String(keywords)];
  const validKeywords = keywordList.filter(kw => kw && String(kw).trim());

  if (validKeywords.length === 0) return null;

  return (
    <div className="mb-2">
      <strong className="text-indigo-400 block">Palavras-Chave:</strong>
      <div className="flex flex-wrap gap-2 mt-1">
        {/* Mapeia as keywords válidas para criar os spans (tags) */}
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

/**
 * Componente React de "fallback" para exibir metadados
 * de documentos com categorias não mapeadas (Padrão).
 */
const InfoPadrao = ({ metadados }) => {
  // Retorna uma mensagem padrão se não houver metadados.
  if (!metadados) return <p className="text-gray-500">Nenhum metadado extraído.</p>;

  return (
    // Renderiza os campos de metadados padrão (título, autor, etc.).
    <div className="space-y-1 text-sm">
      {renderField('Título', metadados.titulo)}
      {renderField('Autor', metadados.autor)}
      {renderField('Data', metadados.data)}
      {/* Utiliza o helper para renderizar as palavras-chave */}
      {renderKeywords(metadados.palavrasChave)}
      {renderField('Resumo Detalhado', metadados.resumo)}
    </div>
  );
};

export default InfoPadrao;