
import User from "../models/User.js";
import Session from "../models/Session.js";
import ExpertDetails from "../models/expertModel.js";

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
            User.countDocuments({ userType: "expert" }),
            User.countDocuments({ userType: "candidate" }),
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
            User.find({ userType: "candidate" })
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
