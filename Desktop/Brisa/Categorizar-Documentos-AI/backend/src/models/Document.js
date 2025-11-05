import mongoose from 'mongoose';

// Define o Schema aninhado para o resultado da análise da IA.
const ResultadoIaSchema = new mongoose.Schema({
    categoria: { type: String },
    // Campo flexível (Mixed) para armazenar os metadados extraídos pela IA.
    metadados: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { _id: false });

// Define o Schema principal para a coleção 'documentos'.
const DocumentoSchema = new mongoose.Schema({
    doc_uuid: { type: String, required: true, unique: true, index: true },
    minioKey: { type: String, required: true },
    bucketName: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    contentType: { type: String },
    userId: { type: String, index: true },
    uploadedTimeStamp: { type: Date, default: Date.now, index: true },

    // Controla o status do processamento do documento (ex: 'PROCESSED', 'FAILED').
    status: { type: String, enum: ['UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED'], required: true },

    // Armazena o objeto completo (categoria e metadados) retornado pela IA.
    resultadoIa: ResultadoIaSchema
});

const Documento = mongoose.model('Documento', DocumentoSchema);

export default Documento;