import { getObjectStreamFromMinIO } from '../services/minioService.js';

// Gerencia requisição de download transmitindo arquivo do MinIO via stream
export const downloadDocumentoController = async (req, res) => {
    try {
        const { bucketName, minioKey, fileName } = req.body;

        if (!bucketName || !minioKey || !fileName) {
            return res.status(400).json({ erro: 'Informações insuficientes para o download.' });
        }

        // Obtém stream do objeto diretamente do serviço de storage
        const stream = await getObjectStreamFromMinIO(bucketName, minioKey);

        // Configura headers para forçar download e inicia streaming da resposta
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        stream.pipe(res);

    } catch (error) {
        console.error(`Erro no controller de download:`, error);
        res.status(500).json({ erro: 'Erro ao baixar o arquivo.' });
    }
};