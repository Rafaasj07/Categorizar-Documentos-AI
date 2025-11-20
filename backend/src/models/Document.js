import mongoose from 'mongoose';

// Schema aninhado para armazenar categorização e metadados flexíveis da IA
const ResultadoIaSchema = new mongoose.Schema({
    categoria: { type: String },
    metadados: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { _id: false });

// Schema principal definindo estrutura do documento, índices e status de processamento
const DocumentoSchema = new mongoose.Schema({
    doc_uuid: { type: String, required: true, unique: true, index: true },
    minioKey: { type: String, required: true },
    bucketName: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    contentType: { type: String },
    userId: { type: String, index: true },
    uploadedTimeStamp: { type: Date, default: Date.now, index: true },

    status: { type: String, enum: ['UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED'], required: true },

    resultadoIa: ResultadoIaSchema
});

const Documento = mongoose.model('Documento', DocumentoSchema);

export default Documento;