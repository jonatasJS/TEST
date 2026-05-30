import { Router } from 'express';
import { createCheckoutPreference, handleWebhook } from '../controllers/checkoutController';

const router = Router();

router.post('/create-preference', createCheckoutPreference);
router.post('/webhook', handleWebhook);

export default router;
