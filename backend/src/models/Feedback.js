import mongoose from 'mongoose';

// Define schema de feedback com restrição de unicidade por documento e validação de nota (1-5)
const FeedbackSchema = new mongoose.Schema({
    doc_uuid: { 
        type: String, 
        required: true, 
        unique: true, 
        index: true 
    },
    userId: { 
        type: String, 
        required: true, 
        index: true 
    },
    rating: { 
        type: Number, 
        required: true, 
        min: 1, 
        max: 5 
    },
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
}, {
    timestamps: true 
});

// Cria índice composto para otimizar consultas frequentes por documento e nota
FeedbackSchema.index({ doc_uuid: 1, rating: 1 });

const Feedback = mongoose.model('Feedback', FeedbackSchema);

export default Feedback;