import { useState, useEffect } from "react";
import axios from '../lib/axios';
import { ChevronLeft, ChevronRight, Search, RefreshCw, Eye, FileText } from "lucide-react";

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
}

interface Session {
  _id: string;
  sessionId: string;
  expertId: string;
  candidateId: string;
  expertName?: string;
  candidateName?: string;
  startTime: string;
  endTime: string;
  topics: string[];
  price: number;
  status: string;
  duration?: number;
  meetingLink?: string;
}

const VerifiedExpertsTable = () => {
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [showSessions, setShowSessions] = useState<Expert | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [verifiedExperts, setVerifiedExperts] = useState<Expert[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchVerifiedExperts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/api/expert/verified");
      if (response.data.success) {
        setVerifiedExperts(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching verified experts:", error);
    } finally {
      // Small delay prevents flicker if data loads instantly
      setTimeout(() => setLoading(false), 300);
    }
  };

  const fetchSessions = async () => {
    try {
      const response = await axios.get("/api/sessions/all");
      if (response.data.success) {
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
    }
  };

  useEffect(() => {
    fetchVerifiedExperts();
    fetchSessions(); // Fetch sessions too
  }, []);

  // Effect to reset pagination when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const filteredExperts = verifiedExperts.filter(exp =>
    exp.personalInformation.userName.toLowerCase().includes(searchTerm.toLowerCase())
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

  const SkeletonRow = () => (
    <tr className="animate-pulse border-b border-gray-100/50">
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-32"></div><div className="h-3 bg-gray-100 rounded w-24 mt-2"></div></td>
      <td className="px-6 py-4"><div className="h-5 bg-gray-200 rounded-full w-24"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-28"></div></td>
      <td className="px-6 py-4"><div className="h-4 bg-gray-200 rounded w-8 mx-auto"></div></td>
      <td className="px-6 py-4 text-right"><div className="h-8 bg-gray-200 rounded w-24 ml-auto"></div></td>
    </tr>
  );

  return (
    // MAIN PAGE CONTAINER - SINGLE CARD LAYOUT
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 min-h-[calc(100vh-8rem)]">

      {/* Header with Search and Refresh */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Verified Experts</h2>
          <p className="text-sm text-gray-500 mt-1">Manage verified expert profiles and view their activity.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search experts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500/10 focus:border-green-500 transition-all"
            />
          </div>
          <button
            onClick={fetchVerifiedExperts}
            className="p-2 text-gray-500 hover:text-green-600 bg-gray-50 hover:bg-green-50 rounded-lg border border-gray-200 transition-colors"
            title="Refresh List"
          >
            <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Cards Container */}
      <div className="rounded-xl min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-xl h-48 animate-pulse shadow-sm border border-gray-100"></div>
            ))}
          </div>
        ) : currentExperts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentExperts.map((expert) => (
              <div key={expert._id} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between group">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1" title={expert.personalInformation.userName}>
                        {expert.personalInformation.userName}
                      </h3>
                      <p className="text-sm text-gray-500 font-medium line-clamp-1">{expert.professionalDetails.title}</p>
                    </div>
                    <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-200 shrink-0">
                      {expert.personalInformation.category || "General"}
                    </span>
                  </div>

                  <div className="space-y-2 mb-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                      <span className="font-medium text-gray-900">{expert.professionalDetails.company}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                      <span>{expert.professionalDetails.totalExperience} Years Exp.</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                      <span>{expert.personalInformation.city}, {expert.personalInformation.country}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-100 grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setSelectedExpert(expert)}
                    className="px-4 py-2 bg-gray-50 text-gray-700 border border-gray-200 hover:bg-gray-100 hover:text-gray-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-xs"
                  >
                    <Eye size={14} /> View Profile
                  </button>
                  <button
                    onClick={() => handleViewSessions(expert)}
                    className="px-4 py-2 bg-[#004fcb]/10 text-[#004fcb] border border-[#004fcb]/20 hover:bg-[#004fcb]/20 font-bold rounded-lg transition-colors flex items-center justify-center gap-2 text-xs"
                  >
                    <FileText size={14} /> Sessions
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-gray-200">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No Verified Experts</h3>
            <p className="text-gray-500 max-w-sm mt-1">There are no verified experts matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!loading && filteredExperts.length > 0 && (
        <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
          <span className="text-sm text-gray-500">
            Showing {startIndex + 1}-{Math.min(endIndex, filteredExperts.length)} of {filteredExperts.length}
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
                    ? 'bg-green-600 text-white'
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

      {/* Profile Modal */}
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
                <p className="text-sm text-gray-500">Verified Expert Details</p>
              </div>
              <button
                onClick={() => setSelectedExpert(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Personal Information */}
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

                {/* Professional Details */}
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
                      <span className="text-sm font-medium text-gray-900">{selectedExpert.professionalDetails?.totalExperience || 0} years</span>
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
                      className="flex items-center justify-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
                    >
                      LinkedIn Profile
                    </a>
                  ) : (
                    <div className="flex items-center justify-center gap-2 p-3 bg-gray-50 text-gray-400 rounded-lg text-sm font-medium italic">
                      No LinkedIn provided
                    </div>
                  )}
                  {/* Placeholder buttons for documents if URLs were available */}
                  <button disabled className="flex items-center justify-center gap-2 p-3 bg-gray-50 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                    Aadhar (Protected)
                  </button>
                  <button disabled className="flex items-center justify-center gap-2 p-3 bg-gray-50 text-gray-400 rounded-lg text-sm font-medium cursor-not-allowed">
                    Company ID (Protected)
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}


      {/* Sessions Modal */}
      {showSessions && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div
            className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowSessions(null)}
          ></div>

          <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{showSessions.personalInformation.userName}</h3>
                <p className="text-sm text-gray-500">Expert Sessions</p>
              </div>
              <button
                onClick={() => setShowSessions(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6">
              <div className="overflow-x-auto rounded-lg border border-gray-100">
                <table className="w-full text-left">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">User</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Time</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Duration</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Mode</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {sessions.filter(s => s.expertId === showSessions._id).map((s, idx) => (
                      <tr key={idx} className="hover:bg-gray-50/50">
                        <td className="py-3 px-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{s.candidateName || "Unknown"}</span>
                            {(s as any).candidateDetails?.email && (
                              <span className="text-xs text-gray-500">{(s as any).candidateDetails.email}</span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{new Date(s.startTime).toLocaleDateString()}</td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(s.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{s.duration ? `${s.duration} min` : "60 min"}</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-100">
                            Online
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium border ${s.status === 'Completed' ? 'bg-green-50 text-green-700 border-green-100' :
                            s.status === 'Cancelled' ? 'bg-red-50 text-red-700 border-red-100' :
                              'bg-yellow-50 text-yellow-700 border-yellow-100'
                            }`}>
                            {s.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm font-medium text-gray-900">₹{s.price}</td>
                      </tr>
                    ))}
                    {sessions.filter(s => s.expertId === showSessions._id).length === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-sm text-gray-500">No sessions assigned yet</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifiedExpertsTable;