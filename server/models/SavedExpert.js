import mongoose from 'mongoose';

const savedExpertSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    expertId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ExpertDetails',
        required: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId, // Optional, can be useful for stats
        ref: 'Category'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate saves
savedExpertSchema.index({ userId: 1, expertId: 1 }, { unique: true });

const SavedExpert = mongoose.model('SavedExpert', savedExpertSchema);

export default SavedExpert;
