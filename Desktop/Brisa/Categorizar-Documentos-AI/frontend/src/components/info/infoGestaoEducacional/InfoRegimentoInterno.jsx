import { renderField, formatDate } from '../../../utils/renderUtils';

/**
 * Componente React para exibir os metadados específicos
 * de um documento do tipo "Regimento Interno".
 */
const InfoRegimentoInterno = ({ metadados }) => {
    // Retorna uma mensagem padrão se não houver metadados.
    if (!metadados) return <p className="text-gray-500">Nenhum metadado extraído.</p>;

    const {
        instituicao, versao, estrutura_organizacional, disposicoes_preliminares,
        direitos_e_deveres, regime_disciplinar, gestao_academica, gestao_administrativa,
        normas_referenciadas, data_aprovacao, autoridade_aprovacao, autenticidade, observacoes
    } = metadados;

    return (
        // Renderiza os campos de metadados usando um utilitário.
        <div className="space-y-3 text-sm">
            {renderField('Instituição', instituicao)}
            {renderField('Versão', versao)}
            {renderField('Estrutura Organizacional', estrutura_organizacional)}
            {renderField('Disposições Preliminares', disposicoes_preliminares)}
            {renderField('Direitos e Deveres', direitos_e_deveres)}
            {renderField('Regime Disciplinar', regime_disciplinar)}
            {renderField('Gestão Acadêmica', gestao_academica)}
            {renderField('Gestão Administrativa', gestao_administrativa)}
            {renderField('Normas Referenciadas', normas_referenciadas)}
            {renderField('Data Aprovação', formatDate(data_aprovacao))}
            {renderField('Autoridade Aprovação', autoridade_aprovacao)}
            {renderField('Autenticidade', autenticidade)}
            {renderField('Observações', observacoes)}
        </div>
    );
};

export default InfoRegimentoInterno;