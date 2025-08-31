// Importa os serviços do S3 e DynamoDB para apagar o arquivo e seus metadados.
import { apagarDoS3 } from '../services/s3Service.js';
import { apagarMetadados } from '../services/dynamoDbService.js';

/**
 * Controller para apagar um ou mais documentos, o que inclui remover o
 * arquivo do S3 e seus metadados correspondentes do DynamoDB.
 * * @param {object} req - O objeto de requisição do Express, com a lista de documentos no corpo.
 * @param {object} res - O objeto de resposta do Express.
 */
export const apagarDocumentoController = async (req, res) => {
    // Extrai a lista de documentos a serem apagados do corpo da requisição.
    const { documentos } = req.body;

    // Valida se a lista de documentos é válida e não está vazia.
    if (!documentos || !Array.isArray(documentos) || documentos.length === 0) {
        return res.status(400).json({ erro: 'Nenhum documento selecionado para apagar.' });
    }

    try {
        // Cria um array de promessas para apagar cada documento em paralelo.
        const promessasDeExclusao = documentos.map(doc => {
            if (doc.bucketName && doc.s3Key && doc.doc_uuid) {
                // Para cada documento, apaga do S3 e do DynamoDB.
                return Promise.all([
                    apagarDoS3(doc.bucketName, doc.s3Key),
                    apagarMetadados(doc.doc_uuid)
                ]);
            }
            return Promise.resolve(); // Resolve promessas para documentos inválidos.
        });

        // Aguarda a conclusão de todas as promessas de exclusão.
        await Promise.all(promessasDeExclusao);
        // Retorna uma mensagem de sucesso.
        res.status(200).json({ mensagem: 'Documentos selecionados foram apagados com sucesso.' });
    } catch (error) {
        // Em caso de erro, registra o problema e retorna uma resposta de erro 500.
        console.error(`Erro no controller de exclusão em lote:`, error);
        res.status(500).json({ erro: 'Erro ao apagar os documentos.' });
    }
};