import { apagarDoMinIO } from '../services/minioService.js';
import { apagarMetadados } from '../services/mongoDbService.js';

// Controlador para exclusão em lote de documentos (MinIO e MongoDB)
export const apagarDocumentoController = async (req, res) => {
    const { documentos } = req.body;

    if (!documentos || !Array.isArray(documentos) || documentos.length === 0) {
        return res.status(400).json({ erro: 'Nenhum documento selecionado para apagar.' });
    }

    try {
        // Gera promessas para remover arquivos do MinIO e metadados do Mongo em paralelo
        const promessasDeExclusao = documentos.map(doc => {
            if (doc.bucketName && doc.minioKey && doc.doc_uuid) {
                return Promise.all([
                    apagarDoMinIO(doc.bucketName, doc.minioKey),
                    apagarMetadados(doc.doc_uuid)
                ]);
            }
            return Promise.resolve();
        });

        // Aguarda a conclusão de todas as exclusões
        await Promise.all(promessasDeExclusao);
        res.status(200).json({ mensagem: 'Documentos selecionados foram apagados com sucesso.' });
    } catch (error) {
        console.error(`Erro no controller de exclusão em lote:`, error);
        res.status(500).json({ erro: 'Erro ao apagar os documentos.' });
    }
};