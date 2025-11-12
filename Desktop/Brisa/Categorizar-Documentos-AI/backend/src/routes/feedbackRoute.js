import express from 'express';
import { 
    submitFeedbackController, 
    getFeedbackAggregateController,
    checkUserFeedbackController 
} from '../controllers/feedbackController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Rota para um usuário logado submeter um novo feedback.
router.post('/', protect, submitFeedbackController);

// Rota para verificar se o usuário já enviou feedback para um documento.
router.get('/check/:doc_uuid', protect, checkUserFeedbackController);

// Rota para o admin buscar o feedback (único) de um documento específico.
router.get('/:doc_uuid', protect, admin, getFeedbackAggregateController);

export default router;