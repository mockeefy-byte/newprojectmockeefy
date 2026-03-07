import React, { useState, useEffect } from "react";
import axios from '../lib/axios';
import { ChevronLeft, ChevronRight, Search, X, RefreshCw, Eye } from "lucide-react";
import { toast } from "sonner";

interface PersonalInformation {
    userName: string;
    mobile: string;
    gender: string;
    dob: string;
    country: string;
    state: string;
    city: string;
    category?: string;
}

interface Education {
    degree: string;
    institution: string;
    field: string;
    start: number;
    end: number;
}

interface ProfessionalDetails {
    title: string;
    company: string;
    totalExperience: number;
    industry: string;
}

interface SkillsAndExpertise {
    mode: string;
    domains: string[];
    tools: string[];
    languages: string[];
}

interface Verification {
    aadhar?: { url: string; name: string };
    companyId?: { url: string; name: string };
    linkedin?: string;
}

interface Expert {
    _id: string;
    personalInformation: PersonalInformation;
    education: Education[];
    professionalDetails: ProfessionalDetails;
    skillsAndExpertise: SkillsAndExpertise;
    verification: Verification;
    userDetails?: {
        email: string;
        _id: string;
    };
}

const PendingExpertsTable: React.FC = () => {
    const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [pendingExperts, setPendingExperts] = useState<Expert[]>([]);
    const [loading, setLoading] = useState(true);

    // Reject Modal State
    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const fetchPendingExperts = async () => {
        setLoading(true);
        try {
            const response = await axios.get("/api/expert/pending");
            if (response.data.success) {
                setPendingExperts(response.data.data);
            }
        } catch (error) {
            console.error("Error fetching pending experts:", error);
            toast.error("Failed to load pending experts");
        } finally {
            // Small delay to prevent flickering
            setTimeout(() => setLoading(false), 300);
        }
    };

    useEffect(() => {
        fetchPendingExperts();
    }, []);

    // Effect to reset pagination when search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleApprove = async () => {
        if (!selectedExpert) return;
        setIsProcessing(true);
        try {
            const response = await axios.put(`/api/expert/approve/${selectedExpert._id}`);
            if (response.data.success) {
                toast.success("Expert approved successfully!");
                setPendingExperts(prev => prev.filter(exp => exp._id !== selectedExpert._id));
                setSelectedExpert(null);
            }
        } catch (error) {
            console.error("Error approving expert:", error);
            toast.error("Failed to approve expert");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleRejectClick = () => {
        setIsRejectModalOpen(true);
    };

    const submitRejection = async () => {
        if (!selectedExpert) return;
        if (!rejectionReason.trim()) {
            toast.error("Please enter a reason for rejection");
            return;
        }

        setIsProcessing(true);
        try {
            const response = await axios.put(`/api/expert/reject/${selectedExpert._id}`, {
                reason: rejectionReason
            });

            if (response.data.success) {
                toast.success("Expert rejected.");
                setPendingExperts(prev => prev.filter(exp => exp._id !== selectedExpert._id));
                setIsRejectModalOpen(false);
                setSelectedExpert(null);
                setRejectionReason("");
            }
        } catch (error) {
            console.error("Error rejecting expert:", error);
            toast.error("Failed to reject expert");
        } finally {
            setIsProcessing(false);
        }
    };

    const filteredExperts = pendingExperts.filter(exp =>
        (exp.personalInformation?.userName?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
        (exp.professionalDetails?.industry?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredExperts.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentExperts = filteredExperts.slice(startIndex, endIndex);

    const handlePageChange = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    // Skeleton Row for Flicker-Free Loading
    const SkeletonRow = () => (
        <tr className="animate-pulse border-b border-gray-100/50">
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div><div className="h-3 bg-gray-100 rounded w-24 mt-2"></div></td>
            <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded-full w-24"></div></td>
            <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
            <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded w-20 ml-auto"></div></td>
        </tr>
    );

    return (
        // MAIN PAGE CONTAINER - SINGLE CARD LAYOUT
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[calc(100vh-8rem)]">

            {/* Header with Search and Refresh */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Pending Experts</h2>
                    <p className="text-sm text-gray-500 mt-1">Review and approve verification verification requests.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search experts..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                        />
                    </div>
                    <button
                        onClick={fetchPendingExperts}
                        className="p-2 text-gray-500 hover:text-blue-600 bg-gray-50 hover:bg-blue-50 rounded-lg border border-gray-200 transition-colors"
                        title="Refresh List"
                    >
                        <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden min-h-[400px]">
                <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50/50 border-b border-gray-100">
                        <tr>
                            <th className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider">Expert Name</th>
                            <th className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider">Category</th>
                            <th className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider">Location</th>
                            <th className="py-4 px-6 font-medium text-gray-500 text-xs uppercase tracking-wider text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loading ? (
                            // Flicker-Free Skeleton Loading
                            Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                        ) : currentExperts.length > 0 ? (
                            currentExperts.map((exp) => (
                                <tr key={exp._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div>
                                            <p className="font-medium text-gray-900">{exp.personalInformation.userName}</p>
                                            <p className="text-xs text-gray-500 mt-0.5">{exp.professionalDetails.title}</p>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                                            {exp.personalInformation.category || exp.professionalDetails.industry}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-600">
                                        {exp.personalInformation.city}, {exp.personalInformation.state}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end space-x-2">
                                            <button
                                                onClick={() => setSelectedExpert(exp)}
                                                className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors border border-blue-200"
                                            >
                                                <Eye size={14} />
                                                Review
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} className="py-20 text-center text-gray-500">
                                    No pending experts found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {!loading && filteredExperts.length > 0 && (
                <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
                    <span className="text-sm text-gray-500">
                        Showing {startIndex + 1} to {Math.min(endIndex, filteredExperts.length)} of {filteredExperts.length}
                    </span>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg border ${currentPage === 1 ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <div className="flex items-center space-x-1">
                            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                <button
                                    key={page}
                                    onClick={() => handlePageChange(page)}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${currentPage === page
                                        ? 'bg-blue-600 text-white'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg border ${currentPage === totalPages ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}

            {/* Profile Detail Modal */}
            {selectedExpert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
                        onClick={() => setSelectedExpert(null)}
                    ></div>

                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">{selectedExpert.personalInformation.userName}</h3>
                                <p className="text-sm text-gray-500">Applicant Details</p>
                            </div>
                            <button
                                onClick={() => setSelectedExpert(null)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Detailed sections */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section>
                                    <h4 className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <span className="w-8 h-0.5 bg-blue-600 rounded-full"></span>
                                        Personal Info
                                    </h4>
                                    <div className="space-y-3 pl-10">
                                        <div className="flex justify-between py-2 border-b border-gray-50">
                                            <span className="text-sm text-gray-500">Email</span>
                                            <span className="text-sm font-medium text-gray-900">{selectedExpert.userDetails?.email || "N/A"}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-50">
                                            <span className="text-sm text-gray-500">Mobile</span>
                                            <span className="text-sm font-medium text-gray-900">{selectedExpert.personalInformation.mobile}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-50">
                                            <span className="text-sm text-gray-500">Location</span>
                                            <span className="text-sm font-medium text-gray-900">{selectedExpert.personalInformation?.city || "N/A"}, {selectedExpert.personalInformation?.country || "N/A"}</span>
                                        </div>
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <span className="w-8 h-0.5 bg-green-600 rounded-full"></span>
                                        Professional
                                    </h4>
                                    <div className="space-y-3 pl-10">
                                        <div className="flex justify-between py-2 border-b border-gray-50">
                                            <span className="text-sm text-gray-500">Title</span>
                                            <span className="text-sm font-medium text-gray-900">{selectedExpert.professionalDetails.title}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-50">
                                            <span className="text-sm text-gray-500">Company</span>
                                            <span className="text-sm font-medium text-gray-900">{selectedExpert.professionalDetails.company}</span>
                                        </div>
                                        <div className="flex justify-between py-2 border-b border-gray-50">
                                            <span className="text-sm text-gray-500">Experience</span>
                                            <span className="text-sm font-medium text-gray-900">{selectedExpert.professionalDetails?.totalExperience || 0} Years</span>
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Education & Skills */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <section>
                                    <h4 className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <span className="w-8 h-0.5 bg-purple-600 rounded-full"></span>
                                        Education
                                    </h4>
                                    <div className="pl-10 space-y-3">
                                        {selectedExpert.education?.length > 0 ? (
                                            selectedExpert.education.map((edu, i) => (
                                                <div key={i} className="p-3 bg-purple-50/50 rounded-lg border border-purple-100">
                                                    <div className="flex justify-between text-sm">
                                                        <span className="font-semibold text-gray-900">{edu.degree}</span>
                                                        <span className="text-purple-700 font-medium">{edu.start} - {edu.end}</span>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1">{edu.institution}</p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-sm text-gray-500 italic">No education details provided</p>
                                        )}
                                    </div>
                                </section>

                                <section>
                                    <h4 className="text-xs font-semibold text-amber-600 uppercase tracking-wide mb-4 flex items-center gap-2">
                                        <span className="w-8 h-0.5 bg-amber-600 rounded-full"></span>
                                        Skills
                                    </h4>
                                    <div className="pl-10">
                                        <div className="flex flex-wrap gap-2">
                                            {selectedExpert.skillsAndExpertise?.domains?.map((skill, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-medium rounded-md border border-amber-100">
                                                    {skill}
                                                </span>
                                            ))}
                                            {selectedExpert.skillsAndExpertise?.tools?.map((skill, i) => (
                                                <span key={`tool-${i}`} className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-md border border-gray-200">
                                                    {skill}
                                                </span>
                                            ))}
                                            {(!selectedExpert.skillsAndExpertise?.domains?.length && !selectedExpert.skillsAndExpertise?.tools?.length) && (
                                                <p className="text-sm text-gray-500 italic">No skills provided</p>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Verification Links */}
                            <section className="pt-4 border-t border-gray-100">
                                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-4">Verification Documents</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    {selectedExpert.verification?.linkedin ? (
                                        <a
                                            href={selectedExpert.verification.linkedin}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors border border-blue-200"
                                        >
                                            LinkedIn Profile
                                        </a>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 text-gray-400 rounded-lg text-sm font-medium italic border border-gray-100">
                                            No LinkedIn
                                        </div>
                                    )}

                                    {selectedExpert.verification?.aadhar?.url ? (
                                        <a
                                            href={selectedExpert.verification.aadhar.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-center gap-2 p-3 bg-amber-50 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-100 transition-colors border border-amber-200"
                                        >
                                            View Govt ID (Aadhar)
                                        </a>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 text-gray-400 rounded-lg text-sm font-medium italic border border-gray-100">
                                            Govt ID Missing
                                        </div>
                                    )}

                                    {selectedExpert.verification?.companyId?.url ? (
                                        <a
                                            href={selectedExpert.verification.companyId.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="flex items-center justify-center gap-2 p-3 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100 transition-colors border border-purple-200"
                                        >
                                            View Company Letter
                                        </a>
                                    ) : (
                                        <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 text-gray-400 rounded-lg text-sm font-medium italic border border-gray-100">
                                            Company Doc Missing
                                        </div>
                                    )}
                                </div>
                            </section>

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button
                                    onClick={handleRejectClick}
                                    disabled={isProcessing}
                                    className="px-6 py-2.5 bg-white text-red-600 text-sm font-medium border border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
                                >
                                    Reject Application
                                </button>
                                <button
                                    onClick={handleApprove}
                                    disabled={isProcessing}
                                    className="px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                                >
                                    {isProcessing ? "Processing..." : "Approve Expert"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Rejection Modal */}
            {isRejectModalOpen && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setIsRejectModalOpen(false)}
                    ></div>
                    <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all">
                        <div className="mb-4">
                            <h3 className="text-lg font-bold text-gray-900">Reject Application</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                Please provide a reason for rejecting this expert. This will be shared with the applicant.
                            </p>
                        </div>

                        <textarea
                            value={rejectionReason}
                            onChange={(e) => setRejectionReason(e.target.value)}
                            className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none text-sm"
                            placeholder="Enter detailed reason..."
                        />

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setIsRejectModalOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitRejection}
                                disabled={isProcessing || !rejectionReason.trim()}
                                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isProcessing ? "Rejecting..." : "Confirm Rejection"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PendingExpertsTable;
