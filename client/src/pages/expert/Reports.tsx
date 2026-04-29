
import { useState, useEffect } from "react";
import axios from "../../lib/axios";
import { toast } from "sonner";
import { Search, FileText, CheckCircle, Clock } from "lucide-react";
import { PrimaryButton } from "../ExpertDashboard";

interface Session {
    _id: string;
    candidateId: { _id: string; name: string; email: string };
    startTime: string;
    date?: string; // fallback if startTime is ISO
    status: string;
}

interface Report {
    _id: string;
    sessionId: { _id: string; date?: string; timeSlot?: string };
    candidateId: { name: string };
    scores: {
        technical: number;
        communication: number;
        confidence: number;
    };
    status: string;
    createdAt: string;
}

export default function ExpertReports() {
    const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
    const [sessions, setSessions] = useState<Session[]>([]);
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(false);

    // Modal State
    const [selectedSession, setSelectedSession] = useState<Session | null>(null);
    const [formData, setFormData] = useState({
        technical: 0,
        communication: 0,
        confidence: 0,
        systemDesign: 0,
        problemSolving: 0,
        strengths: '',
        improvements: '',
        detailedComments: ''
    });

    useEffect(() => {
        if (activeTab === 'pending') fetchPendingSessions();
        else fetchReportHistory();
    }, [activeTab]);

    const fetchPendingSessions = async () => {
        setLoading(true);
        try {
            // Fetch "completed" sessions that don't have a report yet?
            // Or just fetch all sessions and filter?
            // Ideally backend endpoint /api/expert/sessions?status=completed&noReport=true
            // For now, let's just fetch completed sessions from existing endpoint if possible.
            // Or search existing reports to exclude.
            const res = await axios.get("/api/expert/sessions"); // Assuming this returns all sessions
            const allSessions = res.data.sessions || []; // Check structure

            const reportsRes = await axios.get("/api/reports");
            const reportSessionIds = new Set(reportsRes.data.map((r: any) => r.sessionId._id));

            // Filter for completed sessions without reports
            //   const pending = allSessions.filter((s: Session) => 
            //     (s.status === 'completed' || s.status === 'Completed') && !reportSessionIds.has(s._id)
            //   );
            // Mocking filtering for now as status might vary
            const pending = allSessions.filter((s: Session) =>
                ['completed', 'Completed'].includes(s.status) && !reportSessionIds.has(s._id)
            );

            setSessions(pending);
        } catch (error) {
            //   console.error(error);
            // toast.error("Failed to load sessions");
        } finally {
            setLoading(false);
        }
    };

    const fetchReportHistory = async () => {
        setLoading(true);
        try {
            const res = await axios.get("/api/reports");
            setReports(res.data);
        } catch (error) {
            toast.error("Failed to load reports");
        } finally {
            setLoading(false);
        }
    };

    const openReportModal = (session: Session) => {
        setSelectedSession(session);
        setFormData({
            technical: 5,
            communication: 5,
            confidence: 5,
            systemDesign: 5,
            problemSolving: 5,
            strengths: '',
            improvements: '',
            detailedComments: ''
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSession) return;

        try {
            await axios.post("/api/reports", {
                sessionId: selectedSession._id,
                ...formData
            });
            toast.success("Report submitted successfully");
            setSelectedSession(null);
            fetchPendingSessions(); // Refresh
        } catch (error) {
            toast.error("Failed to submit report");
        }
    };

    return (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 bg-white shrink-0">
                <h3 className="text-xl font-bold text-gray-900">Interview Reports</h3>
                <p className="text-sm text-gray-500 mt-1">Submit feedback for completed sessions and view history.</p>

                <div className="flex gap-4 mt-6 border-b border-gray-100">
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`pb-2 text-sm font-bold ${activeTab === 'pending' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Pending Reports
                    </button>
                    <button
                        onClick={() => setActiveTab('history')}
                        className={`pb-2 text-sm font-bold ${activeTab === 'history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        Report History
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50/50">
                {activeTab === 'pending' ? (
                    <div className="space-y-4">
                        {sessions.length === 0 && !loading && (
                            <div className="text-center py-12 text-gray-400">
                                <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>All caught up! No pending reports.</p>
                            </div>
                        )}
                        {sessions.map(session => (
                            <div key={session._id} className="bg-white p-4 rounded-xl border border-gray-200 flex justify-between items-center shadow-sm">
                                <div>
                                    <h4 className="font-bold text-gray-900">{session.candidateId?.name || "Candidate"}</h4>
                                    <div className="text-xs text-gray-500 mt-1 flex items-center gap-4">
                                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(session.startTime).toLocaleString()}</span>
                                        <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Completed</span>
                                    </div>
                                </div>
                                <PrimaryButton onClick={() => openReportModal(session)}>
                                    Write Report
                                </PrimaryButton>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {reports.map(report => (
                            <div key={report._id} className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h4 className="font-bold text-gray-900">{report.candidateId?.name}</h4>
                                        <p className="text-xs text-gray-500">{new Date(report.createdAt).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold ring-1 ring-blue-100">
                                            Tech: {report.scores.technical}/10
                                        </span>
                                        <span className="bg-purple-50 text-purple-700 px-2 py-1 rounded text-xs font-bold ring-1 ring-purple-100">
                                            Comm: {report.scores.communication}/10
                                        </span>
                                    </div>
                                </div>
                                <div className="text-sm text-blue-600 font-bold hover:underline cursor-pointer">
                                    View Details &rarr;
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Report Modal */}
            {selectedSession && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                            <h3 className="text-lg font-bold">Submit Interview Report</h3>
                            <button onClick={() => setSelectedSession(null)} className="text-gray-400 hover:text-gray-600">
                                &times;
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-6">

                            {/* Scores */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    { label: 'Technical Skills', key: 'technical' },
                                    { label: 'Communication', key: 'communication' },
                                    { label: 'Confidence', key: 'confidence' },
                                    { label: 'System Design', key: 'systemDesign' },
                                    { label: 'Problem Solving', key: 'problemSolving' }
                                ].map((field) => (
                                    <div key={field.key}>
                                        <label className="block text-sm font-bold text-gray-700 mb-2 flex justify-between">
                                            {field.label}
                                            <span className="text-blue-600">{(formData as any)[field.key]}/10</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="0" max="10" step="1"
                                            className="w-full"
                                            value={(formData as any)[field.key]}
                                            onChange={(e) => setFormData({ ...formData, [field.key]: Number(e.target.value) })}
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Feedback */}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Key Strengths</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        rows={2}
                                        placeholder="What did the candidate do well?"
                                        value={formData.strengths}
                                        onChange={(e) => setFormData({ ...formData, strengths: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Areas for Improvement</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        rows={2}
                                        placeholder="Where can the candidate improve?"
                                        value={formData.improvements}
                                        onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-1">Detailed Comments</label>
                                    <textarea
                                        className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500/20 outline-none"
                                        rows={3}
                                        placeholder="Additional feedback..."
                                        value={formData.detailedComments}
                                        onChange={(e) => setFormData({ ...formData, detailedComments: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setSelectedSession(null)}
                                    className="px-4 py-2 text-gray-600 font-bold text-sm hover:bg-gray-100 rounded-lg"
                                >
                                    Cancel
                                </button>
                                <PrimaryButton type="submit">
                                    Submit Report
                                </PrimaryButton>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
