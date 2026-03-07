import mongoose from "mongoose";

/* ----------------- Review Schema ------------------ */
const reviewSchema = new mongoose.Schema(
    {
        // We use String to match the Session.js schema which uses String UUIDs/IDs
        sessionId: {
            type: String,
            required: true,
            index: true
        },
        expertId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        candidateId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        // Ratings
        overallRating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        technicalRating: {
            type: Number,
            min: 1,
            max: 5,
            default: 0
        },
        communicationRating: {
            type: Number,
            min: 1,
            max: 5,
            default: 0
        },

        // Qualitative Feedback
        feedback: {
            type: String,
            trim: true,
            maxlength: 2000
        },
        strengths: {
            type: [String],
            default: []
        },
        weaknesses: {
            type: [String],
            default: [] // Areas for improvement
        },

        reviewerRole: {
            type: String,
            enum: ['expert', 'candidate'],
            required: true
        },
        isVisible: {
            type: Boolean,
            default: true
        }
    },
    { timestamps: true }
);

// Compound index to prevent duplicate reviews by the same role for the same session
reviewSchema.index({ sessionId: 1, reviewerRole: 1 }, { unique: true });

// Use 'ReviewDetails' to avoid conflict with potential cached 'Review' model in memory
export default mongoose.model("ReviewDetails", reviewSchema, "reviews");
