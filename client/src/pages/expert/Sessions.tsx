// src/pages/expert/Sessions.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Clock, AlertCircle, Search, ChevronLeft, ChevronRight, X, Star, Timer as TimerIcon, Loader2, LayoutDashboard, User as UserIcon, RefreshCw } from 'lucide-react';
import { useAuth } from "../../context/AuthContext";
import axios from '../../lib/axios';
import { toast } from "sonner";
import { PrimaryButton, SecondaryButton } from '../ExpertDashboard';

interface CandidateDetails {
    email: string;
    phone?: string;
    location?: string;
    education: any[];
    experience: any[];
    skills: string[];
    profileImage?: string;
}

interface Session {
    _id: string;
    sessionId: string;
    startTime: string;
    endTime: string;
    status: string;
    topics: string[];
    candidateName: string;
    candidateId: string;
    expertId: string;
    price?: number;
    candidateDetails?: CandidateDetails; // Populated from backend
}

export default function Sessions() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [allSessions, setAllSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(false); // For actions like joining/reviewing
    const [loadingSessions, setLoadingSessions] = useState(true); // For initial fetch
    const [currentTime, setCurrentTime] = useState(new Date());

    // --- FILTERS & PAGINATION STATE ---
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    // --- MODAL STATE ---
    const [activeSession, setActiveSession] = useState<Session | null>(null); // For Master-Detail View
    const [selectedCandidate, setSelectedCandidate] = useState<Session | null>(null); // For Profile View
    const [reviewSession, setReviewSession] = useState<Session | null>(null); // For Review Form
    const [submittingReview, setSubmittingReview] = useState(false);

    // Review Form State
    const [reviewForm, setReviewForm] = useState({
        overallRating: 5,
        technicalRating: 5,
        communicationRating: 5,
        feedback: "",
        strengths: "",
        weaknesses: ""
    });

    const currentUserId = user?.id || "";

    // Timer Effect
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch Sessions Logic
    const fetchSessions = async (showLoading = true) => {
        if (!currentUserId) return;
        if (showLoading) setLoadingSessions(true);
        try {
            const res = await axios.get(`/api/sessions/user/${currentUserId}/role/expert`);
            const data = res.data;
            if (Array.isArray(data)) {
                // Sort by newest first
                const sorted = data.sort((a: any, b: any) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
                setAllSessions(sorted);
            } else {
                setAllSessions([]);
            }
        } catch (err) {
            console.error("Failed to fetch sessions", err);
            toast.error("Could not load sessions");
        } finally {
            if (showLoading) setLoadingSessions(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [currentUserId]);

    // --- FILTER LOGIC ---
    const filteredSessions = allSessions.filter(session => {
        const matchesSearch =
            session.candidateName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            session.topics?.some(t => t.toLowerCase().includes(searchTerm.toLowerCase())) ||
            session.sessionId.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || session.status.toLowerCase() === statusFilter.toLowerCase();

        return matchesSearch && matchesStatus;
    });

    // --- PAGINATION LOGIC ---
    const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentSessions = filteredSessions.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1); // Reset page on filter change
    }, [searchTerm, statusFilter]);


    // --- HANDLERS ---
    const handleJoin = async (session: Session) => {
        setLoading(true);
        try {
            const res = await axios.post(`/api/sessions/${session.sessionId}/join`, { userId: currentUserId });
            const data = res.data;

            if (res.status === 200 && data.permitted) {
                navigate(`/live-meeting?meetingId=${data.meetingId}`, {
                    state: {
                        role: 'expert',
                        meetingId: data.meetingId
                    }
                });
            } else {
                toast.error(data.message || "Cannot join session at this time.");
            }
        } catch (error) {
            console.error("Join Error:", error);
            toast.error("Failed to join session.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitReview = async () => {
        if (!reviewSession) return;
        setSubmittingReview(true);
        try {
            const payload = {
                overallRating: reviewForm.overallRating,
                technicalRating: reviewForm.technicalRating,
                communicationRating: reviewForm.communicationRating,
                feedback: reviewForm.feedback,
                strengths: reviewForm.strengths.split(',').map(s => s.trim()).filter(Boolean),
                weaknesses: reviewForm.weaknesses.split(',').map(s => s.trim()).filter(Boolean),
                expertId: currentUserId,
                candidateId: reviewSession.candidateId, // Send raw ID, backend knows format
                reviewerRole: 'expert'
            };

            const res = await axios.post(`/api/sessions/${reviewSession.sessionId}/review`, payload);

            if (res.data.success) {
                toast.success("Review submitted successfully!");
                setReviewSession(null);
                setReviewForm({ // Reset form
                    overallRating: 5,
                    technicalRating: 5,
                    communicationRating: 5,
                    feedback: "",
                    strengths: "",
                    weaknesses: ""
                });

                // Optionally update local session status to completed/reviewed
                setAllSessions(prev => prev.map(s =>
                    s.sessionId === reviewSession.sessionId ? { ...s, status: 'completed' } : s
                ));
            }
        } catch (error: any) {
            console.error("Review Error:", error);
            toast.error(error.response?.data?.message || "Failed to submit review");
        } finally {
            setSubmittingReview(false);
        }
    };

    const isSessionActive = (session: Session) => {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);
        const bufferStart = new Date(start.getTime() - 10 * 60 * 1000); // 10 mins early
        return currentTime >= bufferStart && currentTime < end;
    };

    const isSessionEnded = (session: Session) => {
        return currentTime > new Date(session.endTime);
    };

    const getTimerDisplay = (session: Session) => {
        const start = new Date(session.startTime);
        const end = new Date(session.endTime);

        if (currentTime < start) {
            const diff = start.getTime() - currentTime.getTime();
            const mins = Math.ceil(diff / 60000);
            if (mins > 60) {
                const hours = Math.ceil(mins / 60);
                return { text: `Starts in ${hours}h`, color: 'text-blue-600 bg-blue-50' };
            }
            return { text: `Starts in ${mins}m`, color: 'text-amber-600 bg-amber-50' };
        }

        if (currentTime >= start && currentTime < end) {
            const diff = end.getTime() - currentTime.getTime();
            const mins = Math.ceil(diff / 60000);
            return { text: `Ends in ${mins}m`, color: 'text-red-600 bg-red-50 animate-pulse' };
        }

        return { text: 'Ended', color: 'text-gray-500 bg-gray-100' };
    };

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
            case 'completed': return 'bg-gray-100 text-gray-700 border-gray-200';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-blue-100 text-blue-700 border-blue-200';
        }
    };

    if (!user) return <div className="p-8 text-center">Please log in to view sessions.</div>;

    return (
        <>
            <div className="h-full">
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
                    <div className="flex-1 flex min-h-0">
                        {/* --- LEFT SIDEBAR (SESSION LIST) --- */}
                        <div className={`${activeSession ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-gray-200 bg-white flex-col shrink-0 transition-all duration-300`}>
                            {/* Search & Filters */}
                            <div className="p-4 border-b border-gray-100 space-y-3 bg-gray-50/50">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                                    {['all', 'confirmed', 'completed'].map(status => (
                                        <button
                                            key={status}
                                            onClick={() => setStatusFilter(status)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap border ${statusFilter === status
                                                ? 'bg-blue-600 text-white border-blue-600'
                                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                                }`}
                                        >
                                            {status.charAt(0).toUpperCase() + status.slice(1)}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => fetchSessions(true)}
                                        className="p-1 px-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-blue-600 transition-colors"
                                        title="Refresh Sessions"
                                        disabled={loadingSessions}
                                    >
                                        <RefreshCw className={`w-3.5 h-3.5 ${loadingSessions ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                            </div>

                            {/* List */}
                            <div className="flex-1 overflow-y-auto">
                                {loadingSessions ? (
                                    <div className="divide-y divide-gray-100">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                            <div key={i} className="p-4 animate-pulse flex flex-col gap-2">
                                                <div className="flex justify-between items-center">
                                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                                                </div>
                                                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-1/4 mt-1"></div>
                                            </div>
                                        ))}
                                    </div>
                                ) : currentSessions.length > 0 ? (
                                    <div className="divide-y divide-gray-100">
                                        {currentSessions.map(session => {
                                            // Auto-select first session if none selected
                                            const isActive = activeSession?._id === session._id;
                                            return (
                                                <button
                                                    key={session._id}
                                                    onClick={() => setActiveSession(session)}
                                                    className={`w-full text-left p-4 hover:bg-gray-50 transition-colors flex flex-col gap-1 ${isActive ? 'bg-blue-50/50 border-l-4 border-blue-600 pl-3' : 'pl-4 border-l-4 border-transparent'}`}
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="font-semibold text-gray-900 line-clamp-1">{session.candidateName || "Candidate"}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getStatusColor(session.status)}`}>{session.status}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 line-clamp-1">{session.topics?.join(', ')}</div>
                                                    <div className="flex items-center gap-2 mt-2 text-xs text-gray-400">
                                                        <Clock className="w-3 h-3" />
                                                        {new Date(session.startTime).toLocaleDateString()} • {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </div>
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="p-8 text-center text-gray-500 text-sm">No sessions found</div>
                                )}
                            </div>

                            {/* Pagination (Mini) */}
                            {totalPages > 1 && (
                                <div className="p-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="text-xs font-medium text-gray-600">Page {currentPage} / {totalPages}</span>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-1 hover:bg-gray-200 rounded disabled:opacity-50"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* --- RIGHT CONTENT (DETAILS) --- */}
                        <div className={`${!activeSession ? 'hidden md:flex' : 'flex'} flex-1 overflow-y-auto bg-gray-50/30 p-4 md:p-6 flex-col`}>
                            {activeSession ? (
                                <div className="max-w-3xl mx-auto w-full space-y-6">
                                    {/* Mobile Back Button */}
                                    <button
                                        onClick={() => setActiveSession(null)}
                                        className="md:hidden flex items-center gap-2 text-gray-500 mb-2 hover:text-gray-900 font-medium"
                                    >
                                        <ChevronLeft className="w-4 h-4" /> Back to Sessions
                                    </button>

                                    {/* Session Header Card */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                        <div className="flex flex-col md:flex-row md:items-start justify-between mb-6 gap-4">
                                            <div>
                                                <h2 className="text-2xl font-bold text-gray-900 mb-2">{activeSession.topics?.join(', ')}</h2>
                                                <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
                                                    <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium">
                                                        <Clock className="w-4 h-4" />
                                                        {new Date(activeSession.startTime).toDateString()}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 bg-gray-100 px-2 py-1 rounded text-gray-700 font-medium whitespace-nowrap">
                                                        <TimerIcon className="w-4 h-4" />
                                                        {new Date(activeSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(activeSession.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className={`self-start px-3 py-1 rounded-full text-sm font-bold border capitalize ${getStatusColor(activeSession.status)}`}>
                                                {activeSession.status}
                                            </div>
                                        </div>

                                        <div className="flex gap-4">
                                            <button
                                                onClick={() => handleJoin(activeSession)}
                                                disabled={!isSessionActive(activeSession) || loading}
                                                className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-white transition-all shadow-sm ${isSessionActive(activeSession)
                                                    ? 'bg-blue-600 hover:bg-blue-700 hover:shadow-md hover:-translate-y-0.5'
                                                    : 'bg-gray-300 cursor-not-allowed'
                                                    }`}
                                            >
                                                <Video className="w-5 h-5" />
                                                {loading ? 'Joining...' : 'Join Meeting Phase'}
                                            </button>
                                        </div>
                                        {!isSessionActive(activeSession) && (
                                            <p className="text-center text-sm text-gray-400 mt-3 flex items-center justify-center gap-1">
                                                <AlertCircle className="w-4 h-4" />
                                                {currentTime > new Date(activeSession.endTime) ? 'Session has ended' : 'Session has not started yet'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Candidate Card */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
                                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                            <UserIcon size={20} className="text-blue-600" />
                                            Candidate Details
                                        </h3>
                                        <div className="flex items-center gap-4 mb-6">
                                            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-2xl font-bold shrink-0">
                                                {activeSession.candidateName?.[0] || "C"}
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <h4 className="text-lg font-bold text-gray-900 truncate">{activeSession.candidateName}</h4>
                                            </div>
                                            <button
                                                onClick={() => setSelectedCandidate(activeSession)}
                                                className="ml-auto text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline whitespace-nowrap"
                                            >
                                                View Full Profile
                                            </button>
                                        </div>
                                    </div>

                                    {/* Action Card */}
                                    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900">Post-Session Review</h3>
                                            <p className="text-sm text-gray-500">Submit feedback for the candidate after the session.</p>
                                        </div>
                                        <button
                                            onClick={() => isSessionEnded(activeSession) ? setReviewSession(activeSession) : toast.error("Wait for session to end")}
                                            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-medium border transition-colors ${isSessionEnded(activeSession)
                                                ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                                                : 'bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed'
                                                }`}
                                        >
                                            Write Review
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <LayoutDashboard className="w-8 h-8 text-gray-300" />
                                    </div>
                                    <p>Select a session from the list to view details</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>



            {/* --- CANDIDATE PROFILE MODAL (REAL DATA) --- */}
            {
                selectedCandidate && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity" onClick={() => setSelectedCandidate(null)}></div>
                        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
                            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{selectedCandidate.candidateName || "Candidate Profile"}</h3>
                                    <p className="text-sm text-gray-500">Applicant Details & Resume</p>
                                </div>
                                <button onClick={() => setSelectedCandidate(null)} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-8">
                                {/* Header Info */}
                                <div className="flex flex-col sm:flex-row gap-6 items-start">
                                    <div className="w-20 h-20 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-3xl font-bold overflow-hidden">
                                        {/* Use real mock avatar or initials */}
                                        {selectedCandidate.candidateDetails?.profileImage ? (
                                            <img src={selectedCandidate.candidateDetails.profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            (selectedCandidate.candidateName || "UK").slice(0, 2).toUpperCase()
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-2">
                                        <h4 className="font-semibold text-lg text-gray-900">Personal Information</h4>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="text-gray-500 block">Email</span>
                                                <span className="font-medium text-gray-900">{selectedCandidate.candidateDetails?.email || "N/A"}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">Phone</span>
                                                <span className="font-medium text-gray-900">{selectedCandidate.candidateDetails?.phone || "N/A"}</span>
                                            </div>
                                            <div>
                                                <span className="text-gray-500 block">Location</span>
                                                <span className="font-medium text-gray-900">{selectedCandidate.candidateDetails?.location || "N/A"}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Skills Section */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-blue-600 rounded-full"></span>
                                        Skills & Expertise
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {(selectedCandidate.candidateDetails?.skills && selectedCandidate.candidateDetails.skills.length > 0) ? (
                                            selectedCandidate.candidateDetails.skills.map((skill, i) => (
                                                <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full border border-blue-100">
                                                    {skill}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-sm text-gray-400 italic">No skills listed</span>
                                        )}
                                    </div>
                                </div>

                                {/* Experience Section */}
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                        <span className="w-1 h-6 bg-green-600 rounded-full"></span>
                                        Work Experience
                                    </h4>
                                    <div className="space-y-4">
                                        {(selectedCandidate.candidateDetails?.experience && selectedCandidate.candidateDetails.experience.length > 0) ? (
                                            selectedCandidate.candidateDetails.experience.map((exp, i) => (
                                                <div key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50 border border-gray-100">
                                                    <div className="mt-1">
                                                        <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                                                    </div>
                                                    <div>
                                                        <h5 className="font-medium text-gray-900">{exp.position}</h5>
                                                        <p className="text-sm text-gray-600">{exp.company}</p>
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            {new Date(exp.startDate).getFullYear()} - {exp.current ? 'Present' : (exp.endDate ? new Date(exp.endDate).getFullYear() : '')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No work experience listed</p>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
                                    <SecondaryButton onClick={() => setSelectedCandidate(null)}>Close</SecondaryButton>
                                    <PrimaryButton onClick={() => {
                                        toast.success("Resume download not implemented yet");
                                    }}>Download Resume</PrimaryButton>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* --- REVIEW SESSION MODAL (REAL FORM) --- */}
            {
                reviewSession && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-100 scale-100">
                        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm" onClick={() => setReviewSession(null)}></div>
                        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200 h-auto max-h-[90vh] overflow-y-auto">
                            <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between sticky top-0 bg-white z-10">
                                <h3 className="font-bold text-gray-900 text-lg">Submit Feedback</h3>
                                <button onClick={() => setReviewSession(null)} className="text-gray-400 hover:text-gray-600">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-6">
                                <div className="bg-blue-50 p-4 rounded-lg flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-blue-200 text-blue-700 flex items-center justify-center font-bold text-lg">
                                        {reviewSession.candidateName?.[0] || "C"}
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Reviewing Candidate</p>
                                        <p className="font-bold text-gray-900">{reviewSession.candidateName}</p>
                                    </div>
                                </div>

                                {/* Ratings */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Overall Performance</label>
                                        <div className="flex gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    onClick={() => setReviewForm(prev => ({ ...prev, overallRating: star }))}
                                                    className={`transition-transform hover:scale-110 ${star <= reviewForm.overallRating ? 'text-amber-400' : 'text-gray-300'}`}
                                                >
                                                    <Star className="w-8 h-8 fill-current" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Technical Skills</label>
                                            <input
                                                type="number" min="1" max="5"
                                                value={reviewForm.technicalRating}
                                                onChange={e => setReviewForm(prev => ({ ...prev, technicalRating: parseInt(e.target.value) }))}
                                                className="w-full border rounded p-2"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Communication</label>
                                            <input
                                                type="number" min="1" max="5"
                                                value={reviewForm.communicationRating}
                                                onChange={e => setReviewForm(prev => ({ ...prev, communicationRating: parseInt(e.target.value) }))}
                                                className="w-full border rounded p-2"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Text Inputs */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Strengths (comma separated)</label>
                                    <input
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="Good React knowledge, Clear communication..."
                                        value={reviewForm.strengths}
                                        onChange={e => setReviewForm(prev => ({ ...prev, strengths: e.target.value }))}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Areas for Improvement (comma separated)</label>
                                    <input
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                        placeholder="System design depth, Error handling..."
                                        value={reviewForm.weaknesses}
                                        onChange={e => setReviewForm(prev => ({ ...prev, weaknesses: e.target.value }))}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Feedback</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[120px]"
                                        placeholder="Write a detailed summary of the interview..."
                                        value={reviewForm.feedback}
                                        onChange={e => setReviewForm(prev => ({ ...prev, feedback: e.target.value }))}
                                    ></textarea>
                                </div>

                                <PrimaryButton
                                    className="w-full justify-center flex items-center gap-2"
                                    onClick={handleSubmitReview}
                                    disabled={submittingReview}
                                >
                                    {submittingReview && <Loader2 className="w-4 h-4 animate-spin" />}
                                    {submittingReview ? "Submitting..." : "Submit Review"}
                                </PrimaryButton>
                            </div>
                        </div>
                    </div>
                )
            }
        </>
    );
}
