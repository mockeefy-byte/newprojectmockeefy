
import express from 'express';
import { getSkillsByCategory, createSkill } from '../controllers/skillController.js';

const router = express.Router();

router.get('/category/:categoryId', getSkillsByCategory);
router.post('/', createSkill);

export default router;
