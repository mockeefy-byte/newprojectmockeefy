import { useState, useEffect } from "react";
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
  TrendingUp
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function DashboardIndex() {
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
  const [sessions, setSessions] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Parallel Data Fetching
        const [statsRes, sessionsRes] = await Promise.allSettled([
          axios.get('/api/expert/stats'),
          // Use user._id as expertId lookup fallback
          axios.get(`/api/sessions/expert/${user?.id || 'me'}`)
        ]);

        if (statsRes.status === 'fulfilled' && statsRes.value.data.success) {
          const s = statsRes.value.data.data;
          setStats({
            totalSessions: s.totalSessions || 0,
            upcomingSessions: s.upcomingSessions || 0,
            activeReports: s.todaysBookings || 0, // Mapping for now
            revenue: s.revenue || 0,
            completionRate: s.completionRate || 0,
            rating: s.rating || 0
          });
        }

        if (sessionsRes.status === 'fulfilled' && Array.isArray(sessionsRes.value.data)) {
          // Filter future sessions and sort
          const now = new Date();
          const future = sessionsRes.value.data
            .filter((s: any) => new Date(s.startTime) > now && s.status !== 'cancelled')
            .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .slice(0, 5); // Take top 5
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

  // --- Components for Dashboard ---

  const SummaryCard = ({ title, value, icon, sub, colorClass }: any) => (
    <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{loading ? "..." : value}</h3>
        {sub && <p className={`text-xs mt-2 font-medium ${colorClass}`}>{sub}</p>}
      </div>
      <div className={`p-3 rounded-lg ${colorClass} bg-opacity-10`}>
        {icon}
      </div>
    </div>
  );

  const QuickAction = ({ label, icon, to, desc }: any) => (
    <button
      onClick={() => navigate(to)}
      className="w-full text-left p-4 rounded-xl border border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-200 group"
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-blue-50 text-[#004fcb] group-hover:bg-[#004fcb] group-hover:text-white transition-colors">
          {icon}
        </div>
        <span className="font-semibold text-gray-700 group-hover:text-[#004fcb]">{label}</span>
      </div>
      <p className="text-xs text-gray-400 pl-[52px]">{desc}</p>
    </button>
  );

  // Recharts Data
  const activityData = [
    { name: 'Mon', sessions: 2 },
    { name: 'Tue', sessions: 5 },
    { name: 'Wed', sessions: 3 },
    { name: 'Thu', sessions: 4 },
    { name: 'Fri', sessions: 6 },
    { name: 'Sat', sessions: 8 },
    { name: 'Sun', sessions: 4 },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden font-['Inter']">

      {/* Fixed Header Section */}
      <div className="p-6 border-b border-gray-100 bg-white shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Expert Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.name || 'Expert'}. Here is your overview.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 bg-white px-3 py-1.5 rounded-md border border-gray-200 shadow-sm flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Status: Active
            </span>
          </div>
        </div>
      </div>

      {/* Scrollable Body Section */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        <div className="space-y-8">

          {/* 1. Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <SummaryCard
              title="Total Sessions"
              value={stats.totalSessions}
              sub="+12% from last month"
              colorClass="text-blue-600 bg-blue-50"
              icon={<Activity size={24} />}
            />
            <SummaryCard
              title="Upcoming"
              value={stats.upcomingSessions}
              sub="Next 7 Days"
              colorClass="text-purple-600 bg-purple-50"
              icon={<CalendarDays size={24} />}
            />
            <SummaryCard
              title="Reports Pending"
              value={stats.activeReports}
              sub="Needs Attention"
              colorClass="text-orange-600 bg-orange-50"
              icon={<FileText size={24} />}
            />
            <SummaryCard
              title="Total Earnings"
              value={`₹${stats.revenue.toLocaleString()}`}
              sub="Paid monthly"
              colorClass="text-green-600 bg-green-50"
              icon={<DollarSign size={24} />}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT COLUMN (2/3) */}
            <div className="lg:col-span-2 space-y-8">

              {/* 2. Today / Upcoming Sessions */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <Clock size={18} className="text-blue-600" />
                    Upcoming Sessions
                  </h2>
                  <button onClick={() => navigate('/dashboard/sessions')} className="text-sm text-blue-600 font-medium hover:underline">View All</button>
                </div>

                {loading ? (
                  <div className="p-8 text-center text-gray-400">Loading schedule...</div>
                ) : sessions.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {sessions.map((session: any) => (
                      <div key={session._id || session.sessionId} className="p-5 hover:bg-blue-50/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-lg">
                            {/* Initials of candidate if available or generic icon */}
                            {session.candidateId?.name ? session.candidateId.name.charAt(0) : <User size={20} />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-900">{session.candidateId?.name || "Candidate"}</h4>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-gray-600 font-medium border border-gray-200">{session.topics?.[0] || "Interview"}</span>
                              <span>•</span>
                              <span>{new Date(session.startTime).toLocaleDateString()}</span>
                              <span>•</span>
                              <span className="text-blue-600 font-medium">{new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => navigate(`/dashboard/sessions/${session.sessionId}`)} className="text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-md font-medium text-xs transition-colors">Details</button>
                          <button onClick={() => navigate(`/live-meeting?meetingId=${session.sessionId}`)} className="bg-[#004fcb] hover:bg-blue-800 text-white px-4 py-1.5 rounded-md font-medium text-xs transition-colors">
                            Join Session
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-12 text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <CalendarDays className="text-gray-300" size={32} />
                    </div>
                    <p className="text-gray-500 font-medium">No upcoming sessions scheduled.</p>
                    <button className="text-blue-600 text-sm mt-2 hover:underline">Manage Availability</button>
                  </div>
                )}
              </div>

              {/* 4. Performance & Activity (Charts) */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-bold text-gray-800 flex items-center gap-2">
                    <TrendingUp size={18} className="text-green-600" />
                    Performance Activity
                  </h2>
                  <select className="text-sm border-gray-300 rounded-md text-gray-600 focus:ring-blue-500">
                    <option>This Week</option>
                    <option>Last Month</option>
                  </select>
                </div>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={activityData}>
                      <defs>
                        <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#004fcb" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#004fcb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9ca3af', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Area type="monotone" dataKey="sessions" stroke="#004fcb" strokeWidth={3} fillOpacity={1} fill="url(#colorSessions)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

            {/* RIGHT COLUMN (1/3) */}
            <div className="lg:col-span-1 space-y-8">

              {/* 3. Quick Actions */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
                <h3 className="font-bold text-gray-800 mb-4 text-sm uppercase tracking-wide">Quick Actions</h3>
                <div className="space-y-3">
                  <QuickAction
                    label="Update Profile"
                    desc="Edit personal info & bio"
                    to="/dashboard/profile"
                    icon={<User size={18} />}
                  />
                  <QuickAction
                    label="Set Availability"
                    desc="Manage your calendar slots"
                    to="/dashboard/availability"
                    icon={<Clock size={18} />}
                  />
                  <QuickAction
                    label="Skills & Expertise"
                    desc="Add new skills or rates"
                    to="/dashboard/skills"
                    icon={<Award size={18} />}
                  />
                </div>
              </div>

              {/* 5. Notifications / Alerts */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                  <h3 className="font-bold text-gray-800 text-sm">Notifications</h3>
                </div>
                <div className="divide-y divide-gray-50">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="p-4 hover:bg-gray-50 transition-colors flex gap-3">
                      <div className="mt-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-800 font-medium">New Session Request</p>
                        <p className="text-xs text-gray-500 mt-1">A candidate requested a mock interview for React JS.</p>
                        <p className="text-[10px] text-gray-400 mt-2">2 hours ago</p>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-3 text-xs font-semibold text-gray-500 hover:text-blue-600 hover:bg-gray-50 border-t border-gray-100 transition-colors">
                    View All Notifications
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
