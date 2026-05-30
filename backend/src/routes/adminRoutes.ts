import { Router } from 'express';
import { getDashboardStats } from '../controllers/adminController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.get('/stats', authMiddleware, adminMiddleware, getDashboardStats as any);

export default router;
