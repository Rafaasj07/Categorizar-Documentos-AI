import { buscarDocumentos } from '../services/mongoDbService.js';

// Controlador para busca de documentos com filtros e paginação
export const buscarDocumentosController = async (req, res) => {
    try {
        const { termo, categoria, sortOrder, limit, nextToken } = req.query;

        // Consulta serviço de busca aplicando filtros e limite de paginação
        const { documentos, nextToken: newNextToken } = await buscarDocumentos(
            req.user,
            termo,
            categoria,
            sortOrder,
            parseInt(limit, 10) || 10,
            nextToken
        );

        res.json({
            documentos,
            nextToken: newNextToken
        });
    } catch (error) {
        console.error(`Erro no controller de busca:`, error);
        res.status(500).json({ erro: 'Erro ao buscar os documentos.' });
    }
};