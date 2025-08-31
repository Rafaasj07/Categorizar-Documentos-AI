import express from 'express';
import multer from 'multer';

// Importa o controller principal de categorização.
import { categorizarComArquivo } from '../controllers/documentoController.js';

// Importa os novos controllers especializados.
import { buscarDocumentosController } from '../controllers/buscaController.js';
import { downloadDocumentoController } from '../controllers/downloadController.js';
import { apagarDocumentoController } from '../controllers/deleteController.js';
import { listarCategoriasController } from '../controllers/categoriaController.js';

const router = express.Router();
// Configura o multer para fazer upload de arquivos em memória.
const upload = multer({ storage: multer.memoryStorage() });

// --- DEFINIÇÃO DAS ROTAS ---

// Rota para categorizar um novo documento.
router.post('/categorizar-com-arquivo', upload.single('arquivo'), categorizarComArquivo);

// Rota para buscar documentos existentes.
router.get('/buscar', buscarDocumentosController);

// Rota para gerar um link de download.
router.get('/download', downloadDocumentoController);

// Rota para apagar documentos.
router.delete('/apagar', apagarDocumentoController);

// Rota para listar todas as categorias únicas.
router.get('/categorias', listarCategoriasController);

export default router;