import express from 'express';
import { createOrder, verifyPayment, createFreeBooking, usePremiumCredit, createFreeSubscription, createContact, createFundAccount, getPayoutStatus } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.post('/create-free-booking', createFreeBooking);
router.post('/use-premium-credit', usePremiumCredit);
router.post('/create-free-subscription', createFreeSubscription);

// Razorpay Payout Routes
router.post('/create-contact', createContact);
router.post('/create-fund-account', createFundAccount);
router.get('/payout-status/:payoutId', getPayoutStatus);

export default router;
