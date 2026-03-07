import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import axios from '../lib/axios';
import { Button } from "../components/ui/button";
import { Bell, Clock, CheckCircle } from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { toast } from "sonner";

interface Notification {
    _id: string;
    type: string;
    title: string;
    message: string;
    isRead: boolean;
    createdAt: string;
    metadata?: {
        link?: string;
    };
}

const Notifications = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            // Fetch ALL notifications (no unreadOnly filter)
            const { data } = await axios.get('/api/notifications');
            setNotifications(data.notifications);
        } catch (error) {
            console.error("Failed to fetch notifications", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [user]);

    const markAsRead = async (id: string, link?: string) => {
        try {
            await axios.put('/api/notifications/read', { notificationIds: [id] });
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));

            if (link) {
                // Navigate or window location
                // window.location.href = link; 
            }
        } catch (error) {
            console.error("Failed to mark read", error);
            toast.error("Failed to update notification");
        }
    };

    const markAllRead = async () => {
        try {
            await axios.put('/api/notifications/read', { notificationIds: 'all' });
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            toast.success("All notifications marked as read");
        } catch (error) {
            console.error("Failed to mark all read", error);
            toast.error("Failed to mark all read");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navigation />

            <main className="flex-grow max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Bell className="w-6 h-6 text-blue-600" />
                            Notifications
                        </h1>
                        <p className="text-gray-500 mt-1">Stay updated with your sessions and activity</p>
                    </div>

                    {notifications.some(n => !n.isRead) && (
                        <Button
                            variant="outline"
                            onClick={markAllRead}
                            className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 border-gray-200"
                        >
                            <CheckCircle className="w-4 h-4" />
                            Mark all read
                        </Button>
                    )}
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white rounded-xl shadow-sm animate-pulse"></div>
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">No notifications yet</h3>
                        <p className="text-gray-500 mt-1">When you get notifications, they'll show up here.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {notifications.map((notification) => (
                            <div
                                key={notification._id}
                                onClick={() => !notification.isRead && markAsRead(notification._id, notification.metadata?.link)}
                                className={`
                  relative group p-4 sm:p-5 rounded-xl border transition-all duration-200 cursor-pointer
                  ${notification.isRead
                                        ? 'bg-white border-gray-100 opacity-75 hover:opacity-100'
                                        : 'bg-white border-blue-100 shadow-sm shadow-blue-50 hover:shadow-md border-l-4 border-l-blue-500'
                                    }
                `}
                            >
                                <div className="flex items-start gap-4">
                                    <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                    ${notification.type === 'info' ? 'bg-blue-100 text-blue-600' :
                                            notification.type === 'success' ? 'bg-green-100 text-green-600' :
                                                notification.type === 'warning' ? 'bg-amber-100 text-amber-600' :
                                                    'bg-gray-100 text-gray-600'
                                        }
                  `}>
                                        <Bell className="w-5 h-5" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className={`text-sm font-semibold mb-1 ${notification.isRead ? 'text-gray-800' : 'text-gray-900'}`}>
                                                {notification.title}
                                            </p>
                                            <span className="text-xs text-gray-400 whitespace-nowrap flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {new Date(notification.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>

                                        <p className="text-sm text-gray-600 leading-relaxed">
                                            {notification.message}
                                        </p>

                                        {notification.metadata?.link && (
                                            <div className="mt-2">
                                                <span className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline">
                                                    View Details &rarr;
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default Notifications;
