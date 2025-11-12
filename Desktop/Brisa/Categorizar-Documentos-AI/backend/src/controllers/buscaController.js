import { buscarDocumentos } from '../services/mongoDbService.js';

// Função que lida com a rota de busca.
export const buscarDocumentosController = async (req, res) => {
    try {
        // Pega os filtros (termo, categoria, etc.) da URL da requisição.
        const { termo, categoria, sortOrder, limit, nextToken } = req.query;

        // Chama a função que executa a busca no banco de dados com os filtros.
        const { documentos, nextToken: newNextToken } = await buscarDocumentos(
            req.user, 
            termo,
            categoria,
            sortOrder,
            parseInt(limit, 10) || 10,
            nextToken
        );


        // Retorna os documentos encontrados e o token para a próxima página.
        res.json({
            documentos,
            nextToken: newNextToken
        });
    } catch (error) {
        // Em caso de erro, retorna uma resposta de falha.
        console.error(`Erro no controller de busca:`, error);
        res.status(500).json({ erro: 'Erro ao buscar os documentos.' });
    }
};