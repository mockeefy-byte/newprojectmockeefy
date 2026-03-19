import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../context/AuthContext";
import axios from "../lib/axios";
import { Award, ChevronRight, Download, X } from "lucide-react";
import { getProfileImageUrl } from "../lib/imageUtils";

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
  profileImage?: string | null;
  startTime?: string;
  category?: string;
  status: string;
  expertReview?: ReviewInfo | null;
  candidateReview?: ReviewInfo | null;
};

export default function CertificatesPage() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const completedSessions = useMemo(() => {
    return sessions.filter((s) => (s.status || "").toLowerCase() === "completed");
  }, [sessions]);

  // Pagination (same pattern as My Bookings)
  const sortedCompleted = useMemo(() => {
    return completedSessions
      .slice()
      .sort((a, b) => new Date(b.startTime || 0).getTime() - new Date(a.startTime || 0).getTime());
  }, [completedSessions]);

  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(sortedCompleted.length / PAGE_SIZE));

  useEffect(() => {
    setPage(1);
  }, [sortedCompleted.length]);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageStartIdx = (page - 1) * PAGE_SIZE;
  const pageEndIdx = Math.min(sortedCompleted.length, pageStartIdx + PAGE_SIZE);
  const pagedCertificates = sortedCompleted.slice(pageStartIdx, pageEndIdx);

  useEffect(() => {
    const fetchSessions = async () => {
      const userId = (user as any)?.id || (user as any)?._id;
      if (!userId) return;
      setLoading(true);
      try {
        const res = await axios.get(`/api/sessions/candidate/${userId}`);
        const raw = Array.isArray(res.data) ? res.data : [];
        const mapped: Session[] = raw.map((s: any) => ({
          id: s._id || s.sessionId,
          sessionId: s.sessionId,
          expert: s.expertDetails?.name || s.expertId?.name || "Expert",
          profileImage: s.expertDetails?.profileImage || s.expertId?.profileImage || null,
          startTime: s.startTime,
          category: s.categoryName || s.category || s.expertDetails?.personalInformation?.category || "IT",
          status: (s.status || "").charAt(0).toUpperCase() + (s.status || "").slice(1),
          expertReview: s.expertReview || null,
          candidateReview: s.candidateReview || null,
        }));
        setSessions(mapped);
      } catch (e) {
        console.error(e);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [user]);

  return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-5xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 text-elite-blue" />
                <h1 className="font-elite leading-none text-slate-900">My Certificates</h1>
              </div>
              <p className="text-[10px] text-slate-500 font-medium">Completed sessions — view verified certificates</p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50 text-elite-blue border border-blue-100">
                <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                <span className="text-[8px] font-black tracking-tight uppercase">Verified</span>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Total</span>
                <span className="text-[10px] font-black text-slate-700 tabular-nums">{sortedCompleted.length}</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6">
              <div className="h-10 bg-slate-50 rounded-xl animate-pulse" />
              <div className="h-10 bg-slate-50 rounded-xl animate-pulse mt-3" />
              <div className="h-10 bg-slate-50 rounded-xl animate-pulse mt-3" />
            </div>
          ) : completedSessions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Certificate details
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Date issued
                    </th>
                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {pagedCertificates.map((session) => (
                      <tr key={session.id} className="hover:bg-slate-50/30 transition-colors">
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-elite-blue shrink-0 overflow-hidden border border-blue-100">
                              {session.profileImage ? (
                                <img
                                  src={getProfileImageUrl(session.profileImage)}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Award size={20} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-bold text-slate-900 text-sm">Certificate of Completion</h3>
                              <p className="text-xs text-slate-500 mt-0.5 truncate">
                                {session.category} Simulation with {session.expert}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className="text-sm font-bold text-slate-700">
                            {session.startTime ? new Date(session.startTime).toLocaleDateString() : "—"}
                          </p>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-0.5">Verified</p>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => setSelectedSession(session)}
                              className="px-4 py-2 border border-slate-200 hover:border-elite-blue hover:text-elite-blue text-slate-600 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                            >
                              View <ChevronRight size={12} strokeWidth={3} />
                            </button>
                            <button
                              type="button"
                              disabled
                              className="px-4 py-2 bg-slate-50 border border-slate-200 text-slate-400 rounded-lg text-xs font-bold transition-all flex items-center gap-2"
                              title="PDF download coming soon"
                            >
                              <Download size={14} />
                              PDF
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-16 text-center flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center mb-4">
                <Award className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-slate-900 font-bold mb-1">No Certificates Yet</h3>
              <p className="text-slate-500 text-sm max-w-xs mx-auto">
                Complete sessions to unlock certificates. Your verified certificates will appear here.
              </p>
            </div>
          )}

          {/* Pagination footer (desktop) */}
          {!loading && sortedCompleted.length > 0 && (
            <div className="hidden md:flex items-center justify-between px-5 py-4 border-t border-slate-100 bg-white">
              <div className="text-[10px] font-bold text-slate-500">
                Showing <span className="text-slate-700 tabular-nums">{pageStartIdx + 1}</span>–<span className="text-slate-700 tabular-nums">{pageEndIdx}</span> of{" "}
                <span className="text-slate-700 tabular-nums">{sortedCompleted.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black hover:border-elite-blue hover:text-elite-blue disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all"
                >
                  Prev
                </button>
                <div className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-700 tabular-nums">
                  Page {page} / {totalPages}
                </div>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-[10px] font-black hover:border-elite-blue hover:text-elite-blue disabled:opacity-50 disabled:hover:border-slate-200 disabled:hover:text-slate-600 transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Pagination footer (mobile) */}
          {!loading && sortedCompleted.length > 0 && (
            <div className="md:hidden px-4 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold disabled:opacity-50"
              >
                Prev
              </button>
              <div className="text-xs font-bold text-slate-600 tabular-nums">
                {pageStartIdx + 1}-{pageEndIdx} / {sortedCompleted.length}
              </div>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* Certificate details modal */}
        {selectedSession && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Award size={20} className="text-elite-blue" /> Certificate details
                </h3>
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-elite-blue overflow-hidden">
                    {selectedSession.profileImage ? (
                      <img
                        src={getProfileImageUrl(selectedSession.profileImage)}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Award size={20} />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900">Certificate of Completion</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {selectedSession.category} Simulation with {selectedSession.expert}
                    </p>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider mt-1">
                      Issued: {selectedSession.startTime ? new Date(selectedSession.startTime).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                  <p className="text-sm text-slate-700 font-semibold">Verified completion</p>
                  <p className="text-xs text-slate-500 mt-1">
                    This session is completed and verified in the system.
                  </p>
                </div>
              </div>
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedSession(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}

