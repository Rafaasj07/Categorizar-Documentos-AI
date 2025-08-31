// Importa o serviço do DynamoDB para realizar a busca de documentos.
import { buscarDocumentos } from '../services/dynamoDbService.js';

/**
 * Controller para buscar documentos no banco de dados com base em filtros
 * como termo de busca, categoria, ordenação e paginação.
 * * @param {object} req - O objeto de requisição do Express, contendo os parâmetros de busca na query.
 * @param {object} res - O objeto de resposta do Express.
 */
export const buscarDocumentosController = async (req, res) => {
    try {
        // Extrai os parâmetros da query da requisição.
        const { termo, categoria, sortOrder, limit, nextToken } = req.query;
        
        // Decodifica o 'nextToken' de base64 para obter o ponto de partida para a paginação.
        const exclusiveStartKey = nextToken ? JSON.parse(Buffer.from(nextToken, 'base64').toString('utf-8')) : null;
        
        // Converte o limite de resultados para número, com um padrão de 10.
        const limitNumber = limit ? parseInt(limit, 10) : 10;

        // Chama o serviço de busca com os parâmetros fornecidos.
        const { documentos, lastEvaluatedKey } = await buscarDocumentos(
            termo,
            categoria,
            sortOrder,
            limitNumber,
            exclusiveStartKey
        );

        // Codifica o 'lastEvaluatedKey' em base64 para ser usado como 'nextToken' na próxima página.
        const nextTokenString = lastEvaluatedKey
            ? Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64')
            : null;

        // Retorna os documentos encontrados e o token para a próxima página.
        res.json({
            documentos,
            nextToken: nextTokenString
        });
    } catch (error) {
        // Em caso de erro, registra o problema e retorna uma resposta de erro 500.
        console.error(`Erro no controller de busca:`, error);
        res.status(500).json({ erro: 'Erro ao buscar os documentos.' });
    }
};