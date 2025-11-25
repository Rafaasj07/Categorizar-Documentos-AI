import { getObjectStreamFromMinIO } from '../services/minioService.js';

// Função que lida com a requisição para baixar o arquivo.
export const downloadDocumentoController = async (req, res) => {
    try {
        const { bucketName, minioKey, fileName } = req.body;

        if (!bucketName || !minioKey || !fileName) {
            return res.status(400).json({ erro: 'Informações insuficientes para o download.' });
        }

        // Busca o stream do objeto no MinIO.
        const stream = await getObjectStreamFromMinIO(bucketName, minioKey);

        // Define os cabeçalhos para forçar o download no navegador.
        res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
        res.setHeader('Content-Type', 'application/octet-stream');

        // Envia o stream do arquivo como resposta.
        stream.pipe(res);

    } catch (error) {
        console.error(`Erro no controller de download:`, error);
        res.status(500).json({ erro: 'Erro ao baixar o arquivo.' });
    }
};