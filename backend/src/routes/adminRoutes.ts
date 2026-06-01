import { Router } from 'express';
import { getDashboardStats, getReports, exportOrdersCSV, exportProductsCSV, exportSalesCSV } from '../controllers/adminController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

router.get('/stats', authMiddleware, adminMiddleware, getDashboardStats as any);
router.get('/reports', authMiddleware, adminMiddleware, getReports as any);
router.get('/export/orders', authMiddleware, adminMiddleware, exportOrdersCSV as any);
router.get('/export/products', authMiddleware, adminMiddleware, exportProductsCSV as any);
router.get('/export/sales', authMiddleware, adminMiddleware, exportSalesCSV as any);

export default router;
