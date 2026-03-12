import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Video,
  RefreshCw,
  Calendar,
  ChevronRight,
  Sparkles,
  Shield,
  Briefcase,
  TrendingUp,
  Activity,
  Award,
  Bookmark,
  Check,
  Star,
  X,
  MessageSquare
} from "lucide-react";
import { toast } from "sonner";
import DashboardLayout from "./DashboardLayout";
import { useAuth } from "../context/AuthContext";
import axios from '../lib/axios';
import { getProfileImageUrl } from "../lib/imageUtils";

// --- Types ---
type ReviewInfo = {
  overallRating?: number;
  technicalRating?: number;
  communicationRating?: number;
  feedback?: string;
  strengths?: string[];
  weaknesses?: string[];
};

type Session = {
  id: string;
  sessionId: string;
  expert: string;
  role: string;
  company: string;
  date: string;
  time: string;
  duration: string;
  status: string;
  score?: number;
  meetLink?: string;
  profileImage?: string | null;
  startTime?: string;
  endTime?: string;
  category?: string;
  expertId?: string;
  candidateId?: string;
  expertReview?: ReviewInfo | null;
  candidateReview?: ReviewInfo | null;
};

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    Upcoming: "bg-blue-50/50 text-blue-600 border-blue-100",
    Confirmed: "bg-elite-blue text-white border-blue-600",
    Completed: "bg-slate-50 text-slate-500 border-slate-200",
    Cancelled: "bg-rose-50 text-rose-600 border-rose-100",
    Live: "bg-emerald-50 text-emerald-600 border-emerald-100",
    Expired: "bg-amber-50/80 text-amber-700 border-amber-200"
  };
  return (
    <span className={`px-2 py-0.5 rounded-lg text-[8px] font-black tracking-tight border shadow-sm ${styles[status] || styles.Completed}`}>
      {status}
    </span>
  );
}

/** Session is joinable from startTime until endTime (e.g. 2:00–2:30 → joinable until 2:30). */
function canJoinSession(session: Session): boolean {
  if (['Completed', 'Cancelled'].includes(session.status)) return false;
  const now = new Date();
  const start = session.startTime ? new Date(session.startTime) : null;
  const end = session.endTime ? new Date(session.endTime) : null;
  if (!start) return true;
  if (now < start) return false; // not started yet
  if (end && now > end) return false; // already ended → expire after endTime only
  return true; // now >= start && (no end || now <= end)
}

/** Expired only after endTime (e.g. 2:00–2:30 → Expired only after 2:30). */
function getDisplayStatus(session: Session): string {
  if (session.status === 'Completed' || session.status === 'Cancelled') return session.status;
  const now = new Date();
  const end = session.endTime ? new Date(session.endTime) : null;
  const start = session.startTime ? new Date(session.startTime) : null;
  if (end && now > end) return 'Expired';
  if (start && now >= start && (!end || now <= end)) return 'Live';
  return session.status;
}

const MySessions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialView = (searchParams.get('view') as any) || 'overview';

  const [activeView, setActiveView] = useState(initialView);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const view = new URLSearchParams(location.search).get('view');
    if (view) setActiveView(view);
  }, [location.search]);

  const [savedExperts, setSavedExperts] = useState<any[]>([]);
  const [reviewModalSession, setReviewModalSession] = useState<Session | null>(null);
  const [certificateModalSession, setCertificateModalSession] = useState<Session | null>(null);
  const [reviewForm, setReviewForm] = useState({ overallRating: 5, technicalRating: 5, communicationRating: 5, feedback: "" });
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchSessions = async () => {
    if (!user?.id) return;
    try {
      const res = await axios.get(`/api/sessions/candidate/${user.id}`);
      if (res.data) {
        const mapped = res.data.map((s: any) => ({
          id: s._id,
          sessionId: s.sessionId,
          expert: s.expertDetails?.name || 'Expert',
          company: s.expertDetails?.company || '',
          profileImage: s.expertDetails?.profileImage,
          category: s.category || 'Interview',
          startTime: s.startTime,
          endTime: s.endTime,
          time: new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: (s.status || '').charAt(0).toUpperCase() + (s.status || '').slice(1),
          score: s.expertReview?.overallRating != null ? s.expertReview.overallRating * 20 : undefined,
          expertId: s.expertId,
          candidateId: s.candidateId,
          expertReview: s.expertReview || null,
          candidateReview: s.candidateReview || null
        }));
        setSessions(mapped);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadSavedExperts = () => {
    const saved = localStorage.getItem("savedExperts");
    if (saved) {
      setSavedExperts(JSON.parse(saved));
    } else {
      setSavedExperts([]);
    }
  };

  useEffect(() => {
    fetchSessions();
    loadSavedExperts();

    const handleStorageChange = () => {
      loadSavedExperts();
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [user?.id]);

  const handleJoin = (session: Session) => {
    navigate(`/live-meeting/${session.sessionId}`, { state: { session } });
  };

  const handleSubmitReview = async () => {
    if (!reviewModalSession || !user?.id) return;
    setSubmittingReview(true);
    try {
      await axios.post(`/api/sessions/${reviewModalSession.sessionId}/review`, {
        overallRating: reviewForm.overallRating,
        technicalRating: reviewForm.technicalRating,
        communicationRating: reviewForm.communicationRating,
        feedback: reviewForm.feedback,
        strengths: [],
        weaknesses: [],
        expertId: reviewModalSession.expertId,
        candidateId: reviewModalSession.candidateId || user.id,
        reviewerRole: "candidate"
      });
      toast.success("Review submitted. You can now view your certificate details.");
      setReviewModalSession(null);
      setReviewForm({ overallRating: 5, technicalRating: 5, communicationRating: 5, feedback: "" });
      fetchSessions();
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Failed to submit review");
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">

        {/* EXECUTIVE DASHBOARD PANEL - OVERVIEW */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            {/* 1. UNIFIED STATS STRIP - ZERO INTERNAL GAP */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/10">
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4 text-elite-blue" />
                  <h2 className="font-elite leading-none">Operational Intel</h2>
                </div>
                <button onClick={() => { setRefreshing(true); fetchSessions(); }} className="flex items-center gap-2 px-2.5 py-1.5 hover:bg-blue-50 rounded-lg transition-all border border-transparent hover:border-blue-100">
                  <span className="text-[8px] font-black text-slate-400 tracking-tight uppercase">{refreshing ? 'Syncing...' : 'Sync HQ'}</span>
                  <RefreshCw size={10} className={`${refreshing ? 'animate-spin' : ''} text-slate-400`} />
                </button>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-slate-100">
                {[
                  { label: "Simulations", value: sessions.length, icon: Video, color: "text-elite-blue" },
                  { label: "Validated", value: sessions.filter(s => s.status === 'Completed').length, icon: Shield, color: "text-emerald-500" },
                  { label: "Awaiting", value: sessions.filter(s => ['Upcoming', 'Confirmed'].includes(s.status)).length, icon: Calendar, color: "text-amber-500" },
                  { label: "Tier Rank", value: "Elite", icon: TrendingUp, color: "text-rose-500" }
                ].map((stat, i) => (
                  <div key={i} className="p-5 hover:bg-blue-50/30 transition-colors group cursor-default">
                    <div className="flex items-center gap-2 mb-2">
                      <stat.icon size={12} className={stat.color} />
                      <span className="text-[9px] font-black text-slate-400 tracking-tight uppercase">{stat.label}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-elite-black tracking-tighter">{loading ? '...' : stat.value}</span>
                      <span className="text-[10px] font-bold text-slate-300">RT</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. SESSIONS LIST - Clear layout, Join Now only when joinable */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-elite-blue" />
                  <h2 className="font-elite leading-none">My Simulations</h2>
                </div>

                <div className="flex items-center gap-4">
                  {/* Certification Progress */}
                  <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                    <div className="flex flex-col">
                      <span className="text-[7px] font-black text-slate-400 uppercase tracking-tighter">Certification Pipeline</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <div className="flex gap-0.5">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={`w-3 h-1 rounded-full ${i <= sessions.filter(s => s.status === 'Completed').length ? 'bg-elite-blue' : 'bg-slate-200'}`}
                            />
                          ))}
                        </div>
                        <span className="text-[9px] font-black text-elite-blue leading-none">
                          {Math.min(3, sessions.filter(s => s.status === 'Completed').length)}/3
                        </span>
                      </div>
                    </div>
                    <Award size={14} className={sessions.filter(s => s.status === 'Completed').length >= 3 ? "text-elite-blue" : "text-slate-300"} />
                  </div>

                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-elite-blue border border-blue-100">
                    <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                    <span className="text-[8px] font-black tracking-tight uppercase">Active Studio</span>
                  </div>
                </div>
              </div>

              {/* Desktop: table */}
              <div className="overflow-x-auto hidden md:block">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/50 border-b border-slate-100">
                      <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Session</th>
                      <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-wider hidden sm:table-cell">Date & time</th>
                      <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3.5 text-[10px] font-black text-slate-500 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {loading ? (
                      [1, 2, 3].map(i => (
                        <tr key={i} className="animate-pulse">
                          <td colSpan={4} className="px-5 py-4"><div className="h-10 bg-slate-50 rounded-xl" /></td>
                        </tr>
                      ))
                    ) : sessions.length > 0 ? (
                      sessions.slice(0, 10).map(session => {
                        const displayStatus = getDisplayStatus(session);
                        const joinable = canJoinSession(session);
                        return (
                          <tr key={session.id} className="group hover:bg-slate-50/50 transition-colors">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden border border-slate-200/60 p-0.5 shadow-sm shrink-0">
                                  <img src={getProfileImageUrl(session.profileImage)} alt="" className="w-full h-full object-cover rounded-lg" />
                                </div>
                                <div className="min-w-0">
                                  <p className="font-black text-slate-900 text-[12px] tracking-tight truncate">Your session with {session.expert}</p>
                                  <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{session.category} Simulation</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 hidden sm:table-cell">
                              <p className="text-[11px] font-bold text-slate-800">{session.startTime ? new Date(session.startTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</p>
                              <p className="text-[10px] text-slate-500 font-medium mt-0.5">{session.time}</p>
                            </td>
                            <td className="px-5 py-4">
                              <StatusBadge status={displayStatus} />
                            </td>
                            <td className="px-5 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {displayStatus === 'Completed' ? (
                                  session.candidateReview ? (
                                    <button
                                      onClick={() => setCertificateModalSession(session)}
                                      className="px-3 py-2 bg-slate-50 border border-slate-200 text-slate-600 hover:text-elite-blue hover:border-blue-200 rounded-xl transition-all text-[10px] font-bold flex items-center gap-1.5"
                                    >
                                      <Award size={12} strokeWidth={2.5} />
                                      <span>View Certificate</span>
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => setReviewModalSession(session)}
                                      className="px-3 py-2 bg-amber-50 border border-amber-200 text-amber-700 hover:bg-amber-100 rounded-xl transition-all text-[10px] font-bold flex items-center gap-1.5"
                                    >
                                      <MessageSquare size={12} strokeWidth={2.5} />
                                      <span>Give Review</span>
                                    </button>
                                  )
                                ) : joinable ? (
                                  <button
                                    onClick={() => handleJoin(session)}
                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-elite-blue hover:bg-blue-600 text-white rounded-xl text-[10px] font-black tracking-tight transition-all shadow-sm active:scale-95"
                                  >
                                    Join Now <ChevronRight size={12} strokeWidth={3} />
                                  </button>
                                ) : (
                                  <span className="text-[10px] font-semibold text-slate-400 px-3 py-2 rounded-xl bg-slate-50 border border-slate-100">
                                    {displayStatus === 'Expired' ? 'Expired' : displayStatus}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} className="px-5 py-16 text-center">
                          <Briefcase className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                          <p className="text-slate-600 font-semibold text-sm">No sessions yet</p>
                          <p className="text-slate-400 text-xs mt-1">Book a simulation to see it here.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile: card layout */}
              <div className="md:hidden divide-y divide-slate-100">
                {loading ? (
                  [1, 2, 3].map(i => (
                    <div key={i} className="p-4 animate-pulse"><div className="h-24 bg-slate-50 rounded-xl" /></div>
                  ))
                ) : sessions.length > 0 ? (
                  sessions.slice(0, 10).map(session => {
                    const displayStatus = getDisplayStatus(session);
                    const joinable = canJoinSession(session);
                    return (
                      <div key={session.id} className="p-4 hover:bg-slate-50/50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden border border-slate-200/60 shrink-0">
                            <img src={getProfileImageUrl(session.profileImage)} alt="" className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-slate-900 text-sm">Your session with {session.expert}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{session.category} Simulation</p>
                            {session.startTime && (
                              <p className="text-xs text-slate-500 mt-1">{new Date(session.startTime).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} · {session.time}</p>
                            )}
                            <div className="mt-3 flex items-center justify-between gap-2 flex-wrap">
                              <StatusBadge status={displayStatus} />
                              {displayStatus === 'Completed' ? (
                                session.candidateReview ? (
                                  <button onClick={() => setCertificateModalSession(session)} className="px-3 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                    <Award size={12} /> View Certificate
                                  </button>
                                ) : (
                                  <button onClick={() => setReviewModalSession(session)} className="px-3 py-1.5 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-bold flex items-center gap-1.5">
                                    <MessageSquare size={12} /> Give Review
                                  </button>
                                )
                              ) : joinable ? (
                                <button
                                  onClick={() => handleJoin(session)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-elite-blue text-white rounded-lg text-xs font-bold"
                                >
                                  Join Now <ChevronRight size={12} />
                                </button>
                              ) : (
                                <span className="text-xs font-semibold text-slate-400">{displayStatus === 'Expired' ? 'Expired' : displayStatus}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center">
                    <Briefcase className="w-8 h-8 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500 text-sm font-medium">No sessions yet</p>
                    <p className="text-slate-400 text-xs mt-1">Book a simulation to see it here.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Saved Experts Preview (Optional, max 4) */}
            {savedExperts.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Bookmark size={16} className="text-elite-blue" />
                    <h3 className="font-elite text-sm">Quick Access: Saved Experts</h3>
                  </div>
                  <button onClick={() => setActiveView('saved')} className="text-[10px] font-bold text-elite-blue hover:underline">View All</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {savedExperts.slice(0, 4).map(expert => (
                    <div key={expert.expertID} className="bg-slate-50/50 p-3 rounded-xl border border-slate-100 flex items-center gap-3">
                      <img src={expert.avatar} className="w-8 h-8 rounded-lg bg-slate-200 object-cover" />
                      <div className="min-w-0">
                        <p className="font-bold text-[11px] truncate">{expert.name}</p>
                        <p className="text-[9px] text-slate-400 truncate">{expert.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* SAVED EXPERTS VIEW */}
        {activeView === 'saved' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 mb-6">
              <Bookmark className="w-5 h-5 text-elite-blue" />
              <h2 className="font-elite leading-none text-xl">Saved Experts Library</h2>
            </div>

            <div className="w-full">
              {savedExperts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
                  {savedExperts.map((expert) => (
                    <div key={expert.expertID} className="relative">
                      <div className="bg-white rounded-2xl border border-slate-200/60 p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all">
                        <div className="flex justify-between items-start">
                          <div className="flex gap-3">
                            <img src={expert.avatar} className="w-12 h-12 rounded-xl object-cover bg-slate-100 border border-slate-100" />
                            <div>
                              <h3 className="font-bold text-[15px] text-elite-black leading-tight">{expert.name}</h3>
                              <p className="text-[12px] text-slate-500 mt-0.5">{expert.role}</p>
                              <p className="text-[10px] text-slate-400">{expert.company}</p>
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              const updated = savedExperts.filter(e => e.expertID !== expert.expertID);
                              setSavedExperts(updated);
                              localStorage.setItem("savedExperts", JSON.stringify(updated));
                              window.dispatchEvent(new Event("storage"));
                            }}
                            className="p-1.5 bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Remove from saved"
                          >
                            <Check size={16} strokeWidth={3} />
                          </button>
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 bg-slate-50/50 p-2 rounded-lg">
                          <div className="flex items-center gap-1"><Star size={12} className="text-amber-500 fill-current" /> <span className="font-bold text-slate-700">{expert.rating.toFixed(1)}</span></div>
                          <div className="w-px h-3 bg-slate-200"></div>
                          <div>{expert.experience} Exp</div>
                          <div className="w-px h-3 bg-slate-200"></div>
                          <div>{expert.totalSessions}+ Sessions</div>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-50">
                          <div>
                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Session Fee</p>
                            <span className="font-black text-[16px] text-elite-black">{expert.price || "₹499"}</span>
                          </div>
                          <button onClick={() => navigate('/book-session', { state: { expertId: expert.expertID, profile: expert } })} className="px-4 py-2 bg-elite-blue text-white rounded-lg text-[10px] font-black hover:bg-blue-600 transition-all">Book Now</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-slate-200/60 p-20 text-center flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                    <Bookmark className="w-8 h-8 text-slate-300" />
                  </div>
                  <h3 className="text-slate-900 font-bold mb-1">No Saved Experts</h3>
                  <p className="text-slate-500 text-sm max-w-xs mx-auto">Start saving mentors from the discovery feed to build your personal shortlist.</p>
                  <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-elite-blue text-white rounded-xl text-[11px] font-black">Browse Mentors</button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* CERTIFICATES VIEW */}
        {activeView === 'certificates' && (
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <Award className="w-5 h-5 text-elite-blue" />
              <h2 className="font-elite leading-none text-xl">My Certificates</h2>
            </div>

            {sessions.filter(s => s.status === 'Completed').length > 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden">
                <table className="w-full text-left">
                  <thead className="bg-slate-50/50 border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Certificate Details</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Issued</th>
                      <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sessions.filter(s => s.status === 'Completed').map(session => (
                      <tr key={session.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-elite-blue">
                              <Award size={20} />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm">Certificate of Completion</h3>
                              <p className="text-xs text-slate-500 mt-0.5">{session.category} Simulation with {session.expert}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-slate-700">{new Date(session.startTime!).toLocaleDateString()}</p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Verified</p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <button className="px-4 py-2 border border-slate-200 hover:border-elite-blue hover:text-elite-blue text-slate-600 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ml-auto">
                            <span>Download PDF</span>
                            <ChevronRight size={12} strokeWidth={3} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/60 p-20 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                  <Award className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="text-slate-900 font-bold mb-1">No Certificates Yet</h3>
                <p className="text-slate-500 text-sm max-w-xs mx-auto">Complete 3 sessions with any expert to unlock your first certification.</p>
                <button onClick={() => navigate('/')} className="mt-6 px-6 py-2 bg-elite-blue text-white rounded-xl text-[11px] font-black">Book a Session</button>
              </div>
            )}
          </div>
        )}

        {/* Other views fallback */}
        {activeView !== 'overview' && activeView !== 'saved' && activeView !== 'certificates' && (
          <div className="bg-white rounded-2xl border border-slate-200/60 p-16 text-center shadow-sm">
            <Briefcase className="w-10 h-10 text-slate-100 mx-auto mb-4" />
            <p className="text-slate-500 text-[10px] font-black tracking-tight">Intel Core "{activeView}" Encrypted</p>
            <button onClick={() => setActiveView('overview')} className="mt-8 px-8 py-2.5 bg-elite-blue text-white rounded-xl text-[10px] font-black tracking-tight hover:bg-blue-600 transition-all shadow-xl shadow-blue-500/10">Return to Nexus</button>
          </div>
        )}

        {/* Give Review Modal (candidate) — only after meeting ended; then they can view certificate */}
        {reviewModalSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-bold text-slate-900">Give your review</h3>
                <button onClick={() => setReviewModalSession(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <p className="text-sm text-slate-600">Session with <strong>{reviewModalSession.expert}</strong>. Your feedback helps improve the experience.</p>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Overall rating (1–5)</label>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} type="button" onClick={() => setReviewForm((f) => ({ ...f, overallRating: star }))} className="p-1">
                        <Star size={24} className={star <= reviewForm.overallRating ? "text-amber-400 fill-amber-400" : "text-slate-200"} />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback (optional)</label>
                  <textarea value={reviewForm.feedback} onChange={(e) => setReviewForm((f) => ({ ...f, feedback: e.target.value }))} placeholder="How was the session?" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none" rows={3} />
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                <button onClick={() => setReviewModalSession(null)} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium">Cancel</button>
                <button onClick={handleSubmitReview} disabled={submittingReview} className="px-4 py-2 bg-elite-blue text-white rounded-lg text-sm font-bold hover:bg-blue-600 disabled:opacity-60">{submittingReview ? "Submitting…" : "Submit review"}</button>
              </div>
            </div>
          </div>
        )}

        {/* View Certificate Modal — expert feedback (marks) and certificate details */}
        {certificateModalSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
                <h3 className="font-bold text-slate-900 flex items-center gap-2"><Award size={20} className="text-elite-blue" /> Certificate details</h3>
                <button onClick={() => setCertificateModalSession(null)} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"><X size={18} /></button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="w-12 h-12 rounded-xl bg-elite-blue/10 flex items-center justify-center"><Award className="w-6 h-6 text-elite-blue" /></div>
                  <div>
                    <p className="font-bold text-slate-900">Session with {certificateModalSession.expert}</p>
                    <p className="text-xs text-slate-500">{certificateModalSession.category} · {certificateModalSession.startTime ? new Date(certificateModalSession.startTime).toLocaleDateString() : ""}</p>
                  </div>
                </div>
                {certificateModalSession.expertReview ? (
                  <>
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Expert feedback & marks</p>
                      <div className="flex flex-wrap gap-3 mb-2">
                        <span className="px-2 py-1 rounded-lg bg-amber-50 text-amber-700 text-sm font-bold">Overall: {certificateModalSession.expertReview.overallRating}/5</span>
                        {certificateModalSession.expertReview.technicalRating != null && <span className="px-2 py-1 rounded-lg bg-blue-50 text-blue-700 text-sm font-medium">Technical: {certificateModalSession.expertReview.technicalRating}/5</span>}
                        {certificateModalSession.expertReview.communicationRating != null && <span className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium">Communication: {certificateModalSession.expertReview.communicationRating}/5</span>}
                      </div>
                      {certificateModalSession.expertReview.feedback && <p className="text-sm text-slate-700 mt-2">{certificateModalSession.expertReview.feedback}</p>}
                      {(certificateModalSession.expertReview.strengths?.length || certificateModalSession.expertReview.weaknesses?.length) ? (
                        <div className="mt-3 space-y-2">
                          {certificateModalSession.expertReview.strengths?.length ? <p className="text-xs text-slate-600"><strong>Strengths:</strong> {certificateModalSession.expertReview.strengths.join(", ")}</p> : null}
                          {certificateModalSession.expertReview.weaknesses?.length ? <p className="text-xs text-slate-600"><strong>Areas to improve:</strong> {certificateModalSession.expertReview.weaknesses.join(", ")}</p> : null}
                        </div>
                      ) : null}
                    </div>
                    <p className="text-xs text-slate-500 border-t border-slate-100 pt-3">This session is completed and verified. You can download or share this certificate from the Certificates tab.</p>
                  </>
                ) : (
                  <p className="text-sm text-slate-500">Expert feedback is not available yet for this session.</p>
                )}
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
                <button onClick={() => setCertificateModalSession(null)} className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MySessions;
