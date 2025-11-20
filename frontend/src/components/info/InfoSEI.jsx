import { renderField, formatDate } from '../../utils/renderUtils';

// Exibe metadados específicos de documentos SEI, incluindo validação de autenticidade
const InfoSEI = ({ metadados }) => {
  if (!metadados) return <p className="text-gray-500">Nenhum metadado extraído.</p>;

  const { tipo_documento_sei, signatarios, url_verificacao, codigo_verificador, codigo_crc, ...resto } = metadados;

  // Verifica se existem dados suficientes para renderizar o bloco de autenticidade
  const hasAutenticidade = url_verificacao || codigo_verificador || codigo_crc;

  return (
    <div className="space-y-3 text-sm">
      {renderField('Tipo Documento SEI', tipo_documento_sei)}
      {renderField('Número Documento', resto.numero_documento)}
      {renderField('Número SEI', resto.numero_sei)}
      {renderField('Processo SEI', resto.numero_processo_sei)}
      {renderField('Órgão Emissor', resto.orgao_emissor)}
      {renderField('Data Documento', formatDate(resto.data_documento))}
      {renderField('Destinatário', resto.destinatario)}
      {renderField('Interessado', resto.interessado)}
      {renderField('Assunto', resto.assunto)}
      {renderField('Signatarios', signatarios)}
      {renderField('Referência', resto.referencia)}

      {hasAutenticidade && (
          <div className="mt-2 pt-2 border-t border-gray-600">
              <strong className="text-indigo-400 block mb-1">Autenticidade:</strong>
              {/* Renderiza link de verificação apenas se a URL for válida e segura */}
              {url_verificacao && url_verificacao !== 'null' && url_verificacao.startsWith('http') ? (
                  <p className="mb-1 break-words">
                      <strong className="text-gray-400">Verificação:</strong>
                      <a href={url_verificacao} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline ml-1">
                          Verificar Online
                      </a>
                  </p>
              ) : null}
              {renderField('Cód. Verificador', codigo_verificador)}
              {renderField('Código CRC', codigo_crc)}
          </div>
      )}
    </div>
  );
};

export default InfoSEI;