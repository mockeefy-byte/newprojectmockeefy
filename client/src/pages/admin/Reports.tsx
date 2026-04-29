import { useState, useEffect } from 'react';
import { FileText, CheckCircle, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';

interface Report {
    id: string; // _id
    expertName: string;
    candidateName: string;
    date: string;
    status: 'Draft' | 'Submitted';
    scores: {
        total: number; // calculated or stored
    };
    category: string;
    certificateId?: string;
}

export default function Reports() {
    const [reports, setReports] = useState<Report[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Mock fetch - assume endpoint returns reports joined with user/expert
        const fetchReports = async () => {
            try {
                // const res = await axios.get('/api/reports');
                // setReports(res.data);

                // MOCK DATA for visualization since backend logic for aggregation might be complex
                setTimeout(() => {
                    setReports([
                        { id: '1', expertName: 'Sarah Jenkins', candidateName: 'John Doe', date: '2023-10-15', status: 'Submitted', scores: { total: 85 }, category: 'Frontend React', certificateId: 'CERT-123' },
                        { id: '2', expertName: 'Mike Ross', candidateName: 'Jane Smith', date: '2023-10-18', status: 'Draft', scores: { total: 0 }, category: 'System Design' },
                        { id: '3', expertName: 'Sarah Jenkins', candidateName: 'Robert Fox', date: '2023-10-20', status: 'Submitted', scores: { total: 92 }, category: 'Frontend React' },
                    ]);
                    setLoading(false);
                }, 800);
            } catch (error) {
                console.error(error);
                setLoading(false);
            }
        };
        fetchReports();
    }, []);

    const generateCertificate = (reportId: string) => {
        toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
            loading: 'Generating Certificate...',
            success: 'Certificate Generated & Emailed to Candidate!',
            error: 'Failed to generate certificate'
        });
        // In reality: await axios.post(`/api/certifications/generate`, { reportId });
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports & Certifications</h1>
                    <p className="text-gray-500 mt-1">Review interview performance and issue certificates.</p>
                </div>
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 bg-white border border-gray-300 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">
                        <Filter className="w-4 h-4" /> Filter
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#004fcb]" />
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Candidate & Expert</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Session Details</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loading ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-400">Loading reports...</td></tr>
                        ) : reports.map((report) => (
                            <tr key={report.id} className="hover:bg-blue-50/10 transition-colors">
                                <td className="px-6 py-4">
                                    <div>
                                        <p className="font-bold text-gray-900">{report.candidateName}</p>
                                        <p className="text-xs text-gray-500">Interviewed by <span className="text-gray-700">{report.expertName}</span></p>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900">{report.category}</span>
                                        <span className="text-xs text-gray-400">{report.date}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {report.status === 'Submitted' ? (
                                        <span className={`font-bold ${report.scores.total >= 70 ? 'text-green-600' : 'text-amber-600'}`}>
                                            {report.scores.total}%
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide ${report.status === 'Submitted' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
                                        }`}>
                                        {report.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <button className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 tooltip" title="View Full Report">
                                            <FileText className="w-4 h-4" />
                                        </button>
                                        {report.status === 'Submitted' && (
                                            report.certificateId ? (
                                                <button className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-lg hover:bg-green-100">
                                                    <CheckCircle className="w-3 h-3" /> Issued
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => generateCertificate(report.id)}
                                                    className="flex items-center gap-1 px-3 py-1 bg-[#004fcb]/10 text-[#004fcb] text-xs font-bold rounded-lg hover:bg-[#004fcb] hover:text-white transition-all"
                                                >
                                                    <Award className="w-3 h-3" /> Generate Cert
                                                </button>
                                            )
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// Reuse Award icon
function Award(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="8" r="7" />
            <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
        </svg>
    )
}
