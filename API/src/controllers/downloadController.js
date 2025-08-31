// Importa o serviço do S3 para gerar URLs de download seguras.
import { gerarUrlDownload } from '../services/s3Service.js';

/**
 * Controller para gerar um link de download seguro e temporário para um
 * arquivo que está armazenado no S3.
 * * @param {object} req - O objeto de requisição do Express, com 'bucket' and 'key' na query.
 * @param {object} res - O objeto de resposta do Express.
 */
export const downloadDocumentoController = async (req, res) => {
    try {
        // Extrai o nome do bucket e a chave do arquivo da query da requisição.
        const { bucket, key } = req.query;

        // Valida se os parâmetros necessários foram fornecidos.
        if (!bucket || !key) {
            return res.status(400).json({ erro: 'Parâmetros inválidos para o download.' });
        }

        // Chama o serviço para gerar a URL de download pré-assinada.
        const downloadUrl = await gerarUrlDownload(bucket, key);
        // Retorna a URL gerada em formato JSON.
        res.json({ downloadUrl });
    } catch (error) {
        // Em caso de erro, registra o problema e retorna uma resposta de erro 500.
        console.error(`Erro no controller de download:`, error);
        res.status(500).json({ erro: 'Erro ao gerar o link de download.' });
    }
};