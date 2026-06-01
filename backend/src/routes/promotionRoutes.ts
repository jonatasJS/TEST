import { Router } from 'express';
import { getAllPromotions, getActivePromotions, createPromotion, updatePromotion, deletePromotion, incrementPromotionUsage } from '../controllers/promotionController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Rotas públicas (para clientes verem promoções ativas)
router.get('/active', getActivePromotions as any);

// Rotas administrativas protegidas
router.get('/', authMiddleware, adminMiddleware, getAllPromotions as any);
router.post('/', authMiddleware, adminMiddleware, createPromotion as any);
router.put('/:id', authMiddleware, adminMiddleware, updatePromotion as any);
router.delete('/:id', authMiddleware, adminMiddleware, deletePromotion as any);
router.post('/:id/increment-usage', authMiddleware, incrementPromotionUsage as any);

export default router;
