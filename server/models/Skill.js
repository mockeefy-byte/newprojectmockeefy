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
    /** Base price (e.g. INR) for a 30-minute session. Used in dynamic pricing: finalPrice = basePrice30 * levelMultiplier * durationMultiplier */
    basePrice30: {
        type: Number,
        min: 0,
        default: null
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
