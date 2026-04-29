import express from 'express';
import { getAllUsers, toggleUserStatus } from '../controllers/userAdminController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect, admin);

router.get('/', getAllUsers);
router.put('/:id/status', toggleUserStatus);

export default router;
