const InfoDocumento = ({ info }) => {
  // Se não houver informações de análise, o componente não renderiza nada.
  if (!info || !info.categoria) {
    return null;
  }

  // Extrai a categoria e os metadados do objeto de informações.
  const { categoria, metadados } = info;

  // Estrutura visual para mostrar os resultados da análise.
  return (
    <div className="w-full max-w-3xl mt-6 p-6 bg-gray-800 border border-gray-700 rounded-2xl shadow-lg animate-fadeIn">
      <h2 className="text-3xl font-bold text-white mb-2">Análise do Documento</h2>

      {/* Seção para exibir a categoria principal do documento. */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-indigo-400 mb-2">Categoria</h3>
        <p className="text-lg text-gray-200 bg-gray-700 px-4 py-2 rounded-lg">{categoria}</p>
      </div>

      {/* Seção para exibir os detalhes extraídos. */}
      <div>
        <h3 className="text-xl font-semibold text-indigo-400 mb-3">Metadados Extraídos</h3>
        <div className="space-y-3 text-gray-300">
          {/* Renderiza cada metadado apenas se ele existir. */}
          {metadados.titulo && <p><strong>Título:</strong> {metadados.titulo}</p>}
          {metadados.autor && <p><strong>Autor:</strong> {metadados.autor}</p>}
          {metadados.data && <p><strong>Data:</strong> {metadados.data}</p>}

          {/* Renderiza a lista de palavras-chave, se houver alguma. */}
          {metadados.palavrasChave && metadados.palavrasChave.length > 0 && (
            <div>
              <strong>Palavras-Chave:</strong>
              <div className="flex flex-wrap gap-2 mt-1">
                {/* Mapeia cada palavra-chave para um elemento visual. */}
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

          {metadados.resumo && <p className="mt-2"><strong>Resumo:</strong> {metadados.resumo}</p>}
        </div>
      </div>
    </div>
  );
};

export default InfoDocumento;