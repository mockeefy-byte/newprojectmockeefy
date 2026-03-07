
import express from 'express';
import { createReport, getReportsByExpert, getReportById } from '../controllers/reportController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require Expert authentication
router.post('/', protect, authorize('expert'), createReport);
router.get('/', protect, authorize('expert'), getReportsByExpert);
router.get('/:id', protect, getReportById); // Both expert and candidate might view?

export default router;
