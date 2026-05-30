import { Router } from 'express';
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from '../controllers/productController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.get('/', getAllProducts);
router.get('/:id', getProductById);

// Rotas administrativas protegidas
router.post('/', authMiddleware, adminMiddleware, createProduct as any);
router.put('/:id', authMiddleware, adminMiddleware, updateProduct as any);
router.delete('/:id', authMiddleware, adminMiddleware, deleteProduct as any);

export default router;
