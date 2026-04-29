import express from 'express';
import { protect, admin } from '../middleware/authMiddleware.js';
import {
  getDashboardStats,
  getWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  retryWithdrawalPayout
} from '../controllers/adminController.js';
import { getActiveExperts } from '../controllers/expertController.js';

const router = express.Router();

router.use(protect, admin);

router.get('/stats', getDashboardStats);
router.get('/withdrawals', getWithdrawals);
router.put('/withdrawals/:id/approve', approveWithdrawal);
router.put('/withdrawals/:id/reject', rejectWithdrawal);
router.put('/withdrawals/:id/retryPayout', retryWithdrawalPayout);

// Expert Management Routes
router.get('/experts/active', getActiveExperts);

export default router;
