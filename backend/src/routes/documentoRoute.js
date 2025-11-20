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

// Rota para upload e categorização de um novo documento.
router.post('/categorizar-com-arquivo', protect, upload.single('arquivo'), categorizarComArquivo);

// Rota para buscar documentos.
router.get('/buscar', protect, buscarDocumentosController);

// Rota para gerar link de download de um documento.
router.post('/download', protect, downloadDocumentoController);

// Rota para apagar um documento (restrito a admin).
router.delete('/apagar', protect, admin, apagarDocumentoController);

// Rota para listar categorias únicas (restrito a admin).
router.get('/categorias', protect, admin, listarCategoriasController);

// Rota para atualização manual de metadados (restrito a admin).
router.put('/metadados/:doc_uuid', protect, admin, atualizarMetadadosController);

export default router;