// Define o componente funcional 'InfoDocumento', que exibe os dados de um documento analisado.
// Ele recebe um objeto 'info' como propriedade, contendo os dados do documento.
const InfoDocumento = ({ info }) => {
  // Se o objeto 'info' não existir ou não tiver uma categoria, o componente não renderiza nada.
  if (!info || !info.categoria) {
    return null;
  }

  // Desestrutura o objeto 'info' para extrair a categoria e os metadados.
  const { categoria, metadados } = info;

  // Retorna a estrutura JSX (HTML) para exibir as informações.
  return (
    // Container principal do componente com estilização do Tailwind CSS.
    <div className="w-full max-w-3xl mt-6 p-6 bg-gray-800 border border-gray-700 rounded-2xl shadow-lg animate-fadeIn">
      {/* Título da seção. */}
      <h2 className="text-3xl font-bold text-white mb-2">Análise do Documento</h2>

      {/* Seção para exibir a categoria do documento. */}
      <div className="mb-6">
        <h3 className="text-xl font-semibold text-indigo-400 mb-2">Categoria</h3>
        <p className="text-lg text-gray-200 bg-gray-700 px-4 py-2 rounded-lg">{categoria}</p>
      </div>

      {/* Seção para exibir os metadados extraídos. */}
      <div>
        <h3 className="text-xl font-semibold text-indigo-400 mb-3">Metadados Extraídos</h3>
        <div className="space-y-3 text-gray-300">
          {/* Renderização condicional: exibe o título apenas se ele existir nos metadados. */}
          {metadados.titulo && <p><strong>Título:</strong> {metadados.titulo}</p>}
          {/* Renderização condicional: exibe o autor apenas se ele existir. */}
          {metadados.autor && <p><strong>Autor:</strong> {metadados.autor}</p>}
          {/* Renderização condicional: exibe a data apenas se ela existir. */}
          {metadados.data && <p><strong>Data:</strong> {metadados.data}</p>}

          {/* Renderização condicional: exibe as palavras-chave apenas se existirem e o array não estiver vazio. */}
          {metadados.palavrasChave && metadados.palavrasChave.length > 0 && (
            <div>
              <strong>Palavras-Chave:</strong>
              {/* Container para as tags de palavras-chave. */}
              <div className="flex flex-wrap gap-2 mt-1">
                {/* Itera sobre o array de palavras-chave e renderiza cada uma como uma 'tag'. */}
                {metadados.palavrasChave.map((keyword, index) => (
                  <span
                    key={index} // Chave única para cada elemento da lista.
                    className="bg-gray-600 text-gray-200 text-sm font-medium px-3 py-1 rounded-full"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Renderização condicional: exibe o resumo apenas se ele existir. */}
          {metadados.resumo && <p className="mt-2"><strong>Resumo:</strong> {metadados.resumo}</p>}
        </div>
      </div>
    </div>
  );
};

// Exporta o componente para que possa ser utilizado em outras partes da aplicação.
export default InfoDocumento;