import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema({
    status: {
        type: String,
        enum: ['Active', 'Closed', 'Draft'],
        default: 'Active'
    },
    company: {
        type: String,
        required: true,
        trim: true
    },
    position: {
        type: String,
        required: true,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        default: 'Competitive'
    },
    type: {
        type: String,
        enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
        default: 'Full-time'
    },
    applyLink: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true // Making description required as per user request
    },
    requirements: [{
        type: String
    }],
    benefits: [{
        type: String
    }],
    process: [{
        step: { type: Number },
        title: { type: String },
        description: { type: String }
    }],
    experienceLevel: {
        type: String,
        enum: ['Entry Level', 'Mid Level', 'Senior Level', 'Lead', 'Executive'],
        default: 'Mid Level'
    },
    tags: [{
        type: String
    }],
    postedAt: {
        type: Date,
        default: Date.now
    }
});

const Job = mongoose.model('Job', jobSchema);

export default Job;
