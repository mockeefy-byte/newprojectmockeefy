import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
    saveExpert,
    getSavedExperts,
    removeSavedExpert,
    checkIsSaved
} from '../controllers/savedExpertController.js';

const router = express.Router();

router.use(protect); // All routes require authentication

router.post('/', saveExpert); // Save
router.get('/', getSavedExperts); // List
router.delete('/:id', removeSavedExpert); // Remove (accepts SavedExpert ID or Expert ID)
router.get('/check/:expertId', checkIsSaved); // Check status

export default router;
