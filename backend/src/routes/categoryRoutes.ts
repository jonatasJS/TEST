import { Router } from 'express';
import { getAllCategories, getCategoryById, getCategoryBySlug, createCategory, updateCategory, deleteCategory, getCategoriesSortedBySales } from '../controllers/categoryController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', getAllCategories);
router.get('/sorted-by-sales', getCategoriesSortedBySales);
router.get('/:id', getCategoryById);
router.get('/slug/:slug', getCategoryBySlug);

// Rotas administrativas protegidas
router.post('/', authMiddleware, adminMiddleware, createCategory as any);
router.put('/:id', authMiddleware, adminMiddleware, updateCategory as any);
router.delete('/:id', authMiddleware, adminMiddleware, deleteCategory as any);

export default router;
