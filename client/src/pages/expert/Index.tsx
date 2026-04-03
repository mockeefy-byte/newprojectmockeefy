import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import axios from "../../lib/axios";
import {
  Activity,
  CalendarDays,
  FileText,
  DollarSign,
  Clock,
  User,
  Award,
  ChevronRight,
  Info,
  ArrowUpRight,
  Sparkles
} from "lucide-react";

// --- Sub Components ---

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  trendText?: React.ReactNode;
  trendColor?: string;
  trendHighlight?: string;
}

function StatCard({ title, value, icon, iconBg, trendText, trendColor, trendHighlight }: StatCardProps) {
  return (
    <div className="group bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 hover:ring-1 hover:ring-blue-400 transition-all duration-300 flex flex-col min-w-0 h-[160px]">
      <div className="flex justify-between items-start mb-6">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-2">{title}</p>
          <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{value}</h3>
        </div>
        <div className={`p-3 rounded-xl ${iconBg} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
          {icon}
        </div>
      </div>
      <div className="mt-auto pt-4 border-t border-slate-50">
        {trendHighlight ? (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-md inline-block ${trendHighlight} ${trendColor}`}>
            {trendText}
          </span>
        ) : (
          <span className={`text-sm font-medium ${trendColor}`}>
            {trendText}
          </span>
        )}
      </div>
    </div>
  );
}

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
}

function QuickActionCard({ title, description, icon, onClick }: QuickActionCardProps) {
  return (
    <button onClick={onClick} className="w-full group flex items-center justify-between p-4 bg-white border border-slate-200 rounded-2xl hover:border-blue-300 hover:shadow-md hover:ring-2 hover:ring-blue-50 transition-all duration-300 text-left">
      <div className="flex items-center gap-4">
        <div className="p-3 bg-slate-50 text-slate-600 rounded-xl shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 shadow-sm">
          {icon}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-0.5 group-hover:text-blue-600 transition-colors">{title}</h4>
          <p className="text-xs text-slate-500">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
    </button>
  );
}

// --- Main Page Component ---

export default function DashboardIndex() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalSessions: 0,
    upcomingSessions: 0,
    reportsPending: 0,
    revenue: 0
  });
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Using Promise.allSettled to ensure ui renders even if one endpoint fails
        const [statsRes, sessionsRes] = await Promise.allSettled([
          axios.get('/api/expert/stats'),
          axios.get(`/api/sessions/expert/${user?.id || 'me'}`)
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
          const s = statsRes.value.data.data;
          setStats(prev => ({
            ...prev,
            totalSessions: s.totalSessions ?? 0,
            upcomingSessions: s.upcomingSessions ?? 0,
            // we map todaysBookings from backend to reportsPending for now
            // since backend provides todaysBookings in stats endpoint
            reportsPending: s.todaysBookings ?? 0, 
            revenue: s.revenue ?? 0,
          }));
        }

        if (sessionsRes.status === 'fulfilled' && Array.isArray(sessionsRes.value.data)) {
          const now = new Date();
          const future = sessionsRes.value.data
            .filter((s: any) => new Date(s.startTime) > now && s.status !== 'cancelled')
            .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .slice(0, 5);
          setSessions(future);
        }

      } catch (error) {
        console.error("Dashboard data fetch error", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchData();
  }, [user]);

  const formattedRevenue = `₹${stats.revenue.toLocaleString()}`;

  return (
    <div className="max-w-[1400px] mx-auto space-y-8 bg-white min-h-full font-sans p-4 sm:p-6 lg:p-8">
      
       {/* Page Header */}
       <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
         <div>
           <div className="flex items-center gap-3 mb-2">
             <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Expert Dashboard</h1>
             <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
               <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wide">Active</span>
             </span>
           </div>
           <p className="text-sm sm:text-base text-slate-500">Welcome back, {user?.name || "Mockeefy"}. Here's what's happening today.</p>
         </div>
         
         <div className="flex gap-3 w-full sm:w-auto">
           <button className="flex-1 sm:flex-none px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-sm">
             Download Report
           </button>
           <button className="flex-1 sm:flex-none px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/20">
             New Session
           </button>
         </div>
       </div>

       {/* Informational Banner */}
       <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 sm:p-5 flex gap-4 items-start shadow-sm">
         <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0 mt-0.5">
           <Info className="w-5 h-5" />
         </div>
         <p className="text-sm text-blue-900/80 leading-relaxed">
           <strong className="text-blue-900 font-semibold">How you earn:</strong> The total earnings shown are the sum of your completed session payouts. Each session's value is calculated automatically from your chosen <strong className="text-blue-900 font-semibold">skill category</strong>, your <strong className="text-blue-900 font-semibold">expertise level</strong>, and the session <strong className="text-blue-900 font-semibold">duration</strong>. You can update your skills at any time in the settings.
         </p>
       </div>

       {/* Stats Grid */}
       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
         <StatCard
           title="Total Sessions"
           value={loading ? "..." : stats.totalSessions}
           icon={<Activity className="w-6 h-6" />}
           iconBg="bg-blue-100/50 text-blue-600"
           trendText={
            <span className="flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +12% this month
            </span>
           }
           trendColor="text-emerald-600"
         />
         <StatCard
           title="Upcoming"
           value={loading ? "..." : stats.upcomingSessions}
           icon={<CalendarDays className="w-6 h-6" />}
           iconBg="bg-indigo-100/50 text-indigo-600"
           trendText="Next 7 Days"
           trendColor="text-indigo-700"
           trendHighlight="bg-indigo-50"
         />
         <StatCard
           title="Reports Pending"
           value={loading ? "..." : stats.reportsPending}
           icon={<FileText className="w-6 h-6" />}
           iconBg="bg-amber-100/50 text-amber-600"
           trendText="Requires Action"
           trendColor="text-amber-700"
           trendHighlight="bg-amber-50"
         />
         <StatCard
           title="Total Earnings"
           value={loading ? "..." : formattedRevenue}
           icon={<DollarSign className="w-6 h-6" />}
           iconBg="bg-emerald-100/50 text-emerald-600"
           trendText="Current Month"
           trendColor="text-slate-500"
         />
       </div>

       {/* Bottom Content Grid */}
       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
         
         {/* Main Section: Upcoming Sessions */}
         <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col min-h-[400px]">
           <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-100">
             <div className="flex items-center gap-3">
               <div className="p-2 bg-slate-50 rounded-lg">
                 <Clock className="w-5 h-5 text-slate-700" />
               </div>
               <h2 className="text-lg font-bold text-slate-900">Upcoming Sessions</h2>
             </div>
             <button onClick={() => navigate('/dashboard/sessions')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
               View Schedule
             </button>
           </div>
           
           {/* Upcoming Sessions List / Empty State */}
           {sessions.length === 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center text-center max-w-sm mx-auto">
               <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 border-8 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.05)]">
                 <CalendarDays className="w-8 h-8 text-slate-400" />
               </div>
               <h3 className="text-base font-bold text-slate-900 mb-2">No upcoming sessions</h3>
               <p className="text-sm text-slate-500 mb-6">You don't have any interviews scheduled for the next 7 days. Open more slots to get booked.</p>
               <button onClick={() => navigate('/dashboard/availability')} className="px-5 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-slate-800 transition-colors shadow-md shadow-slate-900/10">
                 Manage Availability
               </button>
             </div>
           ) : (
             <div className="divide-y divide-slate-100">
               {sessions.map((session: any) => (
                 <div key={session._id || session.sessionId} className="py-5 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 -mx-4 px-4 rounded-xl">
                   <div className="flex items-center gap-4">
                     <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg border border-blue-100">
                       {session.candidateId?.name ? session.candidateId.name.charAt(0) : <User size={20} />}
                     </div>
                     <div>
                       <h4 className="font-bold text-slate-900 text-[15px]">{session.candidateId?.name || "Candidate"}</h4>
                       <div className="flex items-center gap-2 text-[12px] font-medium text-slate-500 mt-1">
                         <span>{session.topics?.[0] || "Interview"}</span>
                         <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                         <span>{new Date(session.startTime).toLocaleDateString()}</span>
                         <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                         <span className="text-blue-600 font-semibold">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                       </div>
                     </div>
                   </div>
                   <div className="flex items-center gap-3">
                     <button onClick={() => navigate(`/dashboard/sessions/${session.sessionId}`)} className="text-blue-600 bg-blue-50 hover:bg-blue-100 px-4 py-2 mt-1 rounded-xl font-bold text-[13px] transition-colors">Details</button>
                     <button onClick={() => navigate(`/live-meeting?meetingId=${session.sessionId}`)} className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 mt-1 rounded-xl font-bold text-[13px] transition-colors shadow-sm">
                       Join Call
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           )}
         </div>

         {/* Sidebar Section: Quick Actions */}
         <div className="flex flex-col">
           <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
             <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2">
               <Sparkles className="w-4 h-4 text-blue-500" />
               Quick Actions
             </h3>
             <div className="flex flex-col gap-3">
               <QuickActionCard
                 title="Update Profile"
                 description="Edit your bio & preferences"
                 icon={<User className="w-5 h-5" />}
                 onClick={() => navigate('/dashboard/profile')}
               />
               <QuickActionCard
                 title="Set Availability"
                 description="Manage your calendar slots"
                 icon={<Clock className="w-5 h-5" />}
                 onClick={() => navigate('/dashboard/availability')}
               />
               <QuickActionCard
                 title="Skills & Expertise"
                 description="Add new technical skills"
                 icon={<Award className="w-5 h-5" />}
                 onClick={() => navigate('/dashboard/skills')}
               />
             </div>
           </div>
         </div>

       </div>
    </div>
  );
}
