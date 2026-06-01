import { Router } from 'express';
import { createCheckoutPreference, handleWebhook, checkPaymentStatus, createPixPayment, mockApprovePixPayment } from '../controllers/checkoutController';

const router = Router();

router.post('/create-preference', createCheckoutPreference);
router.post('/create-pix', createPixPayment);
router.post('/webhook', handleWebhook);
router.get('/check-payment/:orderId', checkPaymentStatus);
router.post('/mock-approve/:orderId', mockApprovePixPayment);

export default router;
