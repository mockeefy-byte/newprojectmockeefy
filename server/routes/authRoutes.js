import express from "express";
// Verify OTP
import { sendOtp, verifyOtp, registerUser, loginUser, authenticateToken, getProfile, refresh, logoutUser, verifyGoogleToken, resetPassword, googleCallback } from "../controllers/authController.js";
import passport from "passport";


const router = express.Router();

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/reset-password', resetPassword);
router.post('/google-signup', verifyGoogleToken);
router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/refresh', refresh);
router.post('/logout', logoutUser);
router.get('/profile', authenticateToken, getProfile);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    passport.authenticate('google', { failureRedirect: process.env.CLIENT_URL + '/login' }),
    googleCallback
);


export default router;