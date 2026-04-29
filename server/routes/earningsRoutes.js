import express from 'express';
import { authenticateToken } from '../controllers/authController.js';
import {
  getEarningsData,
  getBankAccount,
  saveBankAccount,
  requestWithdrawal,
} from '../controllers/earningsController.js';

const router = express.Router();

// All earnings routes must be authenticated
router.use(authenticateToken);

router.get('/', getEarningsData);
router.get('/bank', getBankAccount);
router.post('/bank', saveBankAccount);
router.post('/withdraw', requestWithdrawal);

export default router;
