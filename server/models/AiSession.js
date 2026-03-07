import mongoose from 'mongoose';

const aiSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    config: {
        goal: { type: String, required: true },
        role: { type: String, required: true },
        experience: { type: String, required: true },
        skills: [{ type: String }],
        difficulty: { type: String, default: 'medium' },
        tone: { type: String, default: 'professional' },
        depth: { type: String, default: 'scenario' }
    },
    transcript: [{
        sender: {
            type: String,
            enum: ['user', 'ai'],
            required: true
        },
        text: { type: String, required: true },
        timestamp: { type: Date, default: Date.now }
    }],
    duration: {
        type: Number,
        default: 0 // in seconds
    },
    status: {
        type: String,
        enum: ['completed', 'abandoned', 'live'],
        default: 'live'
    },
    feedback: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});

export default mongoose.model('AiSession', aiSessionSchema);
