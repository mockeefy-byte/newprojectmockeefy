import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String
    },
    icon: {
        type: String // URL or icon name
    },
    type: {
        type: String, // e.g., 'technical', 'behavioral', etc.
        default: 'technical'
    },
    skills: {
        type: [String],
        default: []
    },
    levels: {
        type: [String],
        default: ['Beginner', 'Intermediate', 'Advanced']
    },
    status: {
        type: String,
        enum: ['Active', 'Inactive'],
        default: 'Active'
    },
    /** Base price (INR) for 30 min. Used when no PricingRule exists for (category, level, duration). */
    amount: {
        type: Number,
        default: null,
        min: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Category = mongoose.model('Category', categorySchema);

export default Category;
