import express from 'express';
import * as tipsController from '../controllers/tipsController.js';

const router = express.Router();

router.get('/categories', tipsController.getCategories);
router.get('/', tipsController.getTipsByCategory);
router.post('/generate', tipsController.generateTips);

export default router;
