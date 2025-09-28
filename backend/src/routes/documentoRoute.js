import express from 'express';
import multer from 'multer';
import { categorizarComArquivo } from '../controllers/documentoController.js';
import { buscarDocumentosController } from '../controllers/buscaController.js';
import { downloadDocumentoController } from '../controllers/downloadController.js';
import { apagarDocumentoController } from '../controllers/deleteController.js';
import { listarCategoriasController } from '../controllers/categoriaController.js';
import { protect, admin } from '../middleware/authMiddleware.js'; 

const router = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

// --- DEFINIÇÃO DAS ROTAS CORRIGIDAS ---

// Rota para analisar um novo documento. Acessível por qualquer usuário logado.
router.post('/categorizar-com-arquivo', protect, upload.single('arquivo'), categorizarComArquivo);

// Rota para buscar documentos. Acessível por qualquer usuário logado.
// A lógica de quem vê o quê será tratada no controller.
router.get('/buscar', protect, buscarDocumentosController);

// Rota para gerar um link de download. Acessível por qualquer usuário logado.
router.get('/download', protect, downloadDocumentoController);

// Rota para apagar documentos. Apenas para administradores.
router.delete('/apagar', protect, admin, apagarDocumentoController);

// Rota para listar todas as categorias do sistema. Apenas para administradores.
router.get('/categorias', protect, admin, listarCategoriasController);

export default router;