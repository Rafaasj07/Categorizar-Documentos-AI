// Formata uma string de data ISO (ou nula) para o padrão DD/MM/AAAA.
export const formatDate = (dateString) => {
    if (!dateString || dateString === 'null') return null;
    try {
        const datePart = dateString.split('T')[0];
        const parts = datePart.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts;
            // Validação básica para garantir que a data parece razoável.
            if (year && month && day && parseInt(year) > 1900 && parseInt(month) >= 1 && parseInt(month) <= 12 && parseInt(day) >= 1 && parseInt(day) <= 31) {
                return `${day}/${month}/${year}`;
            }
        }
        return dateString; // Retorna original se a formatação falhar.
    } catch (e) {
        return dateString; 
    }
}

// Formata uma string ISO para DD/MM/AAAA HH:mm, reutilizando formatDate.
export const formatDateTime = (dateTimeString) => {
    if (!dateTimeString || dateTimeString === 'null') return null;
    try {
        // Formata a parte da data.
        const datePart = formatDate(dateTimeString);
        if (!datePart || datePart === dateTimeString) return dateTimeString;
        // Extrai a parte do tempo (HH:mm).
        const timePart = dateTimeString.split('T')[1]?.substring(0, 5); 
        return timePart ? `${datePart} ${timePart}` : datePart;
    } catch (e) {
        return dateTimeString; 
    }
}

// Prepara um valor simples para exibição, substituindo underscores longos por [...].
const renderSimpleValue = (value) => {
    let displayValue = String(value);
    const placeholderRegex = /_{3,}/g; 
    displayValue = displayValue.replace(placeholderRegex, '[...]');
    return displayValue;
};

/**
 * Verifica recursivamente se um valor (objeto, array ou string) está "efetivamente vazio",
 * ou seja, se contém apenas null, undefined, '', 'null', [] ou {} aninhados.
 */
const isEffectivelyEmpty = (value) => {
    // Caso base: valores primitivos considerados vazios.
    if (value === null || value === undefined || value === '' || value === 'null') {
        return true;
    }
    // Caso recursivo: Arrays.
    if (Array.isArray(value)) {
        // Verifica se o array está vazio ou se *todos* os seus itens são recursivamente vazios.
        return value.length === 0 || value.every(isEffectivelyEmpty);
    }
    // Caso recursivo: Objetos.
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        // Verifica se o objeto está vazio ou se *todos* os seus valores são recursivamente vazios.
        return keys.length === 0 || keys.every(key => isEffectivelyEmpty(value[key]));
    }
    // Outros tipos (números, booleanos) não são vazios.
    return false;
};

/**
 * Renderiza recursivamente um campo (label/value) em JSX.
 * Oculta campos "efetivamente vazios".
 * Formata objetos e arrays como seções/listas aninhadas.
 * @returns {JSX.Element | null} O elemento JSX formatado ou null.
 */
export const renderField = (label, value, baseKey = '') => {
    // 1. Condição de parada: Não renderiza nada se o valor for nulo, '', [], ou {}.
    if (isEffectivelyEmpty(value)) {
        return null; 
    }

    const elementKey = `${baseKey}-${label.replace(/\s+/g, '-')}`;

    // 2. Renderização para OBJETOS (formata como um "tópico" aninhado).
    if (typeof value === 'object' && !Array.isArray(value)) {
        // Filtra propriedades internas que também são vazias.
        const validEntries = Object.entries(value).filter(([, val]) => !isEffectivelyEmpty(val));

        return (
            <div key={elementKey} className="mb-2 pl-4 border-l-2 border-gray-600">
                <strong className="text-lg font-semibold text-indigo-300 block mb-1">{label}:</strong>
                {/* Chama recursivamente para renderizar os campos filhos. */}
                {validEntries.map(([key, val]) => {
                    const childLabel = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                    return renderField(childLabel, val, elementKey);
                })}
            </div>
        );
    }

    // 3. Renderização para ARRAYS (formata como lista).
    if (Array.isArray(value)) {
         // Tratamento especial para o array 'Signatarios' (se tiver a estrutura esperada).
         if (label === 'Signatarios' && value.length > 0 && typeof value[0] === 'object' && 'nome' in value[0]) {
            return (
                <div key={elementKey} className="mb-2">
                    <strong className="text-lg font-semibold text-indigo-300 block mb-1">{label}:</strong>
                    <ul className="list-disc list-inside ml-4 text-sm">
                        {value.map((item, index) => ( 
                            !isEffectivelyEmpty(item) && (
                            <li key={`${elementKey}-${index}`} className="break-words">
                                {item.nome || 'N/A'} ({item.cargo || 'Cargo N/A'})
                                {/* Formata a data da assinatura se existir */}
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
                <strong className="text-lg font-semibold text-indigo-300 block mb-1">{label}:</strong>
                <ul className="list-disc list-inside ml-4 text-sm">
                    {value.map((item, index) => ( // Mapeia apenas itens não vazios
                        !isEffectivelyEmpty(item) && (
                            <li key={`${elementKey}-${index}`} className="break-words">
                                {/* Formata itens de objeto (se houver) ou valores simples. */}
                                {typeof item === 'object' && item !== null
                                ? Object.entries(item)
                                    .filter(([,val]) => !isEffectivelyEmpty(val)) // Filtra props internas vazias
                                    .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${renderSimpleValue(v)}`)
                                    .join('; ') || '[Objeto Vazio]'
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
        <p key={elementKey} className="mb-1 break-words">
            <strong className="text-indigo-400">{label}:</strong>
            {' '}{renderSimpleValue(value)}
        </p>
    );
};