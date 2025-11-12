import { listarCategoriasUnicas } from '../services/mongoDbService.js';

// Função que lida com a requisição para listar as categorias.
export const listarCategoriasController = async (req, res) => {
    try {
        // Busca as categorias únicas no banco de dados.
        const categorias = await listarCategoriasUnicas();
        // Retorna a lista de categorias encontradas.
        res.json(categorias);
    } catch (error) {
        // Se ocorrer um erro, informa o problema no console.
        console.error(`Erro no controller de categorias:`, error);
        // Retorna uma resposta de erro para o cliente.
        res.status(500).json({ erro: 'Erro ao listar as categorias.' });
    }
};