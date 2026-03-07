import mongoose from 'mongoose';

const skillSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    icon: {
        type: String // URL or icon name
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Ensure unique skill name per category
skillSchema.index({ categoryId: 1, name: 1 }, { unique: true });

export default mongoose.model('Skill', skillSchema);
