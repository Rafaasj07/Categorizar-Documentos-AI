import { gerarUrlDownloadMinIO } from '../services/minioService.js';

// Função que lida com a requisição para criar um link de download.
export const downloadDocumentoController = async (req, res) => {
    try {
        // Pega o nome do bucket e a chave do arquivo da URL.
        const { bucket, key } = req.query;

        // Verifica se as informações necessárias foram fornecidas.
        if (!bucket || !key) {
            return res.status(400).json({ erro: 'Parâmetros inválidos para o download.' });
        }

        // Gera uma URL de download temporária e segura.
        const downloadUrl = await gerarUrlDownloadMinIO(bucket, key);
        
        // Retorna a URL gerada para o frontend.
        res.json({ downloadUrl });
    } catch (error) {
        // Se ocorrer um erro, informa o problema e retorna uma falha.
        console.error(`Erro no controller de download:`, error);
        res.status(500).json({ erro: 'Erro ao gerar o link de download.' });
    }
};