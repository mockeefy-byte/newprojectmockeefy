import mongoose from 'mongoose';

const pricingRuleSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    skillId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Skill',
        default: null // Optional: if null, applies to whole category
    },
    level: {
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        required: true
    },
    duration: {
        type: Number,
        enum: [30, 60],
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    currency: {
        type: String,
        default: 'INR'
    }
}, { timestamps: true });

// Ensure unique price per category+skill+level+duration
pricingRuleSchema.index({ categoryId: 1, skillId: 1, level: 1, duration: 1 }, { unique: true });

export default mongoose.model('PricingRule', pricingRuleSchema);
