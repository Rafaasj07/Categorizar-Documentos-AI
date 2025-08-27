// Exibe dados do documento analisado
const InfoDocumento = ({ info }) => {
  // Não renderiza se info inválida ou sem categoria
  if (!info || !info.categoria) {
    return null;
  }

  const { categoria, metadados } = info; // Extrai dados principais

  return (
    <div className="w-full max-w-3xl mt-6 p-6 bg-gray-800 border border-gray-700 rounded-2xl shadow-lg animate-fadeIn">
      {/* Título */}
      <h2 className="text-3xl font-bold text-white mb-2">Análise do Documento</h2>

      {/* Categoria */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-indigo-400 mb-2">Categoria</h3>
        <p className="text-lg text-gray-200 bg-gray-700 px-4 py-2 rounded-lg">{categoria}</p>
      </div>

      {/* Metadados extraídos */}
      <div>
        <h3 className="text-xl font-semibold text-indigo-400 mb-3">Metadados Extraídos</h3>
        <div className="space-y-3 text-gray-300">
          {/* Campos só se presentes */}
          {metadados.titulo && <p><strong>Título:</strong> {metadados.titulo}</p>}
          {metadados.autor && <p><strong>Autor:</strong> {metadados.autor}</p>}
          {metadados.data && <p><strong>Data:</strong> {metadados.data}</p>}

          {/* Palavras-chave como tags */}
          {metadados.palavrasChave && metadados.palavrasChave.length > 0 && (
            <div>
              <strong>Palavras-Chave:</strong>
              <div className="flex flex-wrap gap-2 mt-1">
                {metadados.palavrasChave.map((keyword, index) => (
                  <span
                    key={index}
                    className="bg-gray-600 text-gray-200 text-sm font-medium px-3 py-1 rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Resumo, se houver */}
          {metadados.resumo && <p className="mt-2"><strong>Resumo:</strong> {metadados.resumo}</p>}
        </div>
      </div>
    </div>
  );
};

export default InfoDocumento;
