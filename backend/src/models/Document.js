import mongoose from 'mongoose';

// Define a estrutura para os metadados extraídos pela IA.
const MetadadosSchema = new mongoose.Schema({
    titulo: { type: String, default: null },
    autor: { type: String, default: null },
    data: { type: String, default: null },
    palavrasChave: [{ type: String }],
    resumo: { type: String, default: null }
});

// Define a estrutura para o resultado completo da análise da IA.
const ResultadoIaSchema = new mongoose.Schema({
    categoria: { type: String },
    metadados: MetadadosSchema
});

// Define a estrutura principal para um documento.
const DocumentoSchema = new mongoose.Schema({
    // Informações básicas e de armazenamento do arquivo.
    doc_uuid: { type: String, required: true, unique: true, index: true },
    minioKey: { type: String, required: true },
    bucketName: { type: String, required: true },
    fileName: { type: String, required: true },
    fileSize: { type: Number, required: true },
    contentType: { type: String },
    userId: { type: String },
    uploadedTimeStamp: { type: Date, default: Date.now },
    
    // Status do processo de análise (ex: 'PROCESSADO', 'FALHOU').
    status: { type: String, enum: ['UPLOADED', 'PROCESSED', 'FAILED'], required: true },
    
    // Armazena o JSON completo retornado pela IA.
    resultadoIa: ResultadoIaSchema
});

// Cria o "model" que será usado para interagir com a coleção de documentos no banco.
const Documento = mongoose.model('Documento', DocumentoSchema);

export default Documento;