
import { useState, useEffect } from "react";
import axios from "../lib/axios";
import { Search, Calendar, Clock, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { getProfileImageUrl } from "../lib/imageUtils";

interface Session {
    id: string;
    _id: string;
    sessionId: string;
    expertName: string;
    expertDetails?: {
        name?: string;
        profileImage?: string;
    };
    candidateName: string;
    candidateDetails?: {
        name?: string;
        profileImage?: string;
    };
    startTime: string;
    endTime: string;
    status: string;
    topics: string[];
    price: number;
}

const DashboardSessions = () => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");
    const [search, setSearch] = useState("");
    const navigate = useNavigate();

    const { user } = useAuth();

    // ...

    useEffect(() => {
        if (user?.id || user?.userId) fetchSessions();
    }, [user]);

    const fetchSessions = async () => {
        try {
            const userId = user?.id || user?.userId;

            if (userId) {
                const res = await axios.get(`/api/sessions/expert/${userId}`);
                if (Array.isArray(res.data)) {
                    setSessions(res.data);
                }
            }

        } catch (error) {
            console.error("Failed to fetch sessions", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredSessions = sessions.filter(session => {
        const matchesFilter = filter === "all" || session.status.toLowerCase() === filter;
        const matchesSearch =
            session.candidateName?.toLowerCase().includes(search.toLowerCase()) ||
            session.topics?.some(t => t.toLowerCase().includes(search.toLowerCase())) ||
            session.sessionId.toLowerCase().includes(search.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "confirmed": return "bg-blue-50 text-blue-700 border-blue-100";
            case "completed": return "bg-green-50 text-green-700 border-green-100";
            case "cancelled": return "bg-red-50 text-red-700 border-red-100";
            default: return "bg-gray-50 text-gray-700 border-gray-100";
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Recent Sessions</h2>
                    <p className="text-sm text-gray-500">Manage your upcoming and past interviews</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-full sm:w-48"
                        />
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                    >
                        <option value="all">All Status</option>
                        <option value="confirmed">Upcoming</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto overflow-x-auto min-h-0 relative">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 z-10 bg-white shadow-sm">
                        <tr className="border-b border-gray-100 text-xs uppercase tracking-wider text-gray-500">
                            <th className="px-6 py-4 font-semibold">Candidate</th>
                            <th className="px-6 py-4 font-semibold">Topic & Date</th>
                            <th className="px-6 py-4 font-semibold">Status</th>
                            <th className="px-6 py-4 font-semibold text-right">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            [...Array(3)].map((_, i) => (
                                <tr key={i} className="border-b border-gray-50">
                                    <td className="px-6 py-4"><div className="h-10 w-32 bg-gray-100 rounded-lg"></div></td>
                                    <td className="px-6 py-4"><div className="h-10 w-48 bg-gray-100 rounded-lg"></div></td>
                                    <td className="px-6 py-4"><div className="h-6 w-20 bg-gray-100 rounded-full"></div></td>
                                    <td className="px-6 py-4"></td>
                                </tr>
                            ))
                        ) : filteredSessions.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                                            <Calendar className="w-6 h-6 text-gray-300" />
                                        </div>
                                        <p className="text-sm font-medium">No sessions found</p>
                                        <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredSessions.map((session) => (
                                <tr key={session._id || session.id} className="group hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center shrink-0">
                                                {session.candidateDetails?.profileImage ? (
                                                    <img src={getProfileImageUrl(session.candidateDetails.profileImage)} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-500">{session.candidateName?.charAt(0) || "C"}</span>
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-gray-900">{session.candidateName || "Unknown Candidate"}</p>
                                                <p className="text-xs text-gray-500">ID: {session.sessionId}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap gap-1">
                                                {session.topics?.slice(0, 2).map((t, i) => (
                                                    <span key={i} className="text-[10px] font-bold text-gray-600 bg-gray-100 px-1.5 py-0.5 rounded border border-gray-200 uppercase tracking-tight">
                                                        {t}
                                                    </span>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                                                <Calendar className="w-3.5 h-3.5 opacity-70" />
                                                {session.startTime ? format(new Date(session.startTime), "MMM d, yyyy") : "N/A"}
                                                <Clock className="w-3.5 h-3.5 opacity-70 ml-2" />
                                                {session.startTime ? format(new Date(session.startTime), "h:mm a") : "N/A"}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border capitalize ${getStatusColor(session.status)}`}>
                                            {session.status === 'confirmed' && <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>}
                                            {session.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => navigate(`/dashboard/sessions`)}
                                            className="text-gray-400 hover:text-blue-600 transition-colors bg-transparent hover:bg-blue-50 p-2 rounded-lg"
                                        >
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50/30 flex justify-center">
                <button
                    onClick={() => navigate('/dashboard/sessions')}
                    className="text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                    View All Sessions
                </button>
            </div>
        </div>
    );
};

export default DashboardSessions;
