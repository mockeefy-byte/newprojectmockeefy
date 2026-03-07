import express from 'express';
import { getAllUsers, toggleUserStatus } from '../controllers/userAdminController.js';
// import { protect, admin } from '../middleware/authMiddleware.js'; // Assuming you have auth middleware

const router = express.Router();

// protect and admin middleware should be applied in server.js or here
// For now, assuming they are passed or applying them generally

router.get('/', getAllUsers);
router.put('/:id/status', toggleUserStatus);

export default router;
