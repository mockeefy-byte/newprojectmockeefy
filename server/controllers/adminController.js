
import User from "../models/User.js";
import Session from "../models/Session.js";
import ExpertDetails from "../models/expertModel.js";
import Withdrawal from "../models/Withdrawal.js";
import BankAccount from "../models/BankAccount.js";
import { processExactPayout } from "./paymentController.js";

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getDashboardStats = async (req, res) => {
    try {
        // Parallel fetching for performance
        const [
            totalExperts,
            totalUsers,
            sessionsBooked,
            pendingExperts,
            activeSessions,
            revenueData,
            recentUsers,
            categoryStats
        ] = await Promise.all([
            // 1. Basic Counts
            User.countDocuments({ userType: /^expert$/i }),
            User.countDocuments({ userType: /^candidate$/i }),
            Session.countDocuments({}),
            ExpertDetails.countDocuments({ status: "pending" }),
            Session.countDocuments({ status: "live" }), // or 'confirmed' depending on definition

            // 2. Revenue Aggregation (Total & Monthly)
            Session.aggregate([
                { $match: { status: { $in: ["completed", "confirmed"] } } }, // Only count valid sessions
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$price" }
                    }
                }
            ]),

            // 3. Recent Activity (Last 5 users)
            User.find({ userType: /^candidate$/i })
                .sort({ createdAt: -1 })
                .limit(5)
                .select("name email userType status createdAt"),

            // 4. Top Categories Distribution
            ExpertDetails.aggregate([
                { $match: { "personalInformation.category": { $exists: true, $ne: null } } },
                {
                    $group: {
                        _id: "$personalInformation.category",
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 5 }
            ])
        ]);

        // Monthly Revenue Data (Mock vs Real Strategy)
        // Ideally we aggregate by month here. For now, we'll send a simplified structure
        // that the frontend can eventually chart.
        // REAL IMPLEMENTATION:
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = await Session.aggregate([
            {
                $match: {
                    status: { $in: ["completed", "confirmed"] },
                    startTime: {
                        $gte: new Date(`${currentYear}-01-01`),
                        $lte: new Date(`${currentYear}-12-31`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$startTime" },
                    revenue: { $sum: "$price" }
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Transform monthly data for frontend [0...11]
        const monthlyRevenueArray = Array(12).fill(0);
        monthlyRevenue.forEach(item => {
            monthlyRevenueArray[item._id - 1] = item.revenue;
        });


        res.status(200).json({
            success: true,
            data: {
                totalExperts,
                totalUsers,
                sessionsBooked,
                pendingExperts,
                activeSessions,
                totalRevenue: revenueData[0]?.totalRevenue || 0,
                recentUsers,
                topCategories: categoryStats.map(cat => ({
                    name: cat._id,
                    count: cat.count
                })),
                chartData: monthlyRevenueArray
            }
        });
    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get all withdrawal requests
// @route   GET /api/admin/withdrawals
// @access  Private/Admin
export const getWithdrawals = async (req, res) => {
    try {
        const withdrawals = await Withdrawal.find().sort({ createdAt: -1 }).populate('userId', 'name email walletBalance');

        const formatted = await Promise.all(withdrawals.map(async (withdrawal) => {
            const bankAccount = await BankAccount.findOne({ userId: withdrawal.userId?._id || withdrawal.userId }).lean();
            return {
                ...withdrawal.toObject(),
                userBankInfo: bankAccount,
            };
        }));

        res.status(200).json({ success: true, withdrawals: formatted });
    } catch (error) {
        console.error("Error fetching withdrawals:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Approve a withdrawal request
// @route   PUT /api/admin/withdrawals/:id/approve
// @access  Private/Admin
export const approveWithdrawal = async (req, res) => {
    try {
        const withdrawal = await Withdrawal.findById(req.params.id).populate('userId', 'name email walletBalance');
        if (!withdrawal) {
            return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
        }
        if (withdrawal.status !== 'initiated') {
            return res.status(400).json({ success: false, message: `Withdrawal already ${withdrawal.status}` });
        }

        withdrawal.status = 'processed';
        withdrawal.referenceId = req.body.referenceId || withdrawal.referenceId || 'Processed by admin';
        await withdrawal.save();

        res.status(200).json({ success: true, withdrawal });
    } catch (error) {
        console.error("Error approving withdrawal:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Reject a withdrawal request and refund the expert wallet
// @route   PUT /api/admin/withdrawals/:id/reject
// @access  Private/Admin
export const rejectWithdrawal = async (req, res) => {
    try {
        const withdrawal = await Withdrawal.findById(req.params.id).populate('userId', 'name email walletBalance');
        if (!withdrawal) {
            return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
        }
        if (withdrawal.status !== 'initiated') {
            return res.status(400).json({ success: false, message: `Withdrawal already ${withdrawal.status}` });
        }

        const user = await User.findById(withdrawal.userId?._id || withdrawal.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: 'Expert user not found' });
        }

        user.walletBalance = Number(user.walletBalance || 0) + withdrawal.amount;
        await user.save();

        withdrawal.status = 'rejected';
        withdrawal.referenceId = req.body.reason || 'Rejected by admin';
        await withdrawal.save();

        res.status(200).json({ success: true, withdrawal });
    } catch (error) {
        console.error("Error rejecting withdrawal:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Retry a failed withdrawal payout
// @route   PUT /api/admin/withdrawals/:id/retryPayout
// @access  Private/Admin
export const retryWithdrawalPayout = async (req, res) => {
    try {
        const withdrawal = await Withdrawal.findById(req.params.id).populate('userId', 'name email walletBalance');
        if (!withdrawal) {
            return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
        }
        
        if (withdrawal.status === 'processed' || withdrawal.status === 'rejected') {
            return res.status(400).json({ success: false, message: `Withdrawal cannot be retried from ${withdrawal.status} status` });
        }

        const payoutResult = await processExactPayout(
            withdrawal.userId._id || withdrawal.userId, 
            withdrawal.amount, 
            withdrawal._id.toString()
        );
        
        if (payoutResult.success) {
            withdrawal.status = 'processed';
            withdrawal.referenceId = payoutResult.payoutId;
            await withdrawal.save();
            
            return res.status(200).json({ 
                success: true, 
                message: 'Payout retry successful',
                withdrawal 
            });
        } else {
            return res.status(400).json({ 
                success: false, 
                message: 'Payout retry failed', 
                reason: payoutResult.reason
            });
        }
    } catch (error) {
        console.error("Error retrying withdrawal payout:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
