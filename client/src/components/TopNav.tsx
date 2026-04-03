// src/components/TopNav.tsx
import { useState, useRef, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from '../lib/axios';
import { useAuth } from "../context/AuthContext";
import { getProfileImageUrl } from "../lib/imageUtils";
import {
  Bell,
  Menu,
  User,
  Settings,
  LogOut,
  CreditCard,
  Calendar,
  Search,
  HelpCircle
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

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  const markAsRead = async (id: string) => {
    try {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
      await axios.post(`/api/notifications/${id}/read`);
    } catch (err) {
      console.error("Failed to mark notification read", err);
      fetchNotifications();
    }
  };

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

  const avatarSrc = getProfileImageUrl(user?.profileImage || (user as any)?.photoUrl);

  return (
    <header className="h-[80px] w-full bg-white border-b border-gray-100 px-6 flex items-center justify-between sticky top-0 z-40">
      <div className="flex items-center gap-4 flex-1">
        <button onClick={onOpenSidebar} className="xl:hidden p-2 text-gray-500 hover:text-blue-600 rounded-lg">
          <Menu size={24} />
        </button>

        <div className="hidden md:flex items-center bg-[#f8faff] border border-gray-100 rounded-2xl px-5 py-3 w-[460px] max-w-full group focus-within:ring-2 focus-within:ring-[#3b5cf1]/20 focus-within:border-[#3b5cf1]/30 transition-all">
          <Search size={18} className="text-[#9ca3af] mr-3" />
          <input
            type="text"
            placeholder="Search sessions, candidates..."
            className="bg-transparent border-none outline-none text-[14px] text-gray-700 w-full placeholder:text-[#9ca3af] font-medium"
          />
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              setIsNotificationsOpen((s) => !s);
              setIsProfileOpen(false);
              if (!isNotificationsOpen && user) fetchNotifications();
            }}
            className="text-[#9ca3af] hover:text-[#3b5cf1] transition-colors relative"
            aria-label="Notifications"
          >
            <Bell size={22} strokeWidth={2} />
            {unreadCount > 0 && (
               <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] rounded-full h-4 w-4 flex items-center justify-center font-bold border-2 border-white">
                 {unreadCount > 9 ? '9+' : unreadCount}
               </span>
            )}
          </button>
          
          {isNotificationsOpen && (
             <div className="absolute right-0 mt-4 w-80 bg-white border border-gray-100 rounded-xl shadow-xl z-50">
                <div className="px-4 py-3 border-b border-gray-50 flex justify-between items-center">
                  <h3 className="font-semibold text-gray-900 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={markAllAsRead} className="text-xs text-blue-600 font-medium">Mark all read</button>
                  )}
                </div>
                <div className="max-h-96 overflow-y-auto">
                    {loadingNotifications ? (
                      <div className="p-4 text-center text-sm text-gray-400">Loading...</div>
                    ) : notifications.length === 0 ? (
                      <div className="p-8 text-center text-sm text-gray-400">No new notifications</div>
                    ) : (
                      notifications.map(n => (
                         <div key={n.id} onClick={() => markAsRead(n.id)} className="px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer">
                            <p className="text-sm font-medium">{n.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                         </div>
                      ))
                    )}
                </div>
             </div>
          )}
        </div>

        <button className="text-[#9ca3af] hover:text-[#3b5cf1] transition-colors">
          <HelpCircle size={22} strokeWidth={2} />
        </button>

        {/* Separator */}
        <div className="w-px h-8 bg-gray-200 mx-2"></div>

        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setIsProfileOpen((s) => !s);
              setIsNotificationsOpen(false);
            }}
            className="flex items-center space-x-3 text-left"
          >
            <div className="hidden md:flex flex-col items-end">
              <p className="text-[14px] font-bold text-[#111827] leading-none mb-1">
                {user?.name || "Mockeefy"}
              </p>
              <p className="text-[11px] font-medium text-[#64748b] leading-none">
                {user?.userType === 'expert' ? "Expert Reviewer" : "User"}
              </p>
            </div>
            <div className="w-10 h-10 rounded-[14px] bg-[#eef2ff] text-[#3b5cf1] flex items-center justify-center overflow-hidden">
               {user?.profileImage || (user as any)?.photoUrl ? (
                  <img src={avatarSrc} alt="profile" className="w-full h-full object-cover" />
               ) : (
                  <User size={20} strokeWidth={2} />
               )}
            </div>
          </button>

          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-xl shadow-xl z-50 overflow-hidden py-1">
              <div className="px-4 py-3 border-b border-gray-50 flex items-center gap-3">
                 <div className="w-9 h-9 shrink-0 rounded-lg bg-[#eef2ff] flex justify-center items-center text-[#3b5cf1]">
                    {user?.profileImage ? <img src={avatarSrc} className="w-full h-full object-cover rounded-lg" /> : <User size={18}/>}
                 </div>
                 <div className="overflow-hidden">
                   <p className="font-bold text-gray-900 text-[14px] truncate">{user?.name}</p>
                   <p className="text-[12px] text-gray-500 truncate">{user?.email}</p>
                 </div>
              </div>
              
              <div className="py-2">
                <Link to="/dashboard/profile" onClick={closeAllDropdowns} className="flex items-center px-4 py-2 hover:bg-gray-50 text-[13px] font-medium text-gray-700">
                  <User size={16} className="mr-3 text-gray-400" /> Profile Settings
                </Link>
                <Link to="/dashboard/sessions" onClick={closeAllDropdowns} className="flex items-center px-4 py-2 hover:bg-gray-50 text-[13px] font-medium text-gray-700">
                  <Calendar size={16} className="mr-3 text-gray-400" /> My Sessions
                </Link>
                <Link to="/dashboard/settings" onClick={closeAllDropdowns} className="flex items-center px-4 py-2 hover:bg-gray-50 text-[13px] font-medium text-gray-700">
                  <Settings size={16} className="mr-3 text-gray-400" /> Settings
                </Link>
              </div>

              <div className="border-t border-gray-50 py-1">
                <button onClick={() => { handleSignOut(); closeAllDropdowns(); }} className="flex w-full items-center px-4 py-2 text-red-600 hover:bg-red-50 text-[13px] font-medium">
                  <LogOut size={16} className="mr-3" /> Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
