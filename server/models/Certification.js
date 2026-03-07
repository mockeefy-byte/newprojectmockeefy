import mongoose from 'mongoose';

const certificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
        type: String,
        required: true,
        enum: ['Mock Interview Completion', 'Advanced System Design', 'Expert Communicator'] // Expandable
    },
    certificateId: {
        type: String,
        required: true,
        unique: true
    },
    issueDate: {
        type: Date,
        default: Date.now
    },
    type: {
        type: String, // e.g., 'completion', 'skill'
        default: 'completion'
    },
    metadata: {
        score: Number,
        sessionCount: Number
    }
}, { timestamps: true });

export default mongoose.model('Certification', certificationSchema);
