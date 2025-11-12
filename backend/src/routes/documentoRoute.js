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

// Configura o multer para armazenar o arquivo em memória (buffer).
const upload = multer({ storage: multer.memoryStorage() });


// Rota para upload e categorização de um novo documento (requer autenticação).
router.post('/categorizar-com-arquivo', protect, upload.single('arquivo'), categorizarComArquivo);

// Rota para buscar documentos (requer autenticação).
router.get('/buscar', protect, buscarDocumentosController);

// Rota para gerar link de download de um documento (requer autenticação).
router.post('/download', protect, downloadDocumentoController);

// Rota para apagar um documento (requer autenticação e permissão de admin).
router.delete('/apagar', protect, admin, apagarDocumentoController);

// Rota para listar categorias únicas (requer autenticação e permissão de admin).
router.get('/categorias', protect, admin, listarCategoriasController);

// Rota para atualização manual de metadados (requer autenticação e permissão de admin).
router.put('/metadados/:doc_uuid', protect, admin, atualizarMetadadosController);

export default router;