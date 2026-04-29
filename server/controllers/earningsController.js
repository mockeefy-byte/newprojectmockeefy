import User from '../models/User.js';
import BankAccount from '../models/BankAccount.js';
import Withdrawal from '../models/Withdrawal.js';
import Session from '../models/Session.js';
import { processExactPayout } from './paymentController.js';
import { notifyWithdrawalSuccess } from '../services/emailService.js';
import { createNotification } from './notificationController.js';

// Get total earnings (current wallet balance) and withdrawal history
export const getEarningsData = async (req, res) => {
  try {
    const userId = req.user.userId; // From verifyToken middleware
    const user = await User.findById(userId).select('walletBalance');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const withdrawals = await Withdrawal.find({ userId }).sort({ createdAt: -1 });

    const pendingSessions = await Session.find({ expertId: userId, status: 'completed', payoutCredited: false }).select('price');
    const pendingCredit = pendingSessions.reduce((sum, session) => sum + ((session.price || 0) * 0.8), 0);

    res.json({
      success: true,
      walletBalance: user.walletBalance,
      pendingCredit,
      withdrawals,
    });
  } catch (error) {
    console.error('Error fetching earnings data:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get saved bank account details
export const getBankAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const bankAccount = await BankAccount.findOne({ userId });
    
    res.json({
      success: true,
      bankAccount,
    });
  } catch (error) {
    console.error('Error fetching bank account:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create or update bank account
export const saveBankAccount = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { accountNumber, ifscCode, bankName, accountHolderName } = req.body;

    if (!accountNumber || !ifscCode || !bankName || !accountHolderName) {
      return res.status(400).json({ success: false, message: 'All bank details are required' });
    }

    let bankAccount = await BankAccount.findOne({ userId });

    if (bankAccount) {
      bankAccount.accountNumber = accountNumber;
      bankAccount.ifscCode = ifscCode;
      bankAccount.bankName = bankName;
      bankAccount.accountHolderName = accountHolderName;
      await bankAccount.save();
    } else {
      bankAccount = await BankAccount.create({
        userId,
        accountNumber,
        ifscCode,
        bankName,
        accountHolderName,
      });
    }

    res.json({
      success: true,
      message: 'Bank account saved successfully',
      bankAccount,
    });
  } catch (error) {
    console.error('Error saving bank account:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Request withdrawal
export const requestWithdrawal = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { amount } = req.body;

    const parsedAmount = parseFloat(amount);
    if (!parsedAmount || parsedAmount < 500) {
      return res.status(400).json({ success: false, message: 'Minimum withdrawal amount is 500' });
    }

    // Check if bank account exists
    const bankAccount = await BankAccount.findOne({ userId });
    if (!bankAccount) {
      return res.status(400).json({ success: false, message: 'Please add a bank account before withdrawing' });
    }

    // Get user wallet
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (user.walletBalance < parsedAmount) {
      return res.status(400).json({ success: false, message: 'Insufficient wallet balance' });
    }

    // Deduct balance and create withdrawal request
    user.walletBalance -= parsedAmount;
    await user.save();

    let withdrawal = await Withdrawal.create({
      userId,
      amount: parsedAmount,
      status: 'initiated',
    });

    // Automatically trigger Razorpay Payout for manual withdrawal
    const payoutResult = await processExactPayout(userId, parsedAmount, withdrawal._id.toString());
    
    if (payoutResult.success) {
      withdrawal.status = 'processed';
      withdrawal.referenceId = payoutResult.payoutId;
      await withdrawal.save();
      
      // Notify via Email
      try {
        const accountLast4 = bankAccount.accountNumber.slice(-4);
        await notifyWithdrawalSuccess(user.email, user.name, parsedAmount, accountLast4);
      } catch(e) {
        console.error("Email for withdrawal failed:", e);
      }

      // In-App Notification
      try {
        await createNotification({
          userId: user._id,
          type: 'withdrawal_processed',
          title: 'Withdrawal Successful',
          message: `Your withdrawal of ₹${parsedAmount} has been processed via Razorpay.`,
          metadata: { withdrawalId: withdrawal._id, amount: parsedAmount }
        });
      } catch(e) {
        console.error("In-app notification for withdrawal failed:", e);
      }
    } else {
      console.warn(`Withdrawal ${withdrawal._id} created but payout failed: ${payoutResult.reason}`);
    }

    res.json({
      success: true,
      message: payoutResult.success ? 'Withdrawal processed successfully' : 'Withdrawal initiated, awaiting processor handling.',
      withdrawal,
      newBalance: user.walletBalance,
      payoutStatus: payoutResult.success ? 'processed' : 'initiated'
    });
  } catch (error) {
    console.error('Error initiating withdrawal:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
