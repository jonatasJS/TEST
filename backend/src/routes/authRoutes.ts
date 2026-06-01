import { Router } from 'express';
import { register, login, logout, me, updateProfile } from '../controllers/authController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authMiddleware, me as any);
router.put('/profile', authMiddleware, updateProfile as any);

export default router;
