import Documento from '../models/Document.js';
import { apagarDoR2 } from './r2Service.js';
import { apagarMetadados } from './mongoDbService.js';

// Define limites: 8GB limite e 1GB para limpeza
const LIMIT_BYTES = 8 * 1024 * 1024 * 1024;
const CLEANUP_GOAL_BYTES = 1 * 1024 * 1024 * 1024;

// Verifica armazenamento total e executa limpeza se necessário
export const verificarEGerenciarArmazenamento = async () => {
    try {
        // Agrega o tamanho total de todos os documentos no banco
        const resultado = await Documento.aggregate([
            { $group: { _id: null, totalSize: { $sum: "$fileSize" } } }
        ]);

        const totalUsado = resultado.length > 0 ? resultado[0].totalSize : 0;
        console.log(`[STORAGE] Uso atual: ${(totalUsado / 1024 / 1024).toFixed(2)} MB`);

        if (totalUsado > LIMIT_BYTES) {
            console.log('[STORAGE] Limite de 8GB excedido. Iniciando limpeza automática...');
            await executarLimpeza();
        }
    } catch (error) {
        console.error('[STORAGE] Erro ao verificar armazenamento:', error);
    }
};

// Apaga arquivos antigos até liberar o espaço alvo
async function executarLimpeza() {
    let espacoLiberado = 0;
    
    // Busca documentos mais antigos (ordenados por upload)
    const cursor = Documento.find().sort({ uploadedTimeStamp: 1 }).cursor();

    for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) {
        try {
            console.log(`[STORAGE] Removendo antigo: ${doc.fileName} (${doc.fileSize} bytes)`);

            // Apaga do R2 e do Mongo
            await apagarDoR2(doc.bucketName, doc.storageKey);
            await apagarMetadados(doc.doc_uuid);

            espacoLiberado += doc.fileSize;

            // Para se atingir a meta de 1GB liberado
            if (espacoLiberado >= CLEANUP_GOAL_BYTES) {
                console.log(`[STORAGE] Limpeza concluída. Liberados: ${(espacoLiberado / 1024 / 1024).toFixed(2)} MB`);
                break;
            }
        } catch (erroDelete) {
            console.error(`[STORAGE] Falha ao limpar documento ${doc.doc_uuid}:`, erroDelete);
        }
    }
}