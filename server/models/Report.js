import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
    sessionId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session', // Assuming 'Session' is the model name for sessions
        required: true,
        unique: true
    },
    expertId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExpertDetails',
        required: true
    },
    candidateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    scores: {
        technical: { type: Number, default: 0 },
        communication: { type: Number, default: 0 },
        confidence: { type: Number, default: 0 },
        systemDesign: { type: Number, default: 0 },
        problemSolving: { type: Number, default: 0 }
    },
    feedback: {
        strengths: [String],
        improvements: [String],
        detailedComments: String
    },
    status: {
        type: String,
        enum: ['Draft', 'Submitted'],
        default: 'Draft'
    },
    generatedCertificateId: {
        type: String // Optional reference if a cert was generated from this
    }
}, { timestamps: true });

export default mongoose.model('Report', reportSchema);
