import { useState, useEffect, useRef } from "react";
import { Button } from "./ui/button";
import { Link, useLocation } from "react-router-dom";
import axios from '../lib/axios';
import {
  Bell,
  Users,
  Calendar,
  X,
  Menu,
  LogOut,
  User,
  Settings,
  BookOpen,
  HelpCircle,
  ChevronDown,
  Bot,
  Sparkles,
  Bookmark,
  Award,
  Crown
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { getProfileImageUrl } from "../lib/imageUtils";
import { useUserProfile } from "../hooks/useUserProfile";
import MockeefyLogo from "./MockeefyLogo";
import Avatar from "./ui/avatar";

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

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const menuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  const { user, logout } = useAuth();
  const { data: userProfile } = useUserProfile();
  const profileImage = user?.profileImage || userProfile?.data?.profileImage;

  // Fetch Notifications
  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const res = await axios.get('/api/notifications?unreadOnly=true');
      setNotifications(res.data.notifications);
      setUnreadCount(res.data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, [user]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (moreMenuRef.current && !moreMenuRef.current.contains(target)) {
        setIsMoreOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAsRead = async (id: string) => {
    try {
      await axios.put('/api/notifications/read', { notificationIds: [id] });
      setNotifications(prev => prev.filter(n => n._id !== id));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark read", error);
    }
  };

  const markAllRead = async () => {
    try {
      await axios.put('/api/notifications/read', { notificationIds: 'all' });
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all read", error);
    }
  };

  useEffect(() => {
    closeAllDropdowns();
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target) && isMenuOpen) setIsMenuOpen(false);
      if (profileMenuRef.current && !profileMenuRef.current.contains(target)) setIsProfileMenuOpen(false);
      if (notificationRef.current && !notificationRef.current.contains(target)) setIsNotificationOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    setIsNotificationOpen(false);
    setIsProfileMenuOpen(false);
    setIsMoreOpen(false);
  };

  const closeAllDropdowns = () => {
    setIsNotificationOpen(false);
    setIsProfileMenuOpen(false);
    setIsMenuOpen(false);
    setIsMoreOpen(false);
  };

  const navItems = [
    { name: "Mock Interview", href: "/", icon: <Users size={16} /> },
    { name: "My Sessions", href: "/my-sessions", icon: <Calendar size={16} /> },
  ];

  const moreItems = [
    { name: "Profile", href: "/profile", icon: <User size={16} /> },
    { name: "Interview tips", href: "/tips", icon: <BookOpen size={16} /> },
    { name: "Saved Experts", href: "/saved-experts", icon: <Bookmark size={16} /> },
    { name: "Certificates", href: "/certificates", icon: <Award size={16} /> },
  ];

  const sidebarNavItems = user ? [
    { name: "Interview tips", href: "/tips", icon: <BookOpen size={16} /> },
    { name: "Saved Experts", href: "/saved-experts", icon: <Bookmark size={16} /> },
    { name: "Certificates", href: "/certificates", icon: <Award size={16} /> },
  ] : [];

  const profileMenuItems = [
    { name: "Profile Settings", href: "/profile", icon: <User size={16} /> },
    { name: "Settings", href: "/settings", icon: <Settings size={16} /> },
    { name: "Resume", href: "/resume", icon: <BookOpen size={16} /> },
    { name: "Help & Support", href: "/help", icon: <HelpCircle size={16} /> },
  ];

  return (
    <>
      <nav
        ref={menuRef}
        className="bg-white/90 backdrop-blur-xl border-b border-slate-200/70 sticky top-0 z-[100] w-full h-[68px] transition-all duration-300 shadow-[0_2px_18px_-8px_rgba(0,0,0,0.10)]"
      >
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex items-center justify-between h-full gap-3">
            {/* Left: Logo */}
            <Link
              to="/"
              className="flex items-center gap-2.5 group active:scale-95 transition-transform shrink-0"
              onClick={closeAllDropdowns}
            >
              <MockeefyLogo className="h-9 w-9" variant="brand" />
              <span className="text-[18px] font-logo tracking-tight text-elite-blue group-hover:text-blue-700 transition-colors">
                Mockeefy
              </span>
            </Link>

            {/* Center: Nav pill (includes More) */}
            <div className="hidden md:flex flex-1 items-center justify-center">
              <div className="flex items-center gap-1.5 bg-slate-50/80 border border-slate-200/60 rounded-2xl p-1">
                {navItems.map((item) => {
                  const isActive = location.pathname === item.href || (location.pathname.startsWith(item.href) && item.href !== "/");

                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-2xl whitespace-nowrap ${isActive
                        ? "text-elite-blue bg-white shadow-sm border border-slate-200/70"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                        }`}
                      onClick={closeAllDropdowns}
                    >
                      <span className={`${isActive ? "text-elite-blue" : "text-slate-400 group-hover:text-slate-900"}`}>
                        {item.icon}
                      </span>
                      {item.name}
                    </Link>
                  );
                })}

                {/* More dropdown */}
                <div className="relative" ref={moreMenuRef}>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMoreOpen((v) => !v);
                      setIsProfileMenuOpen(false);
                      setIsNotificationOpen(false);
                    }}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-2xl whitespace-nowrap ${
                      isMoreOpen
                        ? "text-elite-blue bg-white shadow-sm border border-slate-200/70"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
                    }`}
                  >
                    More
                    <ChevronDown size={14} className={`transition-transform duration-300 ${isMoreOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isMoreOpen && (
                    <div className="absolute left-0 mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="p-1.5 space-y-0.5">
                        {moreItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="flex items-center px-3.5 py-2.5 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-sm font-medium transition-all"
                            onClick={closeAllDropdowns}
                          >
                            <span className="mr-3 text-slate-400">{item.icon}</span>
                            {item.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right side: Actions */}
            <div className="hidden md:flex items-center space-x-1 lg:space-x-3">

              {/* Notifications */}
              <div className="relative" ref={notificationRef}>
                <button
                  onClick={() => {
                    setIsNotificationOpen(!isNotificationOpen);
                    setIsProfileMenuOpen(false);
                    if (!isNotificationOpen) fetchNotifications();
                  }}
                  className="p-2.5 text-slate-400 hover:text-slate-900 rounded-xl hover:bg-slate-50 transition-all active:scale-95 relative"
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 bg-elite-blue text-white text-[8px] rounded-full h-3.5 w-3.5 flex items-center justify-center font-black border-2 border-white">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {isNotificationOpen && (
                  <div className="absolute right-0 mt-3 w-80 bg-white border border-slate-200 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <h3 className="font-semibold text-slate-900 text-sm tracking-tight">Notifications</h3>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-xs text-elite-blue hover:text-blue-700 font-semibold">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="p-10 text-center">
                          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3">
                            <Bell className="w-5 h-5 text-slate-200" />
                          </div>
                          <p className="text-slate-400 text-[10px] font-bold tracking-tight">All Clear</p>
                        </div>
                      ) : (
                        notifications.map((notification) => (
                          <div
                            key={notification._id}
                            className={`px-4 py-3.5 border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50/30' : ''}`}
                            onClick={() => markAsRead(notification._id)}
                          >
                            <p className="font-black text-slate-800 text-[11px] tracking-tight">{notification.title}</p>
                            <p className="text-slate-500 text-[10px] mt-1 line-clamp-2 leading-relaxed">{notification.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="h-6 w-px bg-slate-200 mx-2"></div>

              {/* Profile / Auth */}
              {user ? (
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => {
                      setIsProfileMenuOpen(!isProfileMenuOpen);
                      setIsNotificationOpen(false);
                    }}
                    className="flex items-center space-x-2.5 pl-2 pr-1.5 py-1.5 rounded-2xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-200 group"
                  >
                    <div className="flex flex-col text-right hidden lg:block">
                      <p className="text-sm font-semibold text-slate-900 leading-none tracking-tight">
                        {user.name?.split(" ")[0] || "User"}
                      </p>
                      {user.isPremium ? (
                        <div className="flex items-center justify-end mt-1 gap-1 text-[11px] font-bold text-[#004fcb]">
                          <Crown size={10} /> Premium
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 mt-1">Member</p>
                      )}
                    </div>
                    <div className="w-8 h-8 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden ring-2 ring-transparent group-hover:ring-blue-100/50 transition-all">
                      <Avatar name={user?.name} src={profileImage} className="w-full h-full" />
                    </div>
                    <ChevronDown size={14} className={`text-slate-400 transition-transform duration-300 ${isProfileMenuOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isProfileMenuOpen && (
                    <div className="absolute right-0 mt-3 w-64 bg-white border border-slate-200 rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                      <div className="px-4 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200 shadow-sm">
                          <Avatar name={user?.name} src={profileImage} className="w-full h-full" />
                        </div>
                        <div className="overflow-hidden">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-slate-900 text-sm truncate tracking-tight">{user.name}</p>
                            {user.isPremium && (
                              <Crown size={12} className="text-[#004fcb] shrink-0 fill-current opacity-80" />
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5 tracking-tighter">{user.email}</p>
                        </div>
                      </div>
                      <div className="p-1.5 space-y-0.5">
                        {profileMenuItems.map((item) => (
                          <Link
                            key={item.name}
                            to={item.href}
                            className="flex items-center px-3.5 py-2.5 rounded-xl hover:bg-slate-50 text-slate-600 hover:text-slate-900 text-sm font-medium transition-all"
                            onClick={closeAllDropdowns}
                          >
                            <span className="mr-3 text-slate-400 transition-colors group-hover:text-elite-blue">{item.icon}</span>
                            {item.name}
                          </Link>
                        ))}
                      </div>
                      <div className="border-t border-slate-100 mt-1.5 px-1.5 py-1.5">
                        <button
                          onClick={() => { logout(); closeAllDropdowns(); }}
                          className="flex w-full items-center px-3.5 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-medium transition-all"
                        >
                          <LogOut size={16} className="mr-3" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/signin">
                    <Button variant="ghost" className="text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-50 rounded-xl">Log in</Button>
                  </Link>
                  <Link to="/signup">
                    <Button className="h-10 px-6 bg-elite-blue hover:bg-blue-600 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-500/10">Get started</Button>
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Toggle */}
            <div className="md:hidden flex items-center gap-2">
              <button onClick={toggleMenu} className="p-2.5 text-slate-900 hover:bg-slate-50 rounded-xl transition-colors">
                {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-[68px] left-0 w-full bg-white border-b border-slate-200 shadow-2xl z-[90] animate-in slide-in-from-top-4 duration-300">
            <div className="p-4 space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent active:border-slate-100 transition-all"
                  onClick={closeAllDropdowns}
                >
                  <span className="mr-3 text-slate-400">{item.icon}</span>
                  {item.name}
                </Link>
              ))}
              {sidebarNavItems.length > 0 && (
                <>
                  <div className="h-px bg-slate-100 my-3 mx-2" />
                  <p className="px-4 text-[10px] font-black text-slate-400 uppercase tracking-wider">Dashboard</p>
                  {sidebarNavItems.map((item) => (
                    <Link
                      key={item.name}
                      to={item.href}
                      className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 border border-transparent active:border-slate-100 transition-all"
                      onClick={closeAllDropdowns}
                    >
                      <span className="mr-3 text-slate-400">{item.icon}</span>
                      {item.name}
                    </Link>
                  ))}
                </>
              )}
              <div className="h-px bg-slate-100 my-3 mx-2"></div>
              {user ? (
                <>
                  <Link to="/profile" className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-all" onClick={closeAllDropdowns}>
                    <span className="mr-3 text-slate-400"><User size={18} /></span> Profile Setting
                  </Link>
                  <button onClick={() => { logout(); closeAllDropdowns(); }} className="flex w-full items-center gap-3 px-4 py-3.5 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-medium transition-all">
                    <span className="mr-3"><LogOut size={18} /></span> Sign out
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link to="/signin" onClick={closeAllDropdowns}>
                    <Button variant="outline" className="w-full text-sm font-medium rounded-xl">Log in</Button>
                  </Link>
                  <Link to="/signup" onClick={closeAllDropdowns}>
                    <Button className="w-full bg-elite-blue text-white text-sm font-semibold rounded-xl">Get started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
      {/* Overlay */}
      {isMenuOpen && <div className="fixed inset-0 bg-black/10 backdrop-blur-sm z-30 md:hidden animate-in fade-in duration-300" onClick={() => setIsMenuOpen(false)} />}
    </>
  );
};

export default Navigation;