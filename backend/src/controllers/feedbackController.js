import Feedback from '../models/Feedback.js';
import Documento from '../models/Document.js';

/**
 * Registra um novo feedback (rating) para um documento.
 * O índice único no DB impede votos duplicados por documento.
 */
export const submitFeedbackController = async (req, res) => {
    const { doc_uuid, rating } = req.body;
    const userId = req.user.id; 

    // Valida os dados de entrada obrigatórios.
    if (!doc_uuid || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ erro: 'Dados de feedback inválidos (doc_uuid e rating 1-5 são obrigatórios).' });
    }

    try {
        // Verifica se o documento associado realmente existe.
        const documento = await Documento.findOne({ doc_uuid: doc_uuid });
        if (!documento) {
            return res.status(404).json({ erro: 'Documento não encontrado.' });
        }
        
        // Cria a nova entrada de feedback.
        const novoFeedback = new Feedback({
            doc_uuid,
            userId,
            rating: parseInt(rating, 10),
        });
        
        // Salva o feedback no banco de dados.
        await novoFeedback.save(); 
        res.status(201).json({ mensagem: 'Feedback registrado com sucesso.' });
    
    } catch (error) {
        // Trata erro de índice único (voto duplicado para o doc_uuid).
        if (error.code === 11000) {
            return res.status(409).json({ erro: 'Feedback já foi realizado para este documento.' });
        }
        console.error(`Erro ao salvar feedback:`, error);
        res.status(500).json({ erro: 'Erro interno ao salvar o feedback.' });
    }
};

/**
 * Verifica se já existe ALGUM feedback registrado para um doc_uuid específico.
 * Retorna { hasVoted: true/false }.
 */
export const checkUserFeedbackController = async (req, res) => {
    const { doc_uuid } = req.params;

    if (!doc_uuid) {
        return res.status(400).json({ erro: 'doc_uuid é obrigatório.' });
    }

    try {
        // Procura se existe QUALQUER feedback para este doc_uuid.
        const existingFeedback = await Feedback.findOne({ doc_uuid });
        
        // Retorna true se encontrou algo, false caso contrário.
        res.json({ hasVoted: !!existingFeedback });
    } catch (error) {
        console.error(`Erro ao verificar feedback:`, error);
        res.status(500).json({ erro: 'Erro interno ao verificar o feedback.' });
    }
};


/**
 * Busca o feedback único associado a um documento (para Admin).
 * Retorna o rating e o total (0 ou 1).
 */
export const getFeedbackAggregateController = async (req, res) => {
    const { doc_uuid } = req.params;

    if (!doc_uuid) {
        return res.status(400).json({ erro: 'doc_uuid é obrigatório.' });
    }

    try {
        // Apenas buscamos o feedback único para este documento.
        const feedback = await Feedback.findOne({ doc_uuid: doc_uuid }).lean();

        // Se não houver feedback, retorna 0.
        if (!feedback) {
            return res.json({ 
                rating: 0, 
                total: 0
            });
        }

        // Retorna o rating único encontrado.
        res.json({ 
            rating: feedback.rating, 
            total: 1 
        });

    } catch (error) {
        console.error(`Erro ao buscar feedback:`, error);
        res.status(500).json({ erro: 'Erro interno ao buscar o feedback.' });
    }
};