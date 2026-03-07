import mongoose from "mongoose";

const pricingSchema = new mongoose.Schema({
    categoryId: {
        type: String, // Keeping as String (Category Name) for simplified mapping with Expert profiles
        required: true,
        trim: true
    },
    levelId: {
        type: String, // "Beginner", "Intermediate", "Advanced", "Expert"
        required: true,
        trim: true
    },
    duration: {
        type: Number, // 30 or 60
        required: true,
        enum: [30, 60]
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
}, { timestamps: true });

// Ensure unique combination to prevent duplicates
pricingSchema.index({ categoryId: 1, levelId: 1, duration: 1 }, { unique: true });

export default mongoose.model("Pricing", pricingSchema);
