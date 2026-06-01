import { Router } from 'express';
import { createCheckoutPreference, handleWebhook, checkPaymentStatus } from '../controllers/checkoutController';

const router = Router();

router.post('/create-preference', createCheckoutPreference);
router.post('/webhook', handleWebhook);
router.get('/check-payment/:orderId', checkPaymentStatus);

export default router;
