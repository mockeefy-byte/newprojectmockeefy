import express from 'express';
import { authenticateToken } from '../controllers/authController.js';
import * as aiSessionController from '../controllers/aiSessionController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

router.post('/start', aiSessionController.createSession);
router.put('/:id/update', aiSessionController.updateSession);
router.post('/:id/end', aiSessionController.endSession);
router.get('/my-sessions', aiSessionController.getUserSessions);
router.get('/:id', aiSessionController.getSession);
router.get('/:id/next-question', aiSessionController.getNextQuestion);
router.post('/:id/generate-report', aiSessionController.generateReport);

export default router;
