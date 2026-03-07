import { useRef } from "react";
import { Download, X, Mail, Phone, MapPin, Linkedin, Link as LinkIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";
import { toast } from "sonner";

interface ResumePreviewProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function ResumePreview({ isOpen, onClose }: ResumePreviewProps) {
    const { user } = useAuth();
    const resumeRef = useRef<HTMLDivElement>(null);

    const { data: resumeData, isLoading, isError } = useQuery({
        queryKey: ["userResume", user?.id],
        queryFn: async () => {
            if (!user?.id) return null;
            const res = await axios.get("/api/user/profile/resume", {
                headers: { userid: user.id }
            });
            return res.data.success ? res.data.data : null;
        },
        enabled: isOpen && !!user?.id,
    });

    const handlePrint = () => {
        // Trigger browser print. 
        // We use @media print CSS to hide everything else and only show the resume container.
        // Or for simplicity in this constrained environment, we can open a new window and print.
        // But the best UX here without libraries:
        setTimeout(() => {
            window.print();
        }, 100);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
            {/* Modal Container */}
            <div className="bg-gray-100 w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">

                {/* Modal Header */}
                <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 rounded-t-2xl">
                    <h2 className="text-lg font-bold text-gray-800">Resume Preview</h2>
                    <div className="flex gap-2">
                        <button
                            onClick={handlePrint}
                            disabled={isLoading || isError}
                            className="flex items-center gap-2 bg-[#004fcb] hover:bg-[#003bb5] text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Download PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content Scroll Area */}
                <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-gray-100 print:p-0 print:overflow-visible">

                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#004fcb] mb-2"></div>
                            Loading resume data...
                        </div>
                    ) : isError || !resumeData ? (
                        <div className="text-center text-red-500 py-10">Failed to load resume data.</div>
                    ) : (
                        /* RESUME PAGE (A4 Aspect Ratio approx) */
                        <div
                            ref={resumeRef}
                            id="resume-content"
                            className="bg-white w-full max-w-[210mm] min-h-[297mm] p-[10mm] shadow-lg print:shadow-none print:w-full print:max-w-none print:h-auto print:absolute print:inset-0 print:z-[9999]"
                        >
                            {/* Header */}
                            <header className="border-b-2 border-gray-800 pb-6 mb-6">
                                <h1 className="text-4xl font-extrabold text-gray-900 uppercase tracking-tight mb-2">
                                    {resumeData.personalInfo.name}
                                </h1>
                                <p className="text-lg text-gray-600 mb-4 max-w-2xl leading-relaxed">
                                    {resumeData.personalInfo.bio}
                                </p>

                                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                                    <div className="flex items-center gap-1.5">
                                        <Mail className="w-4 h-4" />
                                        {resumeData.personalInfo.email}
                                    </div>
                                    {resumeData.personalInfo.phone && (
                                        <div className="flex items-center gap-1.5">
                                            <Phone className="w-4 h-4" />
                                            {resumeData.personalInfo.phone}
                                        </div>
                                    )}
                                    {resumeData.personalInfo.location && (
                                        <div className="flex items-center gap-1.5">
                                            <MapPin className="w-4 h-4" />
                                            {resumeData.personalInfo.location}
                                        </div>
                                    )}
                                </div>
                            </header>

                            <div className="grid grid-cols-3 gap-8">
                                {/* Left Column (Main Content) */}
                                <div className="col-span-2 space-y-8">
                                    {/* Experience */}
                                    {resumeData.experience.length > 0 && (
                                        <section>
                                            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-4">
                                                Experience
                                            </h3>
                                            <div className="space-y-5">
                                                {resumeData.experience.map((exp: any, i: number) => (
                                                    <div key={i}>
                                                        <div className="flex justify-between items-baseline mb-1">
                                                            <h4 className="font-bold text-gray-800 text-md">{exp.position}</h4>
                                                            <span className="text-sm text-gray-500 font-medium">
                                                                {new Date(exp.startDate).getFullYear()} - {" "}
                                                                {exp.current ? "Present" : new Date(exp.endDate).getFullYear()}
                                                            </span>
                                                        </div>
                                                        <div className="text-sm text-[#004fcb] font-semibold mb-2">{exp.company}</div>
                                                        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                                                            {exp.description}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Projects / Performance Highlights (Custom Section) */}
                                    <section>
                                        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-4">
                                            Interview Performance
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="text-xs text-gray-500 uppercase font-bold">Tech Rating</div>
                                                <div className="text-xl font-bold text-gray-900">{resumeData.performance.avgTechnical}/5.0</div>
                                            </div>
                                            <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                <div className="text-xs text-gray-500 uppercase font-bold">Comm Rating</div>
                                                <div className="text-xl font-bold text-gray-900">{resumeData.performance.avgCommunication}/5.0</div>
                                            </div>
                                        </div>

                                        {resumeData.performance.highlights.length > 0 && (
                                            <div className="mb-4">
                                                <div className="text-sm font-bold text-gray-700 mb-2">Key Strengths Verified by Experts:</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {resumeData.performance.highlights.map((h: string, i: number) => (
                                                        <span key={i} className="text-xs bg-green-50 text-green-700 px-2 py-1 rounded-md border border-green-100 font-medium">
                                                            {h}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </section>
                                </div>

                                {/* Right Column (Sidebar) */}
                                <div className="space-y-8">
                                    {/* Skills */}
                                    <section>
                                        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-4">
                                            Skills
                                        </h3>
                                        <div className="space-y-4">
                                            <div>
                                                <div className="text-xs font-bold text-gray-500 mb-2 uppercase">Technical</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {resumeData.skills.technical.map((s: string, i: number) => (
                                                        <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-gray-500 mb-2 uppercase">Languages</div>
                                                <div className="flex flex-wrap gap-2">
                                                    {resumeData.skills.languages.map((s: string, i: number) => (
                                                        <span key={i} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                                                            {s}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </section>

                                    {/* Education */}
                                    {resumeData.education.length > 0 && (
                                        <section>
                                            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-4">
                                                Education
                                            </h3>
                                            <div className="space-y-4">
                                                {resumeData.education.map((edu: any, i: number) => (
                                                    <div key={i}>
                                                        <div className="text-sm font-bold text-gray-900">{edu.degree}</div>
                                                        <div className="text-sm text-[#004fcb] font-medium">{edu.institution}</div>
                                                        <div className="text-xs text-gray-500">{edu.startYear} - {edu.endYear || "Present"}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}

                                    {/* Certifications */}
                                    {resumeData.certifications.length > 0 && (
                                        <section>
                                            <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wider border-b border-gray-300 pb-1 mb-4">
                                                Certifications
                                            </h3>
                                            <div className="space-y-3">
                                                {resumeData.certifications.map((cert: any, i: number) => (
                                                    <div key={i}>
                                                        <div className="text-sm font-bold text-gray-900">{cert.name}</div>
                                                        <div className="text-xs text-gray-600">{cert.issuer}</div>
                                                        <div className="text-xs text-gray-400">{new Date(cert.issueDate).getFullYear()}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </section>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Print Styles */}
                <style>{`
                    @media print {
                        @page { margin: 0; size: auto; }
                        body * { visibility: hidden; }
                        #resume-content, #resume-content * { visibility: visible; }
                        #resume-content {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            margin: 0;
                            padding: 10mm; 
                            background: white;
                            box-shadow: none;
                        }
                    }
                `}</style>
            </div>
        </div>
    );
}
