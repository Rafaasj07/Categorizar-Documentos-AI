/**
 * Formata uma string de data ISO (ou nula) para o padrão DD/MM/AAAA.
 * @returns {string | null} Data formatada ou null.
 */
export const formatDate = (dateString) => {
    if (!dateString || dateString === 'null') return null;
    try {
        // Pega apenas a parte da data (ignora hora/fuso)
        const datePart = dateString.split('T')[0];
        const parts = datePart.split('-');
        
        // Validação básica dos componentes da data
        if (parts.length === 3) {
            const [year, month, day] = parts;
            if (year && month && day && parseInt(year) > 1900 && parseInt(month) >= 1 && parseInt(month) <= 12 && parseInt(day) >= 1 && parseInt(day) <= 31) {
                return `${day}/${month}/${year}`;
            }
        }
        return dateString; // Retorna original se falhar o parse
    } catch (e) {
        return dateString; // Retorna original em caso de erro
    }
}

/**
 * Formata uma string ISO para DD/MM/AAAA HH:mm, reutilizando formatDate.
 * @returns {string | null} Data e hora formatadas ou null.
 */
export const formatDateTime = (dateTimeString) => {
    if (!dateTimeString || dateTimeString === 'null') return null;
    try {
        // Formata a parte da data
        const datePart = formatDate(dateTimeString);
        if (!datePart || datePart === dateTimeString) return dateTimeString;
        
        // Extrai a parte da hora (HH:mm)
        const timePart = dateTimeString.split('T')[1]?.substring(0, 5); 
        
        // Retorna data + hora, ou só data se a hora falhar
        return timePart ? `${datePart} ${timePart}` : datePart;
    } catch (e) {
        return dateTimeString; 
    }
}

// Prepara um valor simples para exibição, substituindo placeholders.
const renderSimpleValue = (value) => {
    let displayValue = String(value);
    // Substitui 3 ou mais underscores por [...]
    const placeholderRegex = /_{3,}/g; 
    displayValue = displayValue.replace(placeholderRegex, '[...]');
    return displayValue;
};

/**
 * Verifica recursivamente se um valor (objeto, array ou string)
 * está "efetivamente vazio" (nulo, '', [], ou objeto/array só com filhos vazios).
 * @returns {boolean} True se estiver vazio.
 */
const isEffectivelyEmpty = (value) => {
    // Casos base de vazio
    if (value === null || value === undefined || value === '' || value === 'null') {
        return true;
    }
    // Caso recursivo: Array
    if (Array.isArray(value)) {
        // Vazio se tiver 0 itens ou se todos os itens forem vazios
        return value.length === 0 || value.every(isEffectivelyEmpty);
    }
    // Caso recursivo: Objeto
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        // Vazio se tiver 0 chaves ou se todos os valores forem vazios
        return keys.length === 0 || keys.every(key => isEffectivelyEmpty(value[key]));
    }
    // Se não for nada disso, não está vazio
    return false;
};

/**
 * Renderiza recursivamente um campo (label/value) em JSX.
 * Oculta campos "efetivamente vazios".
 * @returns {JSX.Element | null} O elemento JSX ou null se estiver vazio.
 */
export const renderField = (label, value, baseKey = '') => {
    // 1. Não renderiza nada se o valor for nulo, '', [], ou {}.
    if (isEffectivelyEmpty(value)) {
        return null; 
    }

    const elementKey = `${baseKey}-${label.replace(/\s+/g, '-')}`;

    // 2. Renderização para OBJETOS (formata como um "tópico" aninhado).
    if (typeof value === 'object' && !Array.isArray(value)) {
        // Filtra chaves que não sejam vazias
        const validEntries = Object.entries(value).filter(([, val]) => !isEffectivelyEmpty(val));

        return (
            <div key={elementKey} className="mb-2">
                {/* Label do objeto (ex: "Emitente:") */}
                <strong className="text-xl font-semibold text-white block mt-4 pt-4 border-t border-gray-700 first:mt-0 first:pt-0 first:border-t-0">
                    {label}:
                </strong>
                {/* Renderização recursiva dos filhos do objeto */}
                <div className="pl-4">
                    {validEntries.map(([key, val]) => {
                        // Formata a chave (ex: "nome_fantasia" -> "Nome Fantasia")
                        const childLabel = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        return renderField(childLabel, val, elementKey);
                    })}
                </div>
            </div>
        );
    }

    // 3. Renderização para ARRAYS (formata como lista).
    if (Array.isArray(value)) {
         // Tratamento especial para "Signatarios" (formatação customizada)
         if (label === 'Signatarios' && value.length > 0 && typeof value[0] === 'object' && 'nome' in value[0]) {
            return (
                <div key={elementKey} className="mb-2">
                    <strong className="text-xl font-semibold text-white block mt-4 pt-4 border-t border-gray-700 first:mt-0 first:pt-0 first:border-t-0">
                        {label}:
                    </strong>
                    <ul className="list-disc list-inside ml-4 text-sm text-gray-200">
                        {value.map((item, index) => ( 
                            !isEffectivelyEmpty(item) && (
                                <li key={`${elementKey}-${index}`} className="break-words mt-1">
                                    {/* Formatação: Nome (Cargo) em Data */}
                                    {item.nome || 'N/A'} ({item.cargo || 'Cargo N/A'})
                                    {item.data_assinatura ? ` em ${formatDateTime(item.data_assinatura)}` : ''}
                                </li>
                            )
                        ))}
                    </ul>
                </div>
            );
         }

        // Tratamento genérico para outros arrays.
        return (
            <div key={elementKey} className="mb-2">
                <strong className="text-xl font-semibold text-white block mt-4 pt-4 border-t border-gray-700 first:mt-0 first:pt-0 first:border-t-0">
                    {label}:
                </strong>
                <ul className="list-disc list-inside ml-4 text-sm text-gray-200">
                    {value.map((item, index) => ( 
                        !isEffectivelyEmpty(item) && (
                            <li key={`${elementKey}-${index}`} className="break-words mt-1">
                                {/* Se o item for um objeto, formata (Chave: Valor; Chave: Valor) */}
                                {typeof item === 'object' && item !== null
                                    ? Object.entries(item)
                                        .filter(([,val]) => !isEffectivelyEmpty(val)) // Filtra vazios
                                        .map(([k, v]) => {
                                            // Formata a chave (ex: "nome_aluno" -> "Nome aluno")
                                            const keyLabel = k.replace(/_/g, ' ');
                                            const capitalizedKeyLabel = keyLabel.charAt(0).toUpperCase() + keyLabel.slice(1);
                                            return `${capitalizedKeyLabel}: ${renderSimpleValue(v)}`;
                                        })
                                        .join('; ') || '[Objeto Vazio]'
                                    // Se for valor simples, apenas renderiza
                                    : renderSimpleValue(item)}
                            </li>
                        )
                    ))}
                </ul>
            </div>
        );
    }

    // 4. Renderização para VALORES SIMPLES (string, número).
    return (
        <p key={elementKey} className="mb-1 break-words text-gray-200">
            <strong className="font-medium text-indigo-400">{label}:</strong>
            {' '}{renderSimpleValue(value)}
        </p>
    );
};

/**
 * Achata um objeto de metadados recursivamente para um formato
 * de array [label, value] compatível com a tabela jsPDF-AutoTable.
 * @returns {Array<Array<string>>} Linhas para a tabela.
 */
export const flattenMetadata = (obj, prefix = '') => {
  let rows = [];
  // Tratamento de fallback se 'obj' não for um objeto (ex: array ou valor)
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
    if (Array.isArray(obj) && obj.length === 0) return [['', '[]']];
    if (Array.isArray(obj)) return [['', obj.join(', ')]];
    return [['', String(obj)]];
  }

  // Itera sobre as chaves do objeto
  Object.entries(obj).forEach(([key, value]) => {
    // Formata o label (ex: "nome_fantasia" -> "Nome Fantasia")
    const label = prefix + key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    // Ignora campos nulos ou vazios no PDF
    if (value === null || value === undefined || value === 'null' || value === '') {
      // Não adiciona a linha
    } else if (typeof value === 'object' && !Array.isArray(value)) {
      // Objeto aninhado (adiciona título e indenta filhos recursivamente)
      rows.push([label, '(Ver sub-itens abaixo)']);
      rows = rows.concat(flattenMetadata(value, prefix + '  ')); // Indenta filhos
    } else if (Array.isArray(value)) {
      // Array
      if (value.length === 0) {
        rows.push([label, '[]']);
      } else if (typeof value[0] === 'object') {
        // Array de objetos (cria sub-seções para cada item)
        rows.push([label, `(Ver ${value.length} item(s) abaixo)`]);
        value.forEach((item, index) => {
          rows.push([`${prefix}  Item ${index + 1}`, '---']);
          rows = rows.concat(flattenMetadata(item, prefix + '    ')); // Indenta filhos do item
        });
      } else {
        // Array de valores simples
        rows.push([label, value.join(', ')]);
      }
    } else {
      // Valor simples (string, número)
      rows.push([label, String(value)]);
    }
  });
  // Remove linhas que possam ter ficado totalmente vazias
  return rows.filter(row => row[0] || row[1]); 
};