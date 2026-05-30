import { Router } from 'express';
import { createOrder, getUserOrders, getAllOrders, updateOrderStatus } from '../controllers/orderController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Rota de criação e histórico do usuário (requer autenticação de cliente)
router.post('/', authMiddleware, createOrder as any);
router.get('/my', authMiddleware, getUserOrders as any);

// Rotas de controle administrativo (requer permissão admin)
router.get('/admin/all', authMiddleware, adminMiddleware, getAllOrders as any);
router.put('/admin/:id/status', authMiddleware, adminMiddleware, updateOrderStatus as any);

export default router;
