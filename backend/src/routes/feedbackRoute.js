import express from 'express';
import { 
  submitFeedbackController, 
  getFeedbackAggregateController,
  checkUserFeedbackController 
} from '../controllers/feedbackController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   - name: Feedback
 *     description: Avaliação da qualidade da IA pelos usuários
 */

/**
 * @swagger
 * /api/feedback:
 *   post:
 *     summary: Envia nota (1-5) para uma categorização
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - doc_uuid
 *               - rating
 *             properties:
 *               doc_uuid:
 *                 type: string
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       201:
 *         description: Feedback registrado
 *       409:
 *         description: Usuário já avaliou este documento
 */
router.post('/', protect, submitFeedbackController);

/**
 * @swagger
 * /api/feedback/check/{doc_uuid}:
 *   get:
 *     summary: Verifica se usuário já avaliou o documento
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doc_uuid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 hasVoted:
 *                   type: boolean
 */
router.get('/check/:doc_uuid', protect, checkUserFeedbackController);

/**
 * @swagger
 * /api/feedback/{doc_uuid}:
 *   get:
 *     summary: Retorna nota agregada do documento (Admin)
 *     tags: [Feedback]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doc_uuid
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Dados do feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 rating:
 *                   type: integer
 *                 total:
 *                   type: integer
 */
router.get('/:doc_uuid', protect, admin, getFeedbackAggregateController);

export default router;
