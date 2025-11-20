// Converte data ISO para formato DD/MM/AAAA se o ano for válido (>1900)
export const formatDate = (dateString) => {
    if (!dateString || dateString === 'null') return null;
    try {
        const datePart = dateString.split('T')[0];
        const parts = datePart.split('-');
        if (parts.length === 3) {
            const [year, month, day] = parts;
            if (year && month && day && parseInt(year) > 1900) {
                return `${day}/${month}/${year}`;
            }
        }
        return dateString;
    } catch (e) {
        return dateString;
    }
}

// Adiciona hora (HH:mm) à data formatada, se disponível na string original
export const formatDateTime = (dateTimeString) => {
    if (!dateTimeString || dateTimeString === 'null') return null;
    try {
        const datePart = formatDate(dateTimeString);
        if (!datePart || datePart === dateTimeString) return dateTimeString;
        const timePart = dateTimeString.split('T')[1]?.substring(0, 5);
        return timePart ? `${datePart} ${timePart}` : datePart;
    } catch (e) {
        return dateTimeString;
    }
}

// Substitui sequências de sublinhados por indicador visual de texto
const renderSimpleValue = (value) => {
    let displayValue = String(value);
    const placeholderRegex = /_{3,}/g;
    displayValue = displayValue.replace(placeholderRegex, '[...]');
    return displayValue;
};

// Verifica recursivamente se valor (ou seus filhos) é nulo ou vazio
const isEffectivelyEmpty = (value) => {
    if (value === null || value === undefined || value === '' || value === 'null') return true;
    if (Array.isArray(value)) return value.length === 0 || value.every(isEffectivelyEmpty);
    if (typeof value === 'object') {
        const keys = Object.keys(value);
        return keys.length === 0 || keys.every(key => isEffectivelyEmpty(value[key]));
    }
    return false;
};

// Renderiza metadados recursivamente em JSX, tratando objetos e arrays
export const renderField = (label, value, baseKey = '') => {
    if (isEffectivelyEmpty(value)) return null;

    const elementKey = `${baseKey}-${label.replace(/\s+/g, '-')}`;

    // Processa objetos aninhados criando seções visuais separadas
    if (typeof value === 'object' && !Array.isArray(value)) {
        const validEntries = Object.entries(value).filter(([, val]) => !isEffectivelyEmpty(val));
        return (
            <div key={elementKey} className="mb-2">
                <strong className="text-xl font-semibold text-white block mt-4 pt-4 border-t border-gray-700 first:mt-0 first:pt-0 first:border-t-0">
                    {label}:
                </strong>
                <div className="pl-4">
                    {validEntries.map(([key, val]) => {
                        const childLabel = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                        return renderField(childLabel, val, elementKey);
                    })}
                </div>
            </div>
        );
    }

    // Processa arrays, com formatação específica para lista de signatários ou genérica
    if (Array.isArray(value)) {
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
                                    {item.nome || 'N/A'} ({item.cargo || 'Cargo N/A'})
                                    {item.data_assinatura ? ` em ${formatDateTime(item.data_assinatura)}` : ''}
                                </li>
                            )
                        ))}
                    </ul>
                </div>
            );
        }

        return (
            <div key={elementKey} className="mb-2">
                <strong className="text-xl font-semibold text-white block mt-4 pt-4 border-t border-gray-700 first:mt-0 first:pt-0 first:border-t-0">
                    {label}:
                </strong>
                <ul className="list-disc list-inside ml-4 text-sm text-gray-200">
                    {value.map((item, index) => (
                        !isEffectivelyEmpty(item) && (
                            <li key={`${elementKey}-${index}`} className="break-words mt-1">
                                {/* Formata objetos dentro de arrays como strings chave-valor */}
                                {typeof item === 'object' && item !== null
                                    ? Object.entries(item)
                                        .filter(([, val]) => !isEffectivelyEmpty(val))
                                        .map(([k, v]) => {
                                            const keyLabel = k.replace(/_/g, ' ');
                                            const capitalizedKeyLabel = keyLabel.charAt(0).toUpperCase() + keyLabel.slice(1);
                                            return `${capitalizedKeyLabel}: ${renderSimpleValue(v)}`;
                                        })
                                        .join('; ') || '[Objeto Vazio]'
                                    : renderSimpleValue(item)}
                            </li>
                        )
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <p key={elementKey} className="mb-1 break-words text-gray-200">
            <strong className="font-medium text-indigo-400">{label}:</strong>
            {' '}{renderSimpleValue(value)}
        </p>
    );
};

// Transforma estrutura aninhada em array plano para tabelas, limitando itens de array
export const flattenMetadata = (obj, prefix = '') => {
    let rows = [];
    const MAX_ARRAY_ITEMS = 20;

    if (!obj || typeof obj !== 'object' || Array.isArray(obj)) {
        if (Array.isArray(obj) && obj.length === 0) return [['', '[]']];
        if (Array.isArray(obj)) return [['', obj.join(', ')]];
        return [['', String(obj)]];
    }

    // Percorre chaves recursivamente para montar linhas da tabela
    Object.entries(obj).forEach(([key, value]) => {
        const label = prefix + key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        if (value === null || value === undefined || value === 'null' || value === '') {
            // Ignora vazios
        } else if (typeof value === 'object' && !Array.isArray(value)) {
            rows.push([label, '(Ver sub-itens abaixo)']);
            rows = rows.concat(flattenMetadata(value, prefix + '  '));
        } else if (Array.isArray(value)) {
            if (value.length === 0) {
                rows.push([label, '[]']);
            } else if (typeof value[0] === 'object') {
                const totalItems = value.length;
                const itemsToShow = value.slice(0, MAX_ARRAY_ITEMS);

                rows.push([label, `(Ver ${totalItems} item(s)${totalItems > MAX_ARRAY_ITEMS ? ' - Parcial' : ''})`]);

                // Renderiza itens do array até o limite máximo definido
                itemsToShow.forEach((item, index) => {
                    rows.push([`${prefix}  Item ${index + 1}`, '---']);
                    rows = rows.concat(flattenMetadata(item, prefix + '    '));
                });

                if (totalItems > MAX_ARRAY_ITEMS) {
                    rows.push([`${prefix}  ...`, `[Mais ${totalItems - MAX_ARRAY_ITEMS} itens omitidos]`]);
                }

            } else {
                rows.push([label, value.join(', ')]);
            }
        } else {
            rows.push([label, String(value)]);
        }
    });
    return rows.filter(row => row[0] || row[1]);
};