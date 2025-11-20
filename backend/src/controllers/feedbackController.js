import Feedback from '../models/Feedback.js';
import Documento from '../models/Document.js';

// Registra avaliação verificando propriedade do documento e unicidade
export const submitFeedbackController = async (req, res) => {
    const { doc_uuid, rating } = req.body;
    const userId = req.user.id; 

    if (!doc_uuid || !rating || rating < 1 || rating > 5) {
        return res.status(400).json({ erro: 'Dados de feedback inválidos (doc_uuid e rating 1-5 são obrigatórios).' });
    }

    try {
        const documento = await Documento.findOne({ doc_uuid: doc_uuid });
        if (!documento) {
            return res.status(404).json({ erro: 'Documento não encontrado.' });
        }
        
        // Restringe a avaliação apenas ao proprietário do documento ou administradores
        if (documento.userId !== userId && req.user.role !== 'admin') {
            return res.status(403).json({ erro: 'Você só pode avaliar documentos que você enviou.' });
        }
        
        const novoFeedback = new Feedback({
            doc_uuid,
            userId,
            rating: parseInt(rating, 10),
        });
        
        await novoFeedback.save(); 
        res.status(201).json({ mensagem: 'Feedback registrado com sucesso.' });
    
    } catch (error) {
        // Retorna conflito (409) caso o índice único indique voto duplicado
        if (error.code === 11000) {
            return res.status(409).json({ erro: 'Feedback já foi realizado para este documento.' });
        }
        console.error(`Erro ao salvar feedback:`, error);
        res.status(500).json({ erro: 'Erro interno ao salvar o feedback.' });
    }
};

// Verifica se já existe feedback registrado para o documento
export const checkUserFeedbackController = async (req, res) => {
    const { doc_uuid } = req.params;

    if (!doc_uuid) {
        return res.status(400).json({ erro: 'doc_uuid é obrigatório.' });
    }

    try {
        const existingFeedback = await Feedback.findOne({ doc_uuid });
        res.json({ hasVoted: !!existingFeedback });
    } catch (error) {
        console.error(`Erro ao verificar feedback:`, error);
        res.status(500).json({ erro: 'Erro interno ao verificar o feedback.' });
    }
};


// Recupera os dados de rating do documento retornando padrão se vazio
export const getFeedbackAggregateController = async (req, res) => {
    const { doc_uuid } = req.params;

    if (!doc_uuid) {
        return res.status(400).json({ erro: 'doc_uuid é obrigatório.' });
    }

    try {
        const feedback = await Feedback.findOne({ doc_uuid: doc_uuid }).lean();

        if (!feedback) {
            return res.json({ rating: 0, total: 0 });
        }

        res.json({ 
            rating: feedback.rating, 
            total: 1 
        });

    } catch (error) {
        console.error(`Erro ao buscar feedback:`, error);
        res.status(500).json({ erro: 'Erro interno ao buscar o feedback.' });
    }
};