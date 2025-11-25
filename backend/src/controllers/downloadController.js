import { getObjectStreamFromR2 } from '../services/r2Service.js';

// Gerencia download do R2 via stream
export const downloadDocumentoController = async (req, res) => {
    try {
        const { bucketName, storageKey, fileName } = req.body;

        if (!bucketName || !storageKey || !fileName) {
            return res.status(400).json({ erro: 'Dados insuficientes para download.' });
        }

        const stream = await getObjectStreamFromR2(bucketName, storageKey);

        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        stream.pipe(res);

    } catch (error) {
        console.error(`Erro no download:`, error);
        res.status(500).json({ erro: 'Erro ao baixar o arquivo.' });
    }
};