import { renderField, formatDateTime } from '../../utils/renderUtils';

/**
 * Componente React para exibir os metadados específicos
 * de um documento do tipo "Nota Fiscal".
 */
const InfoNotaFiscal = ({ metadados }) => {
  // Retorna uma mensagem padrão se não houver metadados.
  if (!metadados) return <p className="text-gray-500">Nenhum metadado extraído.</p>;

  // Desestrutura os metadados em grupos para facilitar a renderização.
  const { emitente, destinatario, valores_totais, itens, transporte, cobranca, informacoes_adicionais, ...restantes } = metadados;

  return (
    <div className="space-y-3 text-sm">
      {renderField('Tipo Documento', restantes.tipo_documento)}
      {renderField('Chave de Acesso', restantes.chave_acesso)}
      {renderField('Número NF', restantes.numero_nf)}
      {renderField('Série', restantes.serie_nf)}
      {/* Formata datas usando o utilitário */}
      {renderField('Data Emissão', formatDateTime(restantes.data_emissao))}
      {renderField('Data Saída/Entrada', formatDateTime(restantes.data_saida_entrada))}
      {renderField('Natureza Operação', restantes.natureza_operacao)}
      {renderField('Valor Total NF', valores_totais?.total_nf)}

      {/* Renderiza objetos complexos (Emitente/Destinatário) */}
      {renderField('Emitente', emitente)}
      {renderField('Destinatário', destinatario)}

      {/* Renderiza a lista de itens dentro de um <details> expansível */}
      {itens && Array.isArray(itens) && itens.length > 0 && (
        <details className="bg-gray-700 p-2 rounded mt-2 text-xs">
          <summary className="cursor-pointer font-semibold text-indigo-300 text-sm">
            Itens ({itens.length})
          </summary>
          <div className="pt-2 pl-4 max-h-40 overflow-y-auto">
            {/* Mapeia cada item para seus campos principais */}
            {itens.map((item, index) => (
              <div key={index} className="mb-2 pb-2 border-b border-gray-600 last:border-b-0">
                {renderField(`Item ${item.numero_item || index + 1}`, item.descricao)}
                {renderField('Qtd', item.quantidade_comercial)}
                {renderField('V. Unit', item.valor_unitario_comercial)}
                {renderField('V. Total', item.valor_total_bruto)}
              </div>
            ))}
          </div>
        </details>
      )}

      {renderField('Transporte', transporte)}
      {renderField('Cobranca', cobranca)}
      {renderField('Informações Adicionais', informacoes_adicionais)}

      {/* Renderiza dinamicamente campos que não foram tratados acima */}
      {Object.entries(restantes)
          .filter(([key]) => ![
              'tipo_documento', 'chave_acesso', 'numero_nf', 'serie_nf',
              'data_emissao', 'data_saida_entrada', 'natureza_operacao'
          ].includes(key)) // Evita duplicar campos já renderizados
          .map(([key, value]) => renderField(key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), value))
      }
    </div>
  );
};

export default InfoNotaFiscal;