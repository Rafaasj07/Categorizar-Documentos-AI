// Importa o Express para criar rotas
import express from 'express';

// Importa o Multer para lidar com upload de arquivos
import multer from 'multer';

// Importa o controlador que será chamado quando essa rota for acessada
import { categorizarComArquivo } from '../controllers/documentoController.js';

// Cria um roteador do Express
const router = express.Router();

// Configura o Multer para armazenar o arquivo na memória (em vez de salvar no disco)
const upload = multer({ storage: multer.memoryStorage() });

// Define a rota POST '/categorizar-com-arquivo'
// - `upload.single('arquivo')`: espera um único arquivo no campo 'arquivo' do formulário
// - `categorizarComArquivo`: função que será chamada após o upload
router.post('/categorizar-com-arquivo', upload.single('arquivo'), categorizarComArquivo);

// Exporta o roteador para ser usado no app principal
export default router;
