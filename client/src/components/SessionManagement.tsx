import { useState, useEffect, useMemo } from "react";
import axios from '../lib/axios';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  RefreshCw,
  Filter,
  X,
  User,
  Calendar,
  DollarSign,
  Maximize2
} from "lucide-react";
import { toast } from "sonner";

interface Session {
  _id: string;
  sessionId: string;
  expertId: string;
  candidateId: string;
  expertName?: string;
  candidateName?: string;
  startTime: string; // ISO Date string
  endTime: string;
  topics: string[];
  price: number;
  status: string; // 'pending' | 'confirmed' | 'completed' | 'cancelled'
  duration?: number;
  meetingLink?: string;
}

export default function SessionManagement() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortAsc, setSortAsc] = useState(false); // Default desc (newest first)
  const pageSize = 8;

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/sessions/all");
      if (response.data.success) {
        // Transform incoming data to handle MongoDB Extended JSON format
        const formattedSessions = response.data.data.map((session: any) => ({
          ...session,
          _id: session._id?.$oid || session._id,
          startTime: session.startTime?.$date || session.startTime,
          endTime: session.endTime?.$date || session.endTime,
        }));
        setSessions(formattedSessions);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load sessions");
    } finally {
      // Small delay to prevent instant flicker if data is cached/fast
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const matchesStatus = filterStatus === "All" || s.status.toLowerCase() === filterStatus.toLowerCase();
      const searchLower = searchTerm.toLowerCase();
      const matchesSearch =
        (s.expertName?.toLowerCase() || "").includes(searchLower) ||
        (s.candidateName?.toLowerCase() || "").includes(searchLower) ||
        s.sessionId.toLowerCase().includes(searchLower);

      return matchesStatus && matchesSearch;
    });
  }, [sessions, filterStatus, searchTerm]);

  // Sort by date
  const sortedSessions = useMemo(() => {
    return [...filteredSessions].sort((a, b) => {
      const dateA = new Date(a.startTime).getTime();
      const dateB = new Date(b.startTime).getTime();
      return sortAsc ? dateA - dateB : dateB - dateA;
    });
  }, [filteredSessions, sortAsc]);

  // Pagination
  const totalPages = Math.ceil(sortedSessions.length / pageSize);
  const paginatedSessions = sortedSessions.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Helper functions for UI
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'confirmed': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'completed': return 'bg-green-50 text-green-700 border-green-200';
      case 'cancelled': return 'bg-red-50 text-red-700 border-red-200';
      case 'upcoming': return 'bg-purple-50 text-purple-700 border-purple-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    // MAIN CONTAINER - Uses fixed height to enable inner column scrolling
    <div className="flex flex-col lg:flex-row gap-6 h-full overflow-hidden p-6 md:p-8">

      {/* LEFT/CENTER: Session List */}
      <div className={`flex flex-col flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden transition-all duration-300 ${selectedSession ? 'lg:flex-[2]' : 'lg:flex-[3]'}`}>

        {/* Sticky Header */}
        <div className="p-6 border-b border-gray-100 bg-white z-10 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900">Sessions</h2>
              <p className="text-sm text-gray-500">Manage all consultations</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setLoading(true); fetchSessions(); }}
                className="p-2 text-gray-500 hover:text-gray-900 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                title="Refresh"
              >
                <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
              </button>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search sessions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              >
                <option value="All">All Status</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto thin-scrollbar p-4 space-y-4 bg-gray-50/50">
          {loading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-gray-200 animate-pulse h-32"></div>
              ))}
            </div>
          ) : filteredSessions.length > 0 ? (
            <div className="space-y-3">
              {paginatedSessions.map((session) => (
                <div
                  key={session._id}
                  onClick={() => setSelectedSession(session)}
                  className={`bg-white rounded-xl border p-4 cursor-pointer transition-all hover:shadow-md ${selectedSession?._id === session._id
                    ? 'border-[#004fcb] ring-1 ring-[#004fcb]/10 shadow-md'
                    : 'border-gray-200 hover:border-blue-200'
                    }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${session.status === 'Completed' ? 'bg-green-500' :
                        session.status === 'Confirmed' ? 'bg-blue-500' :
                          session.status === 'Cancelled' ? 'bg-red-500' : 'bg-yellow-500'
                        }`}></div>
                      <span className="text-xs font-bold text-gray-700 uppercase tracking-wide">{session.status}</span>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">#{session.sessionId.slice(-6)}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-gray-900 text-sm">{session.expertName || "Unknown Expert"}</h3>
                      <p className="text-xs text-gray-500">with {session.candidateName || "Unknown"}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900 text-sm">₹{session.price?.toLocaleString() || 0}</p>
                      <p className="text-xs text-gray-500">{session.duration || 60} min</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={12} />
                      <span>{formatDate(session.startTime)}</span>
                    </div>
                    <span>{formatTime(session.startTime)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <RefreshCw className="w-10 h-10 text-gray-300 mb-2" />
              <h3 className="text-gray-900 font-medium">No sessions found</h3>
              <p className="text-gray-500 text-sm">Try changing filters</p>
            </div>
          )}
        </div>

        {/* Footer / Pagination */}
        {!loading && filteredSessions.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, filteredSessions.length)} of {filteredSessions.length}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RIGHT: Session Details Panel */}
      {selectedSession ? (
        <div className="hidden lg:flex flex-col lg:flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden w-[400px]">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900">Session Details</h3>
            <button onClick={() => setSelectedSession(null)} className="text-gray-400 hover:text-gray-600">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto thin-scrollbar p-5 space-y-6">
            {/* Status */}
            <div className={`p-4 rounded-xl border flex items-center justify-between ${getStatusColor(selectedSession.status)}`}>
              <span className="text-xs font-bold uppercase tracking-wider">Status</span>
              <span className="font-bold capitalize">{selectedSession.status}</span>
            </div>

            {/* People */}
            <div className="space-y-4">
              <div>
                <div className="text-xs text-gray-400 uppercase font-bold mb-2 flex items-center gap-1.5">
                  <User size={12} /> Expert
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="font-bold text-gray-900 text-sm">{selectedSession.expertName}</div>
                  <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {selectedSession.expertId}</div>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 uppercase font-bold mb-2 flex items-center gap-1.5">
                  <User size={12} /> Candidate
                </div>
                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="font-bold text-gray-900 text-sm">{selectedSession.candidateName}</div>
                  <div className="text-xs text-gray-500 font-mono mt-0.5">ID: {selectedSession.candidateId}</div>
                </div>
              </div>
            </div>

            {/* Timing */}
            <div>
              <div className="text-xs text-gray-400 uppercase font-bold mb-2 flex items-center gap-1.5">
                <Calendar size={12} /> Date & Time
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <div className="text-xs text-gray-500 mb-1">Date</div>
                  <div className="font-bold text-sm text-gray-900">{formatDate(selectedSession.startTime)}</div>
                </div>
                <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <div className="text-xs text-gray-500 mb-1">Duration</div>
                  <div className="font-bold text-sm text-gray-900">{selectedSession.duration || 60}m</div>
                </div>
                <div className="col-span-2 bg-white p-3 rounded-lg border border-gray-200 text-center">
                  <div className="text-xs text-gray-500 mb-1">Time Slot</div>
                  <div className="font-bold text-sm text-gray-900">
                    {formatTime(selectedSession.startTime)} - {formatTime(selectedSession.endTime)}
                  </div>
                </div>
              </div>
            </div>

            {/* Financials */}
            <div>
              <div className="text-xs text-gray-400 uppercase font-bold mb-2 flex items-center gap-1.5">
                <DollarSign size={12} /> Financials
              </div>
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex justify-between items-center">
                <span className="text-sm text-amber-800 font-medium">Total Amount</span>
                <span className="text-xl font-bold text-amber-900">₹{selectedSession.price?.toLocaleString()}</span>
              </div>
            </div>

            {/* Topics */}
            {selectedSession.topics && selectedSession.topics.length > 0 && (
              <div>
                <div className="text-xs text-gray-400 uppercase font-bold mb-2">Topics</div>
                <div className="flex flex-wrap gap-2">
                  {selectedSession.topics.map((t, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 text-xs font-medium text-gray-600 rounded border border-gray-200">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="hidden lg:flex flex-col lg:flex-1 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 items-center justify-center text-center p-8">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
            <Maximize2 className="text-gray-300" />
          </div>
          <h3 className="font-bold text-gray-900">Select a Session</h3>
          <p className="text-gray-500 text-sm mt-1 max-w-[200px]">Click on any session from the list to view full details here.</p>
        </div>
      )}

    </div>
  );
}