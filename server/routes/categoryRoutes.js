import express from 'express';
import { getAllCategories, createCategory, updateCategory, seedCategories } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', getAllCategories);
router.post('/', createCategory);
router.put('/:id', updateCategory);
router.post('/seed', seedCategories); // Endpoint to seed initial data

export default router;
