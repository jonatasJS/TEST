import { Router } from 'express';
import {
  getVapidPublicKeyHandler,
  subscribePush,
  unsubscribePush,
} from '../controllers/notificationController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.get('/vapid-public-key', getVapidPublicKeyHandler);
router.post('/subscribe', authMiddleware, subscribePush as any);
router.post('/unsubscribe', authMiddleware, unsubscribePush as any);

export default router;
