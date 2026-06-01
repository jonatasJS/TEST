import { Router } from 'express';
import { getAllClients, getClientDetails, updateClientRole, deleteClient } from '../controllers/clientController';
import { authMiddleware, adminMiddleware } from '../middleware/auth';

const router = Router();

// Rotas administrativas protegidas
router.get('/', authMiddleware, adminMiddleware, getAllClients as any);
router.get('/:id', authMiddleware, adminMiddleware, getClientDetails as any);
router.put('/:id/role', authMiddleware, adminMiddleware, updateClientRole as any);
router.delete('/:id', authMiddleware, adminMiddleware, deleteClient as any);

export default router;
