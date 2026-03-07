// src/components/TopNav.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from '../lib/axios';
import { useAuth } from "../context/AuthContext";
import { getProfileImageUrl } from "../lib/imageUtils";
import {
  Bell,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
  CreditCard,
  Calendar
} from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: "info" | "success" | "warning" | "error";
}

export default function TopNav({ onOpenSidebar }: { onOpenSidebar?: () => void }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const profileRef = useRef<HTMLDivElement | null>(null);

  // Cast to specific ID type if needed, but here simple length check
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetch notifications for logged in user
  const fetchNotifications = useCallback(async () => {
    if (!user) return;
    try {
      setLoadingNotifications(true);
      const res = await axios.get(`/api/notifications`);
      setNotifications(res.data.notifications || []);
    } catch (err) {
      console.error("Failed to fetch notifications", err);
    } finally {
      setLoadingNotifications(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) fetchNotifications();
    else setNotifications([]);
  }, [user, fetchNotifications]);

  // Click outside & Escape close handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (notificationsRef.current && !notificationsRef.current.contains(target)) {
        setIsNotificationsOpen(false);
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setIsProfileOpen(false);
      }
    }
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsNotificationsOpen(false);
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Mark a single notification as read
  const markAsRead = async (id: string) => {
    try {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      await axios.post(`/api/notifications/${id}/read`);
    } catch (err) {
      console.error("Failed to mark notification read", err);
      fetchNotifications();
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      await axios.post(`/api/notifications/mark-all-read`);
    } catch (err) {
      console.error("Failed to mark all read", err);
      fetchNotifications();
    }
  };

  const handleSignOut = () => {
    logout();
    navigate("/signin", { replace: true });
  };

  const closeAllDropdowns = () => {
    setIsNotificationsOpen(false);
    setIsProfileOpen(false);
  };

  // Enhanced Notification Icon Helper
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />;
      case "warning":
        return <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />;
      case "error":
        return <div className="w-2 h-2 rounded-full bg-red-500 mt-2" />;
      default:
        return <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />;
    }
  };

  const avatarSrc = getProfileImageUrl(user?.profileImage || (user as any)?.photoUrl);

  return (
    <header className="h-[80px] w-full bg-white border-b border-blue-100/50 px-4 sm:px-6 lg:px-8 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button - Using consistent styling */}
        <button
          onClick={onOpenSidebar}
          className="lg:hidden p-2 text-slate-500 hover:text-[#004fcb] hover:bg-blue-50 rounded-lg transition-colors duration-200"
          aria-label="Open sidebar"
        >
          <Menu size={24} />
        </button>

        {/* Optional: Breadcrumbs or Page Title could go here safely */}
      </div>

      <div className="flex items-center space-x-2 lg:space-x-4">
        {/* Notifications */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              setIsNotificationsOpen((s) => !s);
              setIsProfileOpen(false);
              if (!isNotificationsOpen && user) fetchNotifications();
            }}
            className="p-2 text-slate-500 hover:text-[#004fcb] rounded-lg hover:bg-blue-50 transition-all active:scale-95"
            aria-label="Notifications"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-[#004fcb] text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold border-2 border-white">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && (
            <div className="absolute right-0 mt-3 w-80 bg-white border border-blue-100 rounded-xl shadow-xl z-50 overflow-hidden ring-1 ring-black/5">
              <div className="px-4 py-3 border-b border-blue-50 bg-slate-50/50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                {unreadCount > 0 && (
                  <button onClick={markAllAsRead} className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                    Mark all read
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto">
                {loadingNotifications ? (
                  <div className="px-4 py-6 text-center text-slate-400 text-sm">Loading...</div>
                ) : notifications.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-sm">No new notifications</div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 border-b border-slate-50 hover:bg-blue-50/50 cursor-pointer transition-colors ${!notification.read ? 'bg-blue-50/20' : ''}`}
                      onClick={() => markAsRead(notification.id)}
                    >
                      <div className="flex items-start gap-3">
                        {getNotificationIcon(notification.type)}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-800">{notification.title}</p>
                          <p className="text-xs text-slate-500 mt-1 truncate">{notification.message}</p>
                          <p className="text-[10px] text-slate-400 mt-1">{notification.time}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="px-4 py-2 border-t border-slate-50 bg-slate-50/30">
                <Link to="/notifications" onClick={closeAllDropdowns} className="w-full block text-center text-xs font-medium text-blue-600 hover:text-blue-700 py-1">
                  View all
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Separator */}
        <div className="h-6 w-px bg-gray-200 mx-2"></div>

        {/* Profile Dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setIsProfileOpen((s) => !s);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center space-x-3 p-1 rounded-xl hover:bg-blue-50 transition-all border border-transparent hover:border-blue-100 group"
          >
            <div className="w-9 h-9 rounded-lg bg-blue-100 border border-blue-200 overflow-hidden">
              <img
                src={avatarSrc}
                alt="profile"
                className="w-full h-full object-cover"
                onError={(e) => { e.currentTarget.src = getProfileImageUrl(null); }}
              />
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-sm font-semibold text-slate-700 leading-none group-hover:text-[#004fcb] transition-colors">
                {user?.name?.split(" ")[0] || "User"}
              </p>
            </div>
            <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isProfileOpen ? "rotate-180" : ""}`} />
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-64 bg-white border border-blue-100 rounded-xl shadow-xl py-2 z-50 ring-1 ring-black/5">
              <div className="px-4 py-3 border-b border-blue-50 bg-slate-50/50 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-slate-200 overflow-hidden">
                  <img
                    src={avatarSrc}
                    alt="p"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = getProfileImageUrl(null) }}
                  />
                </div>
                <div className="overflow-hidden">
                  <p className="font-bold text-slate-800 text-sm truncate">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>

              {user?.userType === "expert" && (
                <div className="py-2">
                  <Link
                    to="/dashboard/profile" // Fixed path to match updated routing
                    className="flex items-center px-4 py-2.5 hover:bg-blue-50 text-slate-600 hover:text-[#004fcb] text-sm font-medium transition-colors"
                    onClick={closeAllDropdowns}
                  >
                    <User size={18} className="mr-3 text-slate-400" />
                    Profile Settings
                  </Link>
                  <Link
                    to="/dashboard/sessions"
                    className="flex items-center px-4 py-2.5 hover:bg-blue-50 text-slate-600 hover:text-[#004fcb] text-sm font-medium transition-colors"
                    onClick={closeAllDropdowns}
                  >
                    <Calendar size={18} className="mr-3 text-slate-400" />
                    My Sessions
                  </Link>
                  {/* Availability Link removed from sidebar but kept here optionally or remove if desired. 
                       User asked to remove from sidebar, keeping consistent might mean removing here too if redundancy is bad.
                       For now, I'll keep generic settings or payments links. */}
                  <Link
                    to="/payment"
                    className="flex items-center px-4 py-2.5 hover:bg-blue-50 text-slate-600 hover:text-[#004fcb] text-sm font-medium transition-colors"
                    onClick={closeAllDropdowns}
                  >
                    <CreditCard size={18} className="mr-3 text-slate-400" />
                    Payments
                  </Link>
                </div>
              )}

              {/* Admin specific links or General Settings */}
              <div className="py-1">
                <Link
                  to={user?.userType === 'expert' ? "/dashboard/settings" : "/settings"}
                  className="flex items-center px-4 py-2.5 hover:bg-blue-50 text-slate-600 hover:text-[#004fcb] text-sm font-medium transition-colors"
                  onClick={closeAllDropdowns}
                >
                  <Settings size={18} className="mr-3 text-slate-400" />
                  Settings
                </Link>
              </div>

              <div className="border-t border-blue-50 mt-1 px-2 py-2">
                <button
                  onClick={() => { handleSignOut(); closeAllDropdowns(); }}
                  className="flex w-full items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg text-sm font-medium transition-colors"
                >
                  <LogOut size={16} className="mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
