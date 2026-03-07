import React, { useState, useEffect } from "react";
import axios from '../lib/axios';
import { ChevronLeft, ChevronRight, Search, X, RefreshCw, AlertCircle } from "lucide-react";
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
  aadharFile: string;
  companyIdFile: string;
  linkedin: string;
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
  rejectionReason?: string;
}

const RejectedExpertsTable: React.FC = () => {
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [rejectedExperts, setRejectedExperts] = useState<Expert[]>([]);
  const [loading, setLoading] = useState(true);

  // Reject Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchRejectedExperts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/expert/rejected");
      if (response.data.success) {
        setRejectedExperts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching rejected experts:", error);
      toast.error("Failed to load rejected experts");
    } finally {
      setTimeout(() => setLoading(false), 300); // Prevent flicker
    }
  };

  useEffect(() => {
    fetchRejectedExperts();
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
        toast.success("Expert approved and moved to Verified list!");
        setRejectedExperts(prev => prev.filter(exp => exp._id !== selectedExpert._id));
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
    // Pre-fill with existing reason if desired, or keep blank for update
    if (selectedExpert?.rejectionReason) {
      setRejectionReason(selectedExpert.rejectionReason);
    } else {
      setRejectionReason("");
    }
  };

  const submitRejectionUpdate = async () => {
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
        toast.success("Rejection reason updated.");
        // Update local state to reflect new reason
        setRejectedExperts(prev => prev.map(exp =>
          exp._id === selectedExpert._id ? { ...exp, rejectionReason: rejectionReason } : exp
        ));
        setIsRejectModalOpen(false);
        setSelectedExpert(null);
        setRejectionReason("");
      }
    } catch (error) {
      console.error("Error updating rejection:", error);
      toast.error("Failed to update rejection reason");
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredExperts = rejectedExperts.filter(exp =>
    exp.personalInformation.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exp.professionalDetails.industry.toLowerCase().includes(searchTerm.toLowerCase())
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
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-48"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded w-24 ml-auto"></div></td>
    </tr>
  );

  return (
    // MAIN PAGE CONTAINER - SINGLE CARD LAYOUT
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[calc(100vh-8rem)]">

      {/* Header with Search and Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Rejected Experts</h2>
          <p className="text-sm text-gray-500 mt-1">Review and manage rejected expert applications.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search experts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500/10 focus:border-red-500 transition-all"
            />
          </div>
          <button
            onClick={fetchRejectedExperts}
            className="p-2 text-gray-500 hover:text-red-600 bg-gray-50 hover:bg-red-50 rounded-lg border border-gray-200 transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Cards Container */}
      <div className="bg-gray-50/50 rounded-xl p-4 min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl h-48 animate-pulse shadow-sm border border-gray-100"></div>
            ))}
          </div>
        ) : currentExperts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentExperts.map((exp) => (
              <div key={exp._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6 group flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1" title={exp.personalInformation.userName}>
                        {exp.personalInformation.userName}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium line-clamp-1">{exp.professionalDetails.title}</p>
                    </div>
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200 shrink-0">
                      {exp.personalInformation.category || exp.professionalDetails.industry}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="bg-red-50 rounded-lg p-3 border border-red-100">
                      <div className="flex gap-2 text-red-700 mb-1">
                        <AlertCircle size={14} className="mt-0.5 shrink-0" />
                        <span className="text-xs font-bold uppercase tracking-wide">Rejection Reason</span>
                      </div>
                      <p className="text-sm text-gray-700 line-clamp-2" title={exp.rejectionReason}>
                        {exp.rejectionReason || "No specific reason provided."}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 mt-2">
                  <button
                    onClick={() => setSelectedExpert(exp)}
                    className="w-full py-2.5 bg-white text-amber-700 border border-amber-200 hover:bg-amber-50 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                  >
                    Review & Re-evaluate
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Rejected Experts</h3>
            <p className="text-gray-500 max-w-sm mt-1">There are no experts in the rejection list matching your criteria.</p>
          </div>
        )}
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
                    ? 'bg-red-600 text-white'
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
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-gray-500">Re-evaluation</span>
                  <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-700">rejected</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedExpert(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-6 py-4 bg-red-50 border-b border-red-100">
              <h4 className="text-sm font-bold text-red-800 mb-1">Current Rejection Reason:</h4>
              <p className="text-sm text-red-700">{selectedExpert.rejectionReason || "No specific reason provided."}</p>
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
                      <span className="text-sm font-medium text-gray-900">{selectedExpert.personalInformation.city}, {selectedExpert.personalInformation.country}</span>
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
                      <span className="text-sm font-medium text-gray-900">{selectedExpert.professionalDetails.totalExperience} Years</span>
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
                      <p className="text-sm text-gray-500 italic">No education details</p>
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

              {/* Use Flex-col-reverse on mobile orders action buttons at bottom */}
              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-6 border-t border-gray-100">
                <button
                  onClick={handleRejectClick}
                  disabled={isProcessing}
                  className="px-6 py-2.5 bg-white text-gray-600 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Update Rejection Reason
                </button>
                <button
                  onClick={handleApprove}
                  disabled={isProcessing}
                  className="px-6 py-2.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isProcessing ? "Processing..." : "Approve & Activate"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rejection Update Modal */}
      {isRejectModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsRejectModalOpen(false)}
          ></div>
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6 transform transition-all">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-gray-900">Update Rejection Reason</h3>
              <p className="text-sm text-gray-500 mt-1">
                Update the reason for rejection. This will overwrite the previous reason.
              </p>
            </div>

            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 resize-none text-sm"
              placeholder="Enter new rejection reason..."
            />

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setIsRejectModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={submitRejectionUpdate}
                disabled={isProcessing || !rejectionReason.trim()}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? "Updating..." : "Update Rejection"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RejectedExpertsTable;