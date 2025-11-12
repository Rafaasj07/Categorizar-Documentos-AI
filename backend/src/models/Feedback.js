import mongoose from 'mongoose';

// Define o Schema Mongoose para a coleção 'feedbacks'.
const FeedbackSchema = new mongoose.Schema({
    // UUID do documento associado ao feedback.
    // É único, garantindo que cada documento só receba um feedback.
    doc_uuid: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true 
    },
    // ID do usuário que enviou o feedback.
    userId: { 
        type: String, 
        required: true, 
        index: true 
    },
    // Nota (rating) de 1 a 5, com validação de mínimo e máximo.
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    },
    // Data de envio do feedback.
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
}, {
    // Adiciona automaticamente os campos createdAt e updatedAt.
    timestamps: true 
});


// Cria um índice composto para otimizar buscas por doc_uuid e rating.
FeedbackSchema.index({ doc_uuid: 1, rating: 1 });

const Feedback = mongoose.model('Feedback', FeedbackSchema);

export default Feedback;