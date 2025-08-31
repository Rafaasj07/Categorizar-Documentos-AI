// Importa o serviço que interage com o DynamoDB para listar as categorias.
import { listarCategoriasUnicas } from '../services/dynamoDbService.js';

/**
 * Controller para buscar e retornar uma lista de todas as categorias únicas
 * de documentos que já foram processados e armazenados no banco de dados.
 * * @param {object} req - O objeto de requisição do Express.
 * @param {object} res - O objeto de resposta do Express.
 */
export const listarCategoriasController = async (req, res) => {
    try {
        // Chama o serviço para obter as categorias únicas do DynamoDB.
        const categorias = await listarCategoriasUnicas();
        // Retorna a lista de categorias em formato JSON.
        res.json(categorias);
    } catch (error) {
        // Em caso de erro, registra o problema no console.
        console.error(`Erro no controller de categorias:`, error);
        // Retorna uma resposta de erro 500 (Erro Interno do Servidor).
        res.status(500).json({ erro: 'Erro ao listar as categorias.' });
    }
};