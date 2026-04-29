
import User from "../models/User.js";

// @desc    Get all users (candidates & experts, excluding admins)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        // Fetch candidate and expert users only, including older mixed-case records.
        const users = await User.find({ userType: { $in: [/^candidate$/i, /^expert$/i] } })
            .select('-password') // Exclude password
            .sort({ createdAt: -1 })
            .lean();

        // Ensure all required fields are present
        const formattedUsers = users.map(user => ({
            _id: user._id,
            name: user.name || 'N/A',
            email: user.email,
            userType: String(user.userType || '').toLowerCase(), // 'candidate' or 'expert'
            status: user.status || 'Active',
            createdAt: user.createdAt,
            joined: user.createdAt, // fallback field
            sessions: user.sessionsCount || 0
        }));

        res.status(200).json({ 
            success: true, 
            count: formattedUsers.length, 
            data: formattedUsers 
        });
    } catch (error) {
        console.error("Error fetching users:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Toggle user status (Active <-> Blocked)
// @route   PUT /api/admin/users/:id/status
// @access  Private/Admin
export const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findOne({
            _id: req.params.id,
            userType: { $in: [/^candidate$/i, /^expert$/i] }
        });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Toggle status
        user.status = user.status === 'Active' ? 'Blocked' : 'Active';
        await user.save();

        res.status(200).json({
            success: true,
            message: `User ${user.status === 'Active' ? 'unblocked' : 'blocked'} successfully`,
            data: { _id: user._id, status: user.status }
        });
    } catch (error) {
        console.error("Error toggling user status:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
