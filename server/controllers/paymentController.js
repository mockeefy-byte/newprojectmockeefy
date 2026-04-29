import Razorpay from 'razorpay';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    console.error("CRITICAL ERROR: Razorpay keys are missing from environment variables!");
}

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Service charge percentage (20%)
const SERVICE_CHARGE_PERCENT = parseFloat(process.env.SERVICE_CHARGE_PERCENT || '20');

// Razorpay Payouts - Create contact for expert
export const createContact = async (req, res) => {
    try {
        const { name, email, phone } = req.body;
        
        const contact = await razorpay.contacts.create({
            name,
            email,
            phone,
            type: 'individual'
        });
        
        res.status(200).json({
            success: true,
            contact
        });
    } catch (error) {
        console.error('Razorpay Create Contact Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create contact',
            error: error.message
        });
    }
};

// Razorpay Payouts - Create fund account for expert
export const createFundAccount = async (req, res) => {
    try {
        const { contactId, accountNumber, ifscCode, accountType = 'bank_account' } = req.body;
        
        const fundAccount = await razorpay.fundAccounts.create({
            contact_id: contactId,
            account_type: accountType,
            bank_account: {
                name: req.body.accountHolderName || 'Expert Account',
                ifsc: ifscCode,
                account_number: accountNumber
            }
        });
        
        res.status(200).json({
            success: true,
            fundAccount
        });
    } catch (error) {
        console.error('Razorpay Create Fund Account Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create fund account',
            error: error.message
        });
    }
};

// Automatic payout to expert bank account with 20% service charge
export const payoutToExpert = async (expertUserId, amount, sessionId) => {
    try {
        const User = (await import('../models/User.js')).default;
        const BankAccount = (await import('../models/BankAccount.js')).default;
        
        // Get expert's user data and bank account
        const expert = await User.findById(expertUserId);
        if (!expert) {
            return { success: false, reason: 'Expert user not found' };
        }
        
        const bankAccount = await BankAccount.findOne({ userId: expertUserId });
        if (!bankAccount) {
            return { success: false, reason: 'No bank account linked' };
        }
        
        // Calculate service charge and expert payout
        const serviceCharge = (amount * SERVICE_CHARGE_PERCENT) / 100;
        const expertPayout = amount - serviceCharge;
        
        // Convert to paise
        const payoutInPaise = Math.floor(expertPayout * 100);
        
        if (payoutInPaise < 100) { // Minimum 1 INR
            return { success: false, reason: 'Amount too small for payout' };
        }
        
        // Create or get Razorpay contact
        let contact;
        try {
            const contacts = await razorpay.contacts.all({ email: expert.email });
            if (contacts.count > 0) {
                contact = contacts.items[0];
            } else {
                contact = await razorpay.contacts.create({
                    name: expert.name || 'Expert',
                    email: expert.email,
                    phone: expert.phone || '9999999999',
                    type: 'individual'
                });
            }
        } catch (e) {
            // Create new contact if doesn't exist
            contact = await razorpay.contacts.create({
                name: expert.name || 'Expert',
                email: expert.email,
                phone: expert.phone || '9999999999',
                type: 'individual'
            });
        }
        
        // Create fund account
        let fundAccount;
        try {
            const fundAccounts = await razorpay.fundAccounts.all({ contact_id: contact.id });
            if (fundAccounts.count > 0) {
                fundAccount = fundAccounts.items[0];
            } else {
                fundAccount = await razorpay.fundAccounts.create({
                    contact_id: contact.id,
                    account_type: 'bank_account',
                    bank_account: {
                        name: bankAccount.accountHolderName,
                        ifsc: bankAccount.ifscCode,
                        account_number: bankAccount.accountNumber
                    }
                });
            }
        } catch (e) {
            // Create new fund account
            fundAccount = await razorpay.fundAccounts.create({
                contact_id: contact.id,
                account_type: 'bank_account',
                bank_account: {
                    name: bankAccount.accountHolderName,
                    ifsc: bankAccount.ifscCode,
                    account_number: bankAccount.accountNumber
                }
            });
        }
        
        // Create payout
        const payout = await razorpay.payouts.create({
            account_number: process.env.RAZORPAY_ACCOUNT_NUMBER || '2323230032510971',
            fund_account_id: fundAccount.id,
            amount: payoutInPaise,
            currency: 'INR',
            mode: 'IMPS', // or 'NEFT', 'RTGS', 'UPI'
            purpose: 'refund',
            narration: `Payout for session ${sessionId}`,
            reference_id: sessionId
        });
        
        console.log(`✅ Auto-payout successful: ₹${expertPayout} to ${expert.email} (Service charge: ₹${serviceCharge})`);
        
        return {
            success: true,
            payoutId: payout.id,
            amount: expertPayout,
            serviceCharge,
            status: payout.status
        };
        
    } catch (error) {
        console.error('Razorpay Payout Error:', error);
        return { 
            success: false, 
            reason: error.message || 'Payout failed',
            error 
        };
    }
};

// Automatic payout of exact amount to expert bank account (used for manual wallet withdrawals)
export const processExactPayout = async (expertUserId, exactAmount, referenceId) => {
    try {
        const User = (await import('../models/User.js')).default;
        const BankAccount = (await import('../models/BankAccount.js')).default;
        
        // Get expert's user data and bank account
        const expert = await User.findById(expertUserId);
        if (!expert) {
            return { success: false, reason: 'Expert user not found' };
        }
        
        const bankAccount = await BankAccount.findOne({ userId: expertUserId });
        if (!bankAccount) {
            return { success: false, reason: 'No bank account linked' };
        }
        
        // Convert exact amount to paise (no service charge deduction here, as wallet is already net)
        const payoutInPaise = Math.floor(exactAmount * 100);
        
        if (payoutInPaise < 100) { // Minimum 1 INR
            return { success: false, reason: 'Amount too small for payout' };
        }
        
        // Create or get Razorpay contact
        let contact;
        try {
            const contacts = await razorpay.contacts.all({ email: expert.email });
            if (contacts.count > 0) {
                contact = contacts.items[0];
            } else {
                contact = await razorpay.contacts.create({
                    name: expert.name || 'Expert',
                    email: expert.email,
                    phone: expert.phone || '9999999999',
                    type: 'individual'
                });
            }
        } catch (e) {
            contact = await razorpay.contacts.create({
                name: expert.name || 'Expert',
                email: expert.email,
                phone: expert.phone || '9999999999',
                type: 'individual'
            });
        }
        
        // Create fund account
        let fundAccount;
        try {
            const fundAccounts = await razorpay.fundAccounts.all({ contact_id: contact.id });
            if (fundAccounts.count > 0) {
                fundAccount = fundAccounts.items[0];
            } else {
                fundAccount = await razorpay.fundAccounts.create({
                    contact_id: contact.id,
                    account_type: 'bank_account',
                    bank_account: {
                        name: bankAccount.accountHolderName,
                        ifsc: bankAccount.ifscCode,
                        account_number: bankAccount.accountNumber
                    }
                });
            }
        } catch (e) {
            fundAccount = await razorpay.fundAccounts.create({
                contact_id: contact.id,
                account_type: 'bank_account',
                bank_account: {
                    name: bankAccount.accountHolderName,
                    ifsc: bankAccount.ifscCode,
                    account_number: bankAccount.accountNumber
                }
            });
        }
        
        // Create payout
        const payout = await razorpay.payouts.create({
            account_number: process.env.RAZORPAY_ACCOUNT_NUMBER || '2323230032510971',
            fund_account_id: fundAccount.id,
            amount: payoutInPaise,
            currency: 'INR',
            mode: 'IMPS', // or 'NEFT', 'RTGS', 'UPI'
            purpose: 'payout',
            narration: `Withdrawal for ${referenceId}`,
            reference_id: String(referenceId)
        });
        
        console.log(`✅ Exact-payout successful: ₹${exactAmount} to ${expert.email}`);
        
        return {
            success: true,
            payoutId: payout.id,
            amount: exactAmount,
            status: payout.status
        };
        
    } catch (error) {
        console.error('Razorpay Exact Payout Error:', error);
        return { 
            success: false, 
            reason: error.message || 'Payout failed',
            error 
        };
    }
};

// Get payout status
export const getPayoutStatus = async (req, res) => {
    try {
        const { payoutId } = req.params;
        const payout = await razorpay.payouts.fetch(payoutId);
        
        res.status(200).json({
            success: true,
            payout
        });
    } catch (error) {
        console.error('Get Payout Status Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get payout status',
            error: error.message
        });
    }
};

export const createOrder = async (req, res) => {
    try {
        const { amount, currency = 'INR', receipt } = req.body;

        if (!amount) {
            return res.status(400).json({ success: false, message: 'Amount is required' });
        }


        const options = {
            amount: amount * 100, // Razorpay works in paise
            currency,
            receipt,
        };

        const order = await razorpay.orders.create(options);

        res.status(200).json({
            success: true,
            order,
        });
    } catch (error) {
        console.error('Razorpay Create Order Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create Razorpay order',
            error: error.message,
        });
    }
};

import * as sessionService from '../services/sessionService.js';
import ExpertDetails from '../models/expertModel.js';
import User from '../models/User.js';

export const verifyPayment = async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingDetails, user } = req.body;

        let isVerified = false;

        // Remove Dummy bypass, enforce actual verification
        const sign = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSign = crypto
            .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(sign.toString())
            .digest('hex');

        if (razorpay_signature === expectedSign) {
            isVerified = true;
        }

        if (isVerified) {
            // Handle Subscription Type
            if (req.body.paymentType === 'subscription') {
                const updatedUser = await User.findByIdAndUpdate(
                    user?.id || user?.userId,
                    {
                        isPremium: true,
                        freeInterviewsCount: 3,
                        premiumExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
                    },
                    { new: true }
                );
                return res.status(200).json({
                    success: true,
                    message: 'Subscription successful! You are now a Premium Member.',
                    user: updatedUser
                });
            }

            // Create Session Context (Regular Payment)
            if (bookingDetails) {
                const startTime = new Date(bookingDetails.startTime);
                const endTime = new Date(bookingDetails.endTime);

                const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                const sessionData = {
                    sessionId,
                    expertId: bookingDetails.expertId,
                    candidateId: bookingDetails.candidateId,
                    startTime,
                    endTime,
                    topics: bookingDetails.topics || ["General Mock Interview"],
                    price: bookingDetails.price,
                    status: 'confirmed',
                    duration: bookingDetails.duration || 60,
                    notes: bookingDetails.notes || ""
                };

                try {
                    const expert = await ExpertDetails.findOne({ $or: [{ _id: bookingDetails.expertId }, { userId: bookingDetails.expertId }] });
                    sessionData.meetingLink = expert?.availability?.defaultMeetingLink || null;
                } catch (_) {}

                const session = await sessionService.createSession(sessionData);

                return res.status(200).json({
                    success: true,
                    message: 'Payment verified and session created successfully',
                    data: session,
                    sessionId: session.sessionId
                });
            }

            res.status(200).json({
                success: true,
                message: 'Payment verified successfully (No booking details provided)',
            });
        } else {
            res.status(400).json({
                success: false,
                message: 'Invalid signature sent!',
            });
        }
    } catch (error) {
        console.error('Razorpay Verify Payment Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to verify payment',
            error: error.message,
        });
    }
};

/**
 * Premium members booking with their free credits.
 */
export const usePremiumCredit = async (req, res) => {
    try {
        const { bookingDetails } = req.body;
        const userId = bookingDetails.candidateId;

        const user = await User.findById(userId);
        if (!user || !user.isPremium || user.freeInterviewsCount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Insufficient free credits or not a premium member.'
            });
        }

        // Decrement credit
        user.freeInterviewsCount -= 1;
        await user.save();

        const startTime = new Date(bookingDetails.startTime);
        const endTime = new Date(bookingDetails.endTime);
        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const sessionData = {
            sessionId,
            expertId: bookingDetails.expertId,
            candidateId: bookingDetails.candidateId,
            startTime,
            endTime,
            topics: Array.isArray(bookingDetails.topics) ? bookingDetails.topics : ["Mock Interview"],
            price: 0,
            status: 'confirmed',
            duration: bookingDetails.duration || 60,
            notes: "Premium Free Credit Used",
        };

        try {
            const expert = await ExpertDetails.findOne({ $or: [{ _id: bookingDetails.expertId }, { userId: bookingDetails.expertId }] });
            sessionData.meetingLink = expert?.availability?.defaultMeetingLink || null;
        } catch (_) {}

        const session = await sessionService.createSession(sessionData);

        return res.status(200).json({
            success: true,
            message: 'Session booked successfully using premium credit!',
            data: session,
            sessionId: session.sessionId,
            remainingCredits: user.freeInterviewsCount
        });
    } catch (error) {
        console.error('Use Premium Credit Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to book session with credit',
            error: error.message
        });
    }
};

/**
 * Create a session without payment when a valid free promo code is applied.
 * Expects same bookingDetails shape as verify-payment (startTime, endTime, expertId, candidateId, topics, duration, etc.).
 */
export const createFreeBooking = async (req, res) => {
    try {
        const { bookingDetails } = req.body;

        if (!bookingDetails?.expertId || !bookingDetails?.candidateId || !bookingDetails?.startTime || !bookingDetails?.endTime) {
            return res.status(400).json({
                success: false,
                message: 'Missing required booking details (expertId, candidateId, startTime, endTime)',
            });
        }

        const startTime = new Date(bookingDetails.startTime);
        const endTime = new Date(bookingDetails.endTime);

        const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const sessionData = {
            sessionId,
            expertId: bookingDetails.expertId,
            candidateId: bookingDetails.candidateId,
            startTime,
            endTime,
            topics: Array.isArray(bookingDetails.topics) && bookingDetails.topics.length
                ? bookingDetails.topics
                : [bookingDetails?.skill || bookingDetails?.category || 'General Mock Interview'],
            price: 0,
            status: 'confirmed',
            duration: bookingDetails.duration || 60,
            notes: bookingDetails.notes || 'Booked with free promo code',
        };

        try {
            const expert = await ExpertDetails.findOne({ $or: [{ _id: bookingDetails.expertId }, { userId: bookingDetails.expertId }] });
            sessionData.meetingLink = expert?.availability?.defaultMeetingLink || null;
        } catch (_) {}

        const session = await sessionService.createSession(sessionData);

        return res.status(200).json({
            success: true,
            message: 'Free booking created successfully',
            data: session,
            sessionId: session.sessionId,
        });
    } catch (error) {
        console.error('Create Free Booking Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create free booking',
            error: error.message,
        });
    }
};

/**
 * Handle 100% free premium subscriptions (e.g. 100% promo codes).
 */
export const createFreeSubscription = async (req, res) => {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User ID is required' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                isPremium: true,
                freeInterviewsCount: 3,
                premiumExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year
            },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Free Premium Subscription Activated!',
            user: updatedUser
        });
    } catch (error) {
        console.error('Create Free Subscription Error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to create free subscription',
            error: error.message,
        });
    }
};
