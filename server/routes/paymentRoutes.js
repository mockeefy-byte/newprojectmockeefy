import express from 'express';
import { createOrder, verifyPayment, createFreeBooking } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/create-order', createOrder);
router.post('/verify-payment', verifyPayment);
router.post('/create-free-booking', createFreeBooking);

export default router;
