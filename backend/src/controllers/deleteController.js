import { apagarDoMinIO } from '../services/minioService.js';
import { apagarMetadados } from '../services/mongoDbService.js';

// Função que lida com a rota para apagar documentos.
export const apagarDocumentoController = async (req, res) => {
    // Pega a lista de documentos a serem apagados do corpo da requisição.
    const { documentos } = req.body;

    // Valida se a lista de documentos foi enviada corretamente.
    if (!documentos || !Array.isArray(documentos) || documentos.length === 0) {
        return res.status(400).json({ erro: 'Nenhum documento selecionado para apagar.' });
    }

    try {
        // Mapeia a lista para criar uma promessa de exclusão para cada documento.
        const promessasDeExclusao = documentos.map(doc => {
            // Garante que o documento tenha todas as informações necessárias.
            if (doc.bucketName && doc.minioKey && doc.doc_uuid) {
                // Executa as duas exclusões (arquivo e dados) em paralelo.
                return Promise.all([
                    apagarDoMinIO(doc.bucketName, doc.minioKey),
                    apagarMetadados(doc.doc_uuid)
                ]);
            }
            return Promise.resolve(); // Ignora documentos inválidos.
        });

        // Espera que todas as exclusões terminem.
        await Promise.all(promessasDeExclusao);
        // Retorna uma mensagem de sucesso.
        res.status(200).json({ mensagem: 'Documentos selecionados foram apagados com sucesso.' });
    } catch (error) {
        // Se algo falhar, retorna um erro.
        console.error(`Erro no controller de exclusão em lote:`, error);
        res.status(500).json({ erro: 'Erro ao apagar os documentos.' });
    }
};