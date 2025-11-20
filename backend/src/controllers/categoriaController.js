import { listarCategoriasUnicas } from '../services/mongoDbService.js';

// Retorna lista de categorias únicas disponíveis via serviço
export const listarCategoriasController = async (req, res) => {
    try {
        // Obtém categorias únicas do banco de dados
        const categorias = await listarCategoriasUnicas();
        res.json(categorias);
    } catch (error) {
        console.error(`Erro no controller de categorias:`, error);
        res.status(500).json({ erro: 'Erro ao listar as categorias.' });
    }
};