import express from 'express';
import multer from 'multer';
import {
    categorizarComArquivo,
    atualizarMetadadosController
} from '../controllers/documentoController.js';
import { buscarDocumentosController } from '../controllers/buscaController.js';
import { downloadDocumentoController } from '../controllers/downloadController.js';
import { apagarDocumentoController } from '../controllers/deleteController.js';
import { listarCategoriasController } from '../controllers/categoriaController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

/**
 * @swagger
 * tags:
 *   - name: Documentos
 *     description: Upload, busca e gerenciamento de arquivos PDF
 */

/**
 * @swagger
 * /api/documento/categorizar-com-arquivo:
 *   post:
 *     summary: Envia PDF para análise da IA
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               arquivo:
 *                 type: string
 *                 format: binary
 *               contextoSelecionado:
 *                 type: string
 *                 default: Padrão
 *               subContextoSelecionado:
 *                 type: string
 *               promptUsuario:
 *                 type: string
 *     responses:
 *       200:
 *         description: Documento processado e categorizado
 *       400:
 *         description: Arquivo ausente ou inválido
 */
router.post('/categorizar-com-arquivo', protect, upload.single('arquivo'), categorizarComArquivo);

/**
 * @swagger
 * /api/documento/buscar:
 *   get:
 *     summary: Busca documentos com paginação
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: termo
 *         schema:
 *           type: string
 *         description: Texto para busca nos metadados
 *       - in: query
 *         name: categoria
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Lista de documentos e token de paginação
 */
router.get('/buscar', protect, buscarDocumentosController);

/**
 * @swagger
 * /api/documento/download:
 *   post:
 *     summary: Gera stream de download do arquivo
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - bucketName
 *               - storageKey
 *               - fileName
 *             properties:
 *               bucketName:
 *                 type: string
 *               storageKey:
 *                 type: string
 *               fileName:
 *                 type: string
 *     responses:
 *       200:
 *         description: Arquivo binário (blob)
 */
router.post('/download', protect, downloadDocumentoController);

/**
 * @swagger
 * /api/documento/apagar:
 *   delete:
 *     summary: Remove múltiplos documentos (Admin)
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               documentos:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     doc_uuid:
 *                       type: string
 *                     bucketName:
 *                       type: string
 *                     storageKey:
 *                       type: string
 *     responses:
 *       200:
 *         description: Documentos apagados com sucesso
 *       401:
 *         description: Não autorizado
 */
router.delete('/apagar', protect, admin, apagarDocumentoController);

/**
 * @swagger
 * /api/documento/categorias:
 *   get:
 *     summary: Lista categorias únicas existentes (Admin)
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Array de strings com as categorias
 */
router.get('/categorias', protect, admin, listarCategoriasController);

/**
 * @swagger
 * /api/documento/metadados/{doc_uuid}:
 *   put:
 *     summary: Atualiza manualmente o JSON da IA (Admin)
 *     tags: [Documentos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: doc_uuid
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               novoResultadoIa:
 *                 type: object
 *     responses:
 *       200:
 *         description: Metadados atualizados
 */
router.put('/metadados/:doc_uuid', protect, admin, atualizarMetadadosController);

export default router;
