import React, { useEffect, useState, useMemo } from "react";
import axios from "../../lib/axios";
import { toast } from "sonner";
import { Search, RefreshCw, ChevronLeft, ChevronRight, User, CheckCircle, XCircle, Clock, ExternalLink, Activity, Eye, FileText } from "lucide-react";

export default function Withdrawals() {
  const [loading, setLoading] = useState(true);
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<Record<string, any>>({});
  const [trackingLoading, setTrackingLoading] = useState<string | null>(null);

  // Expert Details Modal State
  const [viewModalData, setViewModalData] = useState<{ profile: any, sessions: any[], email: string } | null>(null);
  const [modalLoading, setModalLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const fetchWithdrawals = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/api/admin/withdrawals');
      if (res.data.success) {
        setWithdrawals(res.data.withdrawals || []);
      }
    } catch (err: any) {
      console.error('Fetch withdrawals failed', err);
      toast.error(err?.response?.data?.message || 'Failed to load payout requests');
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const updateWithdrawal = async (id: string, action: 'approve' | 'reject' | 'retryPayout') => {
    try {
      setProcessingId(id);
      const url = `/api/admin/withdrawals/${id}/${action}`;
      const res = await axios.put(url, {});
      if (res.data.success) {
        toast.success(`Withdrawal ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'retried'} successfully.`);
        fetchWithdrawals();
      }
    } catch (err: any) {
      console.error(`${action} failed`, err);
      toast.error(err?.response?.data?.message || `Failed to ${action} withdrawal`);
    } finally {
      setProcessingId(null);
    }
  };

  const trackPayout = async (payoutId: string) => {
    if (!payoutId) return;
    try {
      setTrackingLoading(payoutId);
      const res = await axios.get(`/api/payment/payout-status/${payoutId}`);
      if (res.data.success) {
        setTrackingData(prev => ({ ...prev, [payoutId]: res.data.payout }));
        toast.success("Live tracking updated");
      }
    } catch (err: any) {
      console.error('Failed to track payout', err);
      toast.error('Failed to fetch tracking data: ' + (err?.response?.data?.message || err.message));
    } finally {
      setTrackingLoading(null);
    }
  };

  const handleViewDetails = async (userId: string, email: string) => {
    try {
      setViewModalData({ profile: null, sessions: [], email });
      setModalLoading(true);

      // Fetch Profile and Sessions concurrently
      const [profileRes, sessionsRes] = await Promise.all([
        axios.get(`/api/expert/admin/profile/${userId}`).catch(() => ({ data: { profile: null } })),
        axios.get(`/api/sessions/user/${userId}/role/expert`).catch(() => ({ data: [] }))
      ]);

      let sessionsData = [];
      if (Array.isArray(sessionsRes.data)) {
        sessionsData = sessionsRes.data;
      } else if (sessionsRes.data?.data) {
        sessionsData = sessionsRes.data.data;
      }

      setViewModalData({
        profile: profileRes.data.profile,
        sessions: sessionsData,
        email
      });

    } catch (err) {
      console.error("Error loading expert details", err);
      toast.error("Failed to load full expert details");
      setViewModalData(null);
    } finally {
      setModalLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return withdrawals;
    return withdrawals.filter(
      (w) => {
        const name = (w.userId?.name || '').toLowerCase();
        const email = (w.userId?.email || '').toLowerCase();
        return name.includes(q) || email.includes(q);
      }
    );
  }, [withdrawals, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [totalPages, page, search]);

  const pageData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-gray-100/50">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div><div className="h-3 bg-gray-100 rounded w-20 mt-2"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32 mx-auto"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-24"></div></td>
      <td className="px-6 py-4"><div className="h-6 bg-gray-200 rounded-full w-20"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded w-24 ml-auto"></div></td>
    </tr>
  );

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Payout Requests</h2>
          <p className="text-sm text-gray-500 mt-1">Manage expert withdrawals and track payouts.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
            />
          </div>
          <button
            onClick={fetchWithdrawals}
            className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-gray-50/50 border-b border-gray-100">
              <tr>
                <th className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider">Expert Details</th>
                <th className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider">Amount</th>
                <th className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider">Bank Info</th>
                <th className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider">Requested On</th>
                <th className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
              ) : pageData.length > 0 ? (
                pageData.map((w) => {
                  const user = w.userId || {};
                  return (
                    <React.Fragment key={w._id}>
                      <tr className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                              <User size={14} />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name || 'Unknown'}</p>
                              <p className="text-xs text-gray-500">{user.email || 'N/A'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className="font-semibold text-gray-900">₹{w.amount?.toLocaleString()}</span>
                        </td>
                        <td className="py-4 px-6">
                          {w.userBankInfo ? (
                            <div className="text-xs text-gray-600">
                              <p><span className="font-medium text-gray-800">Acc:</span> {w.userBankInfo.accountNumber}</p>
                              <p><span className="font-medium text-gray-800">IFSC:</span> {w.userBankInfo.ifscCode}</p>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Not provided</span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-gray-600">
                          <div className="flex items-center gap-2 text-xs">
                            <Clock size={14} className="text-gray-400" />
                            {new Date(w.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
                            w.status === 'processed' ? 'bg-green-50 text-green-700 border-green-100' :
                            w.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-100' :
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {w.status === 'processed' && <CheckCircle size={12} />}
                            {w.status === 'rejected' && <XCircle size={12} />}
                            {w.status === 'initiated' && <Clock size={12} />}
                            {w.status.charAt(0).toUpperCase() + w.status.slice(1)}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* View Details Button */}
                            <button
                              onClick={() => handleViewDetails(user._id, user.email)}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-blue-600 text-xs font-medium rounded-lg transition-colors shadow-sm"
                              title="View Full Expert Details & Sessions"
                            >
                              <Eye size={14} />
                              Details
                            </button>

                            {w.status === 'initiated' && (
                              <>
                                <button
                                  disabled={processingId === w._id}
                                  onClick={() => updateWithdrawal(w._id, 'approve')}
                                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                  {processingId === w._id ? '...' : 'Process'}
                                </button>
                                <button
                                  disabled={processingId === w._id}
                                  onClick={() => updateWithdrawal(w._id, 'reject')}
                                  className="px-3 py-1.5 bg-white border border-red-200 text-red-600 hover:bg-red-50 text-xs font-medium rounded-lg transition-colors disabled:opacity-50"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            {w.status === 'processed' && w.referenceId?.startsWith('pout_') && (
                              <button
                                onClick={() => trackPayout(w.referenceId)}
                                disabled={trackingLoading === w.referenceId}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                              >
                                <Activity size={14} className={trackingLoading === w.referenceId ? "animate-spin" : ""} />
                                {trackingLoading === w.referenceId ? 'Tracking...' : 'Track'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                      {/* Tracking Data Expansion Row */}
                      {trackingData[w.referenceId] && (
                        <tr className="bg-slate-50/80 border-b border-gray-100">
                          <td colSpan={6} className="px-6 py-4">
                            <div className="rounded-xl bg-white border border-slate-200 p-4 shadow-sm flex items-start gap-6">
                              <div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-2">Live Status</p>
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                                  trackingData[w.referenceId].status === 'processed' ? 'bg-green-50 text-green-700 border-green-100' :
                                  ['failed', 'reversed'].includes(trackingData[w.referenceId].status) ? 'bg-red-50 text-red-700 border-red-100' :
                                  'bg-blue-50 text-blue-700 border-blue-100'
                                }`}>
                                  {trackingData[w.referenceId].status.toUpperCase()}
                                </span>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Transfer Mode</p>
                                <p className="text-sm font-medium text-slate-900">{trackingData[w.referenceId].mode || 'N/A'}</p>
                              </div>
                              <div>
                                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Created At</p>
                                <p className="text-sm font-medium text-slate-900">
                                  {new Date(trackingData[w.referenceId].created_at * 1000).toLocaleString()}
                                </p>
                              </div>
                              {trackingData[w.referenceId].failure_reason && (
                                <div>
                                  <p className="text-xs text-red-500 font-medium uppercase tracking-wider mb-1">Failure Reason</p>
                                  <p className="text-sm font-medium text-red-700">{trackingData[w.referenceId].failure_reason}</p>
                                </div>
                              )}
                              <div className="ml-auto">
                                <a 
                                  href={`https://dashboard.razorpay.com/app/payouts/${w.referenceId}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline"
                                >
                                  View in Razorpay <ExternalLink size={12} />
                                </a>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-20 text-center text-gray-500">
                    No payouts found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer */}
      {!loading && filtered.length > 0 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-500">
            Showing {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className={`p-2 rounded-lg border ${page === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                if (p !== 1 && p !== totalPages && (p < page - 1 || p > page + 1)) {
                  if (p === page - 2 || p === page + 2) return <span key={p} className="px-1 text-gray-400">..</span>;
                  return null;
                }
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === p
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:bg-gray-50'
                      }`}
                  >
                    {p}
                  </button>
                )
              })}
            </div>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={`p-2 rounded-lg border ${page === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Unified Expert Details & Sessions Modal */}
      {viewModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div 
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" 
            onClick={() => setViewModalData(null)}
          ></div>
          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex-none bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  {viewModalData.profile ? viewModalData.profile.name : "Loading Details..."}
                </h3>
                <p className="text-sm text-gray-500">Expert Verification & Session History</p>
              </div>
              <button 
                onClick={() => setViewModalData(null)} 
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6">
              {modalLoading && !viewModalData.profile ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <RefreshCw className="animate-spin text-blue-500 mb-4" size={32} />
                  <p className="text-gray-500 font-medium">Fetching expert records...</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* --- TOP: Profile Information --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Personal Information */}
                    <section className="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                      <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <span className="w-6 h-0.5 bg-blue-600 rounded-full"></span>
                        Personal Information
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100/50">
                          <span className="text-sm text-gray-500">Email</span>
                          <span className="text-sm font-medium text-gray-900">{viewModalData.email || "N/A"}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100/50">
                          <span className="text-sm text-gray-500">Mobile</span>
                          <span className="text-sm font-medium text-gray-900">{viewModalData.profile?.mobile || "N/A"}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100/50">
                          <span className="text-sm text-gray-500">Location</span>
                          <span className="text-sm font-medium text-gray-900">
                            {[viewModalData.profile?.city, viewModalData.profile?.state, viewModalData.profile?.country].filter(Boolean).join(', ') || "N/A"}
                          </span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-gray-500">Category</span>
                          <span className="text-sm font-medium text-gray-900">{viewModalData.profile?.category || "General"}</span>
                        </div>
                      </div>
                    </section>

                    {/* Professional Information */}
                    <section className="bg-gray-50/50 rounded-xl p-5 border border-gray-100">
                      <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                        <span className="w-6 h-0.5 bg-green-600 rounded-full"></span>
                        Professional Details
                      </h4>
                      <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b border-gray-100/50">
                          <span className="text-sm text-gray-500">Title</span>
                          <span className="text-sm font-medium text-gray-900">{viewModalData.profile?.title || "N/A"}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100/50">
                          <span className="text-sm text-gray-500">Company</span>
                          <span className="text-sm font-medium text-gray-900">{viewModalData.profile?.company || "N/A"}</span>
                        </div>
                        <div className="flex justify-between py-2 border-b border-gray-100/50">
                          <span className="text-sm text-gray-500">Experience</span>
                          <span className="text-sm font-medium text-gray-900">{viewModalData.profile?.totalExperience || 0} years</span>
                        </div>
                        <div className="flex justify-between py-2">
                          <span className="text-sm text-gray-500">Industry</span>
                          <span className="text-sm font-medium text-gray-900">{viewModalData.profile?.industry || "N/A"}</span>
                        </div>
                      </div>
                    </section>
                  </div>

                  {/* --- BOTTOM: Sessions History --- */}
                  <section>
                    <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText size={18} className="text-blue-600" />
                      Session History ({viewModalData.sessions.length})
                    </h4>
                    <div className="overflow-x-auto rounded-xl border border-gray-200">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-slate-50 border-b border-slate-200">
                          <tr>
                            <th className="py-3 px-4 font-medium text-slate-600 uppercase tracking-wider text-xs">Date & Time</th>
                            <th className="py-3 px-4 font-medium text-slate-600 uppercase tracking-wider text-xs">Candidate</th>
                            <th className="py-3 px-4 font-medium text-slate-600 uppercase tracking-wider text-xs">Topic</th>
                            <th className="py-3 px-4 font-medium text-slate-600 uppercase tracking-wider text-xs">Status</th>
                            <th className="py-3 px-4 font-medium text-slate-600 uppercase tracking-wider text-xs text-right">Revenue</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 bg-white">
                          {viewModalData.sessions.length > 0 ? (
                            viewModalData.sessions.map((s, i) => (
                              <tr key={i} className="hover:bg-slate-50/50 transition-colors">
                                <td className="py-3 px-4">
                                  <div className="text-gray-900 font-medium">{new Date(s.startTime).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                                  <div className="text-gray-500 text-xs">{new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                </td>
                                <td className="py-3 px-4">
                                  <div className="font-medium text-gray-900">{s.candidateDetails?.name || s.candidateName || 'Candidate'}</div>
                                  <div className="text-xs text-gray-500">{s.candidateDetails?.email || ''}</div>
                                </td>
                                <td className="py-3 px-4 text-gray-600 max-w-[200px] truncate">
                                  {s.topics?.length > 0 ? s.topics.join(', ') : 'Mock Interview'}
                                </td>
                                <td className="py-3 px-4">
                                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border ${
                                    s.status === 'completed' ? 'bg-green-50 text-green-700 border-green-100' :
                                    s.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                                    s.status === 'cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                                    'bg-amber-50 text-amber-700 border-amber-100'
                                  }`}>
                                    {s.status.charAt(0).toUpperCase() + s.status.slice(1)}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-right font-medium text-gray-900">
                                  ₹{s.price?.toLocaleString()}
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={5} className="py-12 text-center">
                                <div className="text-gray-400 mb-2"><FileText className="mx-auto" size={24} /></div>
                                <p className="text-gray-500 font-medium">No sessions found for this expert.</p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
