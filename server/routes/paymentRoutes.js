import express from 'express';
import { createOrder, verifyPayment, createFreeBooking, usePremiumCredit, createFreeSubscription } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.post('/create-free-booking', createFreeBooking);
router.post('/use-premium-credit', usePremiumCredit);
router.post('/create-free-subscription', createFreeSubscription);

export default router;
