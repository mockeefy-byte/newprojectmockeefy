import express from 'express';
import * as sessionController from '../controllers/sessionController.js';

const router = express.Router();


router.post('/dev/seed/test-session', (req, res, next) => {

    sessionController.devSeedSession(req, res, next);
});
router.get('/user/:userId/role/:role', sessionController.getUserSessions);
router.post('/:sessionId/join', sessionController.joinSession);

/* ADMIN: Get All Sessions */
router.get('/all', sessionController.getAllSessions);

router.get('/:sessionId', sessionController.getSession);
router.get('/candidate/:candidateId', sessionController.getSessionsByCandidate);
router.get('/expert/:expertId', sessionController.getSessionsByExpert);
router.post('/seed', sessionController.seedSession);
router.get('/:sessionId/reviews', sessionController.getSessionReviews);
router.post('/:sessionId/review', sessionController.submitReview);
router.post('/', sessionController.createSession);

export default router;
