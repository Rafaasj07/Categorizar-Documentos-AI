import express from 'express'; // Framework para rotas e APIs
import multer from 'multer'; // Middleware para upload de arquivos
import {
    categorizarComArquivo,
    buscarDocumentosController,
    downloadDocumentoController
} from '../controllers/documentoController.js'; // Importa controllers

const router = express.Router(); // Cria instância de rotas
const upload = multer({ storage: multer.memoryStorage() }); // Configura upload em memória

// Rota para envio e categorização de arquivo
router.post('/categorizar-com-arquivo', upload.single('arquivo'), categorizarComArquivo);

// Rota para busca de documentos
router.get('/buscar', buscarDocumentosController);

// Rota para gerar link de download
router.get('/download', downloadDocumentoController);

export default router; // Exporta rotas
