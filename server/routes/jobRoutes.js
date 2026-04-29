import express from 'express';
import Job from '../models/Job.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Get all jobs
// @route   GET /api/jobs
// @access  Public (or Protected based on requirement, usually public for candidates)
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().sort({ postedAt: -1 });
        res.json({ success: true, data: jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Create a job
// @route   POST /api/jobs
// @access  Private/Admin
router.post('/', protect, admin, async (req, res) => {
    try {
        const { company, position, location, salary, type, applyLink, description, tags } = req.body;

        const job = await Job.create({
            company,
            position,
            location,
            salary,
            type,
            applyLink,
            description,
            tags
        });

        res.status(201).json({ success: true, data: job });
    } catch (error) {
        console.error('Error creating job:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Update a job
// @route   PUT /api/jobs/:id
// @access  Private/Admin
router.put('/:id', protect, admin, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (job) {
            job.company = req.body.company || job.company;
            job.position = req.body.position || job.position;
            job.location = req.body.location || job.location;
            job.salary = req.body.salary || job.salary;
            job.type = req.body.type || job.type;
            job.applyLink = req.body.applyLink || job.applyLink;
            job.description = req.body.description || job.description;
            job.requirements = req.body.requirements || job.requirements;
            job.benefits = req.body.benefits || job.benefits;
            job.process = req.body.process || job.process;
            job.experienceLevel = req.body.experienceLevel || job.experienceLevel;
            job.status = req.body.status || job.status;

            const updatedJob = await job.save();
            res.json({ success: true, data: updatedJob });
        } else {
            res.status(404).json({ success: false, message: 'Job not found' });
        }
    } catch (error) {
        console.error('Error updating job:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// @desc    Delete a job
// @route   DELETE /api/jobs/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);

        if (job) {
            await job.deleteOne();
            res.json({ success: true, message: 'Job removed' });
        } else {
            res.status(404).json({ success: false, message: 'Job not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

export default router;
