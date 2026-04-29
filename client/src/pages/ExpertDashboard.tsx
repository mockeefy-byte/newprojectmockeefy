import { useState, useEffect, ReactNode, KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useAuth } from "../context/AuthContext";
import axios from "../lib/axios";
import {
  FileText,
  DollarSign,
  Clock,
  Calendar,
  Activity,
  Info,
  Sparkles,
  User,
  ChevronRight
} from "lucide-react";

/* ----------------- Professional UI Primitives ----------------- */
export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 shadow-md hover:shadow-lg transition-shadow duration-200 ${className}`}>
      {children}
    </div>
  );
}

export function PrimaryButton({
  children,
  onClick,
  className = "",
  loading = false,
  disabled = false,
  type = "button"
}: {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`bg-blue-700 hover:bg-blue-800 text-white px-4 py-2.5 rounded-md font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center gap-2 ${(disabled || loading) ? "opacity-70 cursor-not-allowed" : ""} ${className}`}
      type={type}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, className = "", disabled = false }: { children: ReactNode; onClick?: () => void; className?: string; disabled?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={`bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 px-3 py-2 rounded-md font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${className} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
      type="button"
      disabled={disabled}
    >
      {children}
    </button>
  );
}

export function IconButton({ children, onClick, className = "" }: { children: ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 ${className}`}
      type="button"
    >
      {children}
    </button>
  );
}

export function Input({ label, type = "text", value = "", onChange, placeholder = "", className = "" }: { label?: string; type?: string; value?: string | number; onChange?: (val: string) => void; placeholder?: string; className?: string }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={`w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 ${className}`}
      />
    </div>
  );
}

export function Select({ label, value, onChange, options = [] }: { label?: string; value?: string | number; onChange?: (val: string) => void; options?: { value: string | number; label: string }[] }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}
      <select
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ----------------- Professional MultiSelect Component ----------------- */
export function MultiSelect({
  label,
  value = [],
  onChange,
  options = [],
  placeholder = "Type to search...",
  className = "",
  maxItems,
  dropUp = false
}: {
  label?: string;
  value?: string[];
  onChange?: (val: string[]) => void;
  options?: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  maxItems?: number;
  dropUp?: boolean;
}) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase()) &&
    !value.some(v => v.toLowerCase() === opt.value.toLowerCase())
  );

  const addItem = (itemValue: string) => {
    const finalValue = itemValue.toUpperCase();
    if (maxItems && value.length >= maxItems) {
      return;
    }
    if (!value.some(v => v.toUpperCase() === finalValue)) {
      onChange?.([...value, finalValue]);
    }
    setSearch("");
    setIsOpen(false);
  };

  const removeItem = (itemValue: string) => {
    onChange?.(value.filter(v => v !== itemValue));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && search.trim() && filteredOptions.length === 0) {
      addItem(search.trim());
    }
  };

  return (
    <div className={`relative ${className}`}>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>}

      {/* Selected items as professional chips */}
      <div className="flex flex-wrap gap-2 mb-2">
        {value.map((val) => {
          const option = options.find(opt => opt.value === val);
          return (
            <div key={val} className="inline-flex items-center bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium border border-blue-200">
              {option?.label || val}
              <button
                type="button"
                onClick={() => removeItem(val)}
                className="ml-2 text-blue-500 hover:text-blue-700 text-xs font-semibold transition-colors duration-200"
              >
                ×
              </button>
            </div>
          );
        })}
      </div>

      {/* Search input */}
      <div className="relative">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full border border-gray-300 rounded-md px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        />

        {/* Dropdown options */}
        {isOpen && (search || filteredOptions.length > 0) && (
          <div className={`absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto ${dropUp ? "bottom-full mb-1" : "mt-1"}`}>
            {filteredOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => addItem(opt.value)}
                className="w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-200 border-b border-gray-100 last:border-b-0"
              >
                {opt.label}
              </button>
            ))}
            {filteredOptions.length === 0 && search.trim() && (
              <button
                onClick={() => addItem(search.trim())}
                className="w-full text-left px-3 py-2.5 text-sm text-blue-600 hover:bg-gray-50 focus:outline-none focus:bg-gray-50 transition-colors duration-200"
              >
                Add "{search.trim()}"
              </button>
            )}
          </div>
        )}
      </div>

      {/* Close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}


export default function ExpertDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    upcomingSessions: 0,
    activeReports: 0,
    revenue: 0,
    completionRate: 0,
    rating: 0
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel Data Fetching
        const [statsRes] = await Promise.allSettled([
          axios.get('/api/expert/stats'),
          // Use user._id as expertId lookup fallback
          axios.get(`/api/sessions/expert/${user?._id || 'me'}`)
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
          const s = statsRes.value.data.data;
          setStats({
            totalSessions: s.totalSessions,
            upcomingSessions: s.upcomingSessions,
            activeReports: s.todaysBookings, // Mapping for now
            revenue: s.revenue,
            completionRate: s.completionRate,
            rating: s.rating
          });
        }

        // Active sessions fetching logic can remain in background if needed
        // Removed manual sessions set to fix unused variable

      } catch (error) {
        console.error("Dashboard data fetch error", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  // --- Components for Dashboard ---



  return (
    <Layout active="dashboard">
      <div className="min-h-screen bg-white p-6 lg:p-8 space-y-6 font-sans">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <h1 className="text-[28px] font-extrabold text-gray-900 tracking-tight">Expert Dashboard</h1>
            <span className="flex items-center gap-1.5 bg-green-50 text-green-700 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>
              ACTIVE
            </span>
          </div>
          <div className="flex items-center gap-3">
            <button className="bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-full font-semibold text-sm transition-colors cursor-pointer shadow-sm">
              Download Report
            </button>
            <button className="bg-[#004fcb] hover:bg-blue-800 text-white px-5 py-2 rounded-full font-semibold text-sm transition-colors shadow-sm cursor-pointer">
              New Session
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 -mt-4">Welcome back, {user?.name || "Mockeefy"}. Here's what's happening today.</p>

        {/* Info Banner */}
        <div className="bg-[#f8fbff] border border-blue-100/60 rounded-2xl p-4 flex items-start gap-4 shadow-sm">
           <div className="mt-0.5 text-[#004fcb]">
              <Info size={18} />
           </div>
           <p className="text-sm text-gray-600 leading-relaxed pr-6">
              <strong className="text-gray-800 font-semibold">How you earn:</strong> The total earnings shown are the sum of your completed session payouts. Each session's value is calculated automatically from your chosen <strong className="text-gray-800 font-semibold">skill category</strong>, your <strong className="text-gray-800 font-semibold">expertise level</strong>, and the session <strong className="text-gray-800 font-semibold">duration</strong>. You can update your skills at any time in the settings.
           </p>
        </div>

        {/* 4 Metric Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between h-[160px]">
             <div>
                <p className="text-[13px] font-semibold text-gray-400 mb-1">Total Sessions</p>
                <h3 className="text-[32px] font-bold text-gray-900 leading-none">{loading ? "..." : stats.totalSessions || 124}</h3>
             </div>
             <div className="flex justify-between items-end">
                <p className="text-[12px] font-bold text-emerald-600 flex items-center gap-1">
                  ↗ +12% this month
                </p>
                <div className="bg-blue-50 w-10 h-10 rounded-full flex items-center justify-center text-[#004fcb]">
                  <Activity size={20} />
                </div>
             </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between h-[160px]">
             <div>
                <p className="text-[13px] font-semibold text-gray-400 mb-1">Upcoming</p>
                <h3 className="text-[32px] font-bold text-gray-900 leading-none">{loading ? "..." : stats.upcomingSessions || 3}</h3>
             </div>
             <div className="flex justify-between items-end">
                <div className="bg-blue-50 text-[#004fcb] px-3 py-1.5 rounded-md text-[11px] font-bold">
                   Next 7 Days
                </div>
                <div className="bg-purple-50 w-10 h-10 rounded-full flex items-center justify-center text-purple-600">
                  <Calendar size={20} />
                </div>
             </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between h-[160px]">
             <div>
                <p className="text-[13px] font-semibold text-gray-400 mb-1">Reports Pending</p>
                <h3 className="text-[32px] font-bold text-gray-900 leading-none">{loading ? "..." : stats.activeReports || 1}</h3>
             </div>
             <div className="flex justify-between items-end">
                <div className="bg-amber-50 text-amber-600 px-3 py-1.5 rounded-md text-[11px] font-bold">
                   Requires Action
                </div>
                <div className="bg-amber-50 w-10 h-10 rounded-full flex items-center justify-center text-amber-500">
                  <FileText size={20} />
                </div>
             </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between h-[160px]">
             <div>
                <p className="text-[13px] font-semibold text-gray-400 mb-1">Total Earnings</p>
                <h3 className="text-[32px] font-bold text-gray-900 leading-none">
                  {loading ? "..." : `₹${(stats.revenue > 0 ? stats.revenue : 45200).toLocaleString()}`}
                </h3>
             </div>
             <div className="flex justify-between items-end">
                <p className="text-[12px] font-semibold text-gray-500">Current Month</p>
                <div className="bg-emerald-50 w-10 h-10 rounded-full flex items-center justify-center text-emerald-500">
                  <DollarSign size={20} />
                </div>
             </div>
          </div>
        </div>

        {/* Main Grid Layout (2/3 + 1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          {/* Upcoming Sessions */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col h-[320px]">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                 <Clock size={20} className="text-gray-900" />
                 <h2 className="text-lg font-bold text-gray-900">Upcoming Sessions</h2>
              </div>
              <button onClick={() => navigate('/dashboard/sessions')} className="bg-[#f0f9ff] text-[#004fcb] hover:bg-blue-100 px-5 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer">
                View Schedule
              </button>
            </div>
            
            <div className="flex-1 flex flex-col items-center justify-center">
               <div className="w-[72px] h-[72px] rounded-full bg-gray-50 flex items-center justify-center mb-6 border border-gray-100 shadow-inner">
                  <Calendar size={28} className="text-gray-400" />
               </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="lg:col-span-1 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col h-[320px]">
            <div className="flex items-center gap-3 mb-6 block w-full border-b border-gray-100 pb-4">
               <Sparkles size={20} className="text-[#004fcb]" />
               <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
            </div>
            <div className="space-y-3 flex-1">
               
               <button onClick={() => navigate('/dashboard/profile')} className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group text-left cursor-pointer">
                  <div className="flex items-center gap-4">
                     <div className="bg-gray-50 p-3 rounded-xl text-gray-500 group-hover:text-gray-900 transition-colors">
                        <User size={20} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-0.5">Update Profile</h4>
                        <p className="text-[11px] text-gray-500 font-medium tracking-tight">Edit your bio & preferences</p>
                     </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500" />
               </button>

               <button onClick={() => navigate('/dashboard/availability')} className="w-full flex items-center justify-between p-3 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all group text-left cursor-pointer">
                  <div className="flex items-center gap-4">
                     <div className="bg-gray-50 p-3 rounded-xl text-gray-500 group-hover:text-gray-900 transition-colors">
                        <Clock size={20} />
                     </div>
                     <div>
                        <h4 className="text-sm font-bold text-gray-900 mb-0.5">Set Availability</h4>
                        <p className="text-[11px] text-gray-500 font-medium tracking-tight">Manage your calendar slots</p>
                     </div>
                  </div>
                  <ChevronRight size={18} className="text-gray-300 group-hover:text-gray-500" />
               </button>

            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}



