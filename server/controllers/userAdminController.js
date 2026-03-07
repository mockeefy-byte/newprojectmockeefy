
import User from "../models/User.js";

// @desc    Get all users (candidates & experts, excluding admins?)
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        // Fetch all users sorted by creation date
        // You might want to filter out 'admin' type users if desired
        const users = await User.find({ userType: { $ne: 'admin' } })
            .select('-password') // Exclude password
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, count: users.length, data: users });
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
        const user = await User.findById(req.params.id);

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
