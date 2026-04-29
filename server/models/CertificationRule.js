import mongoose from 'mongoose';

const certificationRuleSchema = new mongoose.Schema({
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true,
        unique: true
    },
    minInterviews: {
        type: Number,
        default: 5
    },
    passingPercentage: {
        type: Number,
        default: 70
    },
    validityMonths: {
        type: Number,
        default: 12
    },
    weightage: {
        technical: { type: Number, default: 40 },
        communication: { type: Number, default: 30 },
        confidence: { type: Number, default: 30 }
    }
}, { timestamps: true });

export default mongoose.model('CertificationRule', certificationRuleSchema);
