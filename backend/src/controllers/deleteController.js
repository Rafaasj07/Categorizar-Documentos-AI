import { apagarDoR2 } from '../services/r2Service.js';
import { apagarMetadados } from '../services/mongoDbService.js';

// Exclui documentos do R2 e MongoDB em lote
export const apagarDocumentoController = async (req, res) => {
    const { documentos } = req.body;

    if (!documentos || !Array.isArray(documentos) || documentos.length === 0) {
        return res.status(400).json({ erro: 'Nenhum documento para apagar.' });
    }

    console.log(`[DELETE] Iniciando remoção de ${documentos.length} documento(s)...`);

    try {
        const promessas = documentos.map(doc => {
            if (doc.bucketName && doc.storageKey && doc.doc_uuid) {
                console.log(`[DELETE] Removendo: ${doc.fileName} (UUID: ${doc.doc_uuid})`);
                return Promise.all([
                    apagarDoR2(doc.bucketName, doc.storageKey),
                    apagarMetadados(doc.doc_uuid)
                ]);
            }
            return Promise.resolve();
        });

        await Promise.all(promessas);

        console.log(`[DELETE] Sucesso: ${documentos.length} arquivos removidos.`);
        res.status(200).json({ mensagem: 'Documentos apagados com sucesso.' });
    } catch (error) {
        console.error(`[DELETE] Erro crítico durante exclusão:`, error);
        res.status(500).json({ erro: 'Erro ao apagar os documentos.' });
    }
};