import Notification from '../models/Notification.js';

// Get all notifications for a user
export const getNotifications = async (req, res) => {
    try {
        const userId = req.user.userId; // From auth middleware
        const { unreadOnly } = req.query;

        const query = { userId };
        if (unreadOnly === 'true') {
            query.isRead = false;
        }

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 for performance

        const unreadCount = await Notification.countDocuments({ userId, isRead: false });

        res.json({ notifications, unreadCount });
    } catch (error) {
        console.error("Get Notifications Error:", error);
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
};

// Mark as read
export const markAsRead = async (req, res) => {
    try {
        const userId = req.user.userId;
        const { notificationIds } = req.body; // Array of IDs or 'all'

        if (notificationIds === 'all') {
            await Notification.updateMany(
                { userId, isRead: false },
                { isRead: true }
            );
        } else if (Array.isArray(notificationIds) && notificationIds.length > 0) {
            await Notification.updateMany(
                { userId, _id: { $in: notificationIds } },
                { isRead: true }
            );
        }

        res.json({ success: true });
    } catch (error) {
        console.error("Mark Read Error:", error);
        res.status(500).json({ message: "Failed to update notifications" });
    }
};

// Helper to create notification (internal use)
export const createNotification = async ({ userId, type, title, message, metadata }) => {
    try {
        const notification = new Notification({
            userId,
            type,
            title,
            message,
            metadata
        });
        await notification.save();
        return notification;
    } catch (error) {
        console.error("Create Notification Error:", error);
        // Don't throw, just log. Notifications shouldn't break main flow.
    }
};
