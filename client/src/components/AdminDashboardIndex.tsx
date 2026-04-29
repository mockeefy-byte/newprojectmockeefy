// src/pages/admin/Index.tsx
import { useEffect, useState } from "react";
import axios from "../lib/axios";
import {
  Users,
  UserCheck,
  Calendar,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Download,
  Eye,
  Shield
} from "lucide-react";

interface DashboardStats {
  totalExperts: number;
  totalUsers: number;
  sessionsBooked: number;
  pendingExperts?: number;
  activeSessions?: number;
  totalRevenue?: number;
  recentUsers?: any[];
  topCategories?: { name: string; count: number }[];
  chartData?: number[];
}

export default function AdminDashboardIndex() {
  const [stats, setStats] = useState<DashboardStats>({
    totalExperts: 0,
    totalUsers: 0,
    sessionsBooked: 0,
    pendingExperts: 0,
    activeSessions: 0,
    totalRevenue: 0,
    recentUsers: [],
    topCategories: [],
    chartData: []
  });
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch dashboard stats
        const statsRes = await axios.get(`/api/admin/stats`);
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
        
        // Fetch users (candidates & experts excluding admin)
        const usersRes = await axios.get('/api/admin/users');
        if (usersRes.data.success) {
          // Limit to recent 5 users for dashboard preview
          setUsers(usersRes.data.data.slice(0, 5));
        }
      } catch (error) {
        console.error("Failed to fetch admin data:", error);
      } finally {
        setLoading(false);
        setUsersLoading(false);
      }
    };
    fetchData();
  }, []);

  // Inner Stat Card (Contrast against White Main Container)
  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color }: any) => (
    <div className="bg-gray-50/80 p-5 rounded-xl border border-gray-100 transition-hover hover:border-gray-200">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-2">{loading ? "..." : value}</h3>
        </div>
        <div className={`p-3 rounded-lg bg-white shadow-sm ring-1 ring-gray-100`}>
          <Icon size={20} className="text-gray-700" />
        </div>
      </div>
      {(trend || trendValue) && (
        <div className="mt-4 flex items-center text-sm">
          <span className={`flex items-center font-medium ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <ArrowUpRight size={16} className="mr-1" /> : <ArrowDownRight size={16} className="mr-1" />}
            {trendValue}
          </span>
          <span className="text-gray-400 ml-2">vs last 30d</span>
        </div>
      )}
    </div>
  );

  // Helper for colors
  const getCategoryColor = (index: number) => {
    const colors = ["bg-blue-500", "bg-purple-500", "bg-pink-500", "bg-orange-500", "bg-green-500"];
    return colors[index % colors.length];
  };

  return (
    // MAIN PAGE CONTAINER: Wraps everything in a single white "sheet"
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[calc(100vh-8rem)]">

      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-sm text-gray-500 mt-1">Welcome back, Administrator. System performance is optimal.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
            <Clock size={16} />
            <span className="font-mono">{new Date().toLocaleTimeString()}</span>
          </div>
          <button className="flex items-center gap-2 bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
            <Download size={16} />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Content Space */}
      <div className="space-y-8">

        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Users"
            value={stats.totalUsers}
            icon={Users}
            trend="up"
            trendValue="12%"
          />
          <StatCard
            title="Total Experts"
            value={stats.totalExperts} // Fixed label from Verified Experts to Total Experts for clarity
            icon={UserCheck}
            trend="up"
            trendValue="8%"
          />
          <StatCard
            title="Total Sessions"
            value={stats.sessionsBooked}
            icon={Calendar}
            trend="up"
            trendValue="24%"
          />
          <StatCard
            title="Total Revenue"
            value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} // Changed currency
            icon={TrendingUp}
            trend="up"
            trendValue="18%"
          />
        </div>

        {/* Analytics & Categories Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Analytics */}
          <div className="lg:col-span-2">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900">Revenue Analytics</h3>
              <select className="text-sm border-gray-200 rounded-lg text-gray-600 bg-gray-50 p-2 outline-none focus:border-blue-500 transition-colors">
                <option>This Year</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="bg-gray-50/50 p-6 rounded-xl border border-dashed border-gray-200 h-72 flex items-end justify-between gap-3">
              {stats.chartData && stats.chartData.some(val => val > 0) ? (
                stats.chartData.map((val, i) => {
                  const maxVal = Math.max(...(stats.chartData || []), 1);
                  const height = Math.max(5, (val / maxVal) * 100); // Min height 5%
                  return (
                    <div key={i} className="w-full bg-gray-200/50 rounded-t-sm relative group h-full flex items-end">
                      <div
                        className="w-full bg-indigo-600 rounded-t-sm transition-all duration-700 block"
                        style={{ height: `${height}%` }}
                      />
                      <div className="opacity-0 group-hover:opacity-100 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs py-1 px-2 rounded pointer-events-none z-10 whitespace-nowrap">
                        ₹{val.toLocaleString()}
                      </div>
                    </div>
                  )
                })
              ) : (
                // Fallback if no data
                <div className="w-full h-full flex items-center justify-center text-gray-400">No revenue data available</div>
              )}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-400 uppercase font-medium px-2">
              <span>Jan</span><span>Dec</span>
            </div>
          </div>

          {/* Top Categories */}
          <div className="bg-gray-50/50 p-6 rounded-xl border border-gray-100 h-full flex flex-col">
            <h3 className="font-bold text-gray-900 mb-6">Top Categories</h3>
            <div className="space-y-6 flex-1">
              {stats.topCategories && stats.topCategories.length > 0 ? (
                stats.topCategories.map((cat, i) => {
                  const maxCount = Math.max(...stats.topCategories!.map(c => c.count), 1);
                  return (
                    <div key={i} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium text-gray-700">{cat.name || 'Uncategorized'}</span>
                        <span className="text-gray-500 text-xs font-mono">{cat.count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`${getCategoryColor(i)} h-1.5 rounded-full`}
                          style={{ width: `${(cat.count / maxCount) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })
              ) : (
                <p className="text-sm text-gray-500 text-center py-10">No categories found.</p>
              )}
            </div>
            <button className="w-full mt-4 py-2 text-sm text-gray-600 font-medium hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
              View All
            </button>
          </div>
        </div>

        {/* Users & Experts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Users & Candidates Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Users size={20} className="text-blue-600" />
                Users & Candidates ({stats.totalUsers})
              </h3>
              <a href="/admin/users" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                View All <Eye size={16} />
              </a>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 font-medium">Name</th>
                    <th className="px-6 py-4 font-medium">Email</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                    <th className="px-6 py-4 font-medium">Joined</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usersLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
                        <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
                        <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
                      </tr>
                    ))
                  ) : users && users.length > 0 ? (
                    users.map((user: any) => (
                      <tr key={user._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900 flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-[11px] text-blue-700 font-bold uppercase border border-blue-100 shadow-sm shrink-0">
                            {(user.name || "U").trim().substring(0, 2).toUpperCase()}
                          </div>
                          {user.name}
                        </td>
                        <td className="px-6 py-4 text-gray-500 text-xs">{user.email}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.status === 'Active'
                            ? 'bg-green-50 text-green-700 border-green-100'
                            : 'bg-red-50 text-red-700 border-red-100'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                          {new Date(user.createdAt || user.joined).toLocaleDateString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Experts Section */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-900 flex items-center gap-2">
                <Shield size={20} className="text-purple-600" />
                Experts ({stats.totalExperts})
              </h3>
              <a href="/admin/experts/verified" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                View All <Eye size={16} />
              </a>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="p-6 space-y-4">
                <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg border border-green-100">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Verified Experts</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.totalExperts - (stats.pendingExperts || 0)}</p>
                  </div>
                  <Shield size={32} className="text-green-600" />
                </div>
                <div className="flex justify-between items-center p-4 bg-amber-50 rounded-lg border border-amber-100">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider font-medium">Pending Verification</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stats.pendingExperts || 0}</p>
                  </div>
                  <Clock size={32} className="text-amber-600" />
                </div>
                <a href="/admin/experts/pending" className="w-full block text-center py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">
                  Review Pending Experts
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
