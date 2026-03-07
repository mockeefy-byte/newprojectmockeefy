import express from 'express';
import { getDashboardStats } from '../controllers/adminController.js';
import { getActiveExperts } from '../controllers/expertController.js';

const router = express.Router();

router.get('/stats', getDashboardStats);

// Expert Management Routes
// Expert Management Routes
router.get('/experts/active', getActiveExperts);
// Removed mapping route


export default router;
