import { useRef, useState } from "react";
import { Download, X, Mail, Phone, MapPin, ArrowLeft, FileText } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import axios from "../../lib/axios";
import { useAuth } from "../../context/AuthContext";

interface ResumePreviewProps {
  isOpen: boolean;
  onClose: () => void;
}

const RESUME_TEMPLATES = [
  { id: "professional-blue", name: "Professional Blue", description: "Dark blue sidebar, clean and corporate", accent: "bg-[#1e3a5f]" },
  { id: "minimalist", name: "Minimalist", description: "Clean layout, maximum readability", accent: "bg-slate-700" },
  { id: "dark-header", name: "Dark Header", description: "Bold header and footer, strong presence", accent: "bg-[#0f172a]" },
  { id: "modern-clean", name: "Modern Clean", description: "Single column, subtle separators", accent: "bg-slate-600" },
  { id: "classic", name: "Classic Traditional", description: "Timeless, detailed sections", accent: "bg-slate-800" },
  { id: "elegant", name: "Elegant Two Column", description: "Balanced columns, refined look", accent: "bg-slate-700" },
  { id: "sidebar-dark", name: "Sidebar Dark", description: "Dark sidebar with photo block", accent: "bg-[#0c1929]" },
  { id: "bold-accent", name: "Bold Accent", description: "Strong accent color for headings", accent: "bg-rose-700" },
  { id: "blue-yellow", name: "Blue & Light", description: "Blue sidebar, light main area", accent: "bg-[#004fcb]" },
  { id: "green-sidebar", name: "Green Professional", description: "Green sidebar, progress-style skills", accent: "bg-emerald-800" },
];

function TemplateThumb({ accent }: { accent: string }) {
  return (
    <div className="w-full aspect-[210/297] max-h-32 rounded-lg border border-slate-200 overflow-hidden bg-white flex shadow-sm">
      <div className={`w-1/3 shrink-0 ${accent}`} />
      <div className="flex-1 p-1 flex flex-col gap-0.5">
        <div className="h-2 w-3/4 bg-slate-200 rounded" />
        <div className="h-1.5 w-full bg-slate-100 rounded" />
        <div className="h-1.5 w-full bg-slate-100 rounded" />
        <div className="mt-1 h-1 w-1/2 bg-slate-200 rounded" />
        <div className="h-1 w-full bg-slate-100 rounded" />
        <div className="h-1 w-[80%] bg-slate-100 rounded" />
      </div>
    </div>
  );
}

export default function ResumePreview({ isOpen, onClose }: ResumePreviewProps) {
  const { user } = useAuth();
  const resumeRef = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<"templates" | "preview">("templates");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const { data: resumeData, isLoading, isError } = useQuery({
    queryKey: ["userResume", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const res = await axios.get("/api/user/profile/resume", {
        headers: { userid: user.id },
      });
      return res.data.success ? res.data.data : null;
    },
    enabled: isOpen && !!user?.id && view === "preview",
  });

  const handleClose = () => {
    setView("templates");
    setSelectedTemplateId(null);
    onClose();
  };

  const handleSelectTemplate = (id: string) => {
    setSelectedTemplateId(id);
    setView("preview");
  };

  const handleBackToTemplates = () => {
    setView("templates");
    setSelectedTemplateId(null);
  };

  const handlePrint = () => {
    setTimeout(() => window.print(), 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 rounded-t-2xl shrink-0">
          <div className="flex items-center gap-3">
            {view === "preview" && (
              <button
                type="button"
                onClick={handleBackToTemplates}
                className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 hover:text-[#004fcb] transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to templates
              </button>
            )}
            {view === "templates" && (
              <>
                <FileText className="w-5 h-5 text-[#004fcb]" />
                <h2 className="text-lg font-bold text-elite-black tracking-tight">Choose a resume template</h2>
              </>
            )}
            {view === "preview" && (
              <h2 className="text-lg font-bold text-elite-black tracking-tight">Resume Preview</h2>
            )}
          </div>
          <div className="flex items-center gap-2">
            {view === "preview" && (
              <button
                type="button"
                onClick={handlePrint}
                disabled={isLoading || isError}
                className="flex items-center gap-2 bg-[#004fcb] hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-[11px] font-bold transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            )}
            <button
              type="button"
              onClick={handleClose}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {view === "templates" && (
            <div className="p-6">
              <p className="text-[11px] text-slate-500 mb-6">Select a template. Your profile data will be used to build the best resume.</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {RESUME_TEMPLATES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => handleSelectTemplate(t.id)}
                    className="group text-left rounded-xl border-2 border-slate-200 hover:border-[#004fcb] hover:shadow-lg transition-all p-3 bg-white"
                  >
                    <TemplateThumb accent={t.accent} />
                    <p className="mt-2 text-[11px] font-bold text-elite-black truncate">{t.name}</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{t.description}</p>
                    <span className="mt-2 inline-block text-[10px] font-bold text-[#004fcb] group-hover:underline">
                      Use this template →
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === "preview" && (
            <div className="flex-1 overflow-y-auto p-8 flex justify-center bg-slate-100 print:p-0 print:overflow-visible">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-[#004fcb] border-t-transparent mb-2" />
                  <p className="text-[11px] font-medium">Loading resume data...</p>
                </div>
              ) : isError || !resumeData ? (
                <div className="text-center text-red-500 py-10 text-sm">Failed to load resume data.</div>
              ) : (
                <div
                  ref={resumeRef}
                  id="resume-content"
                  className="bg-white w-full max-w-[210mm] min-h-[297mm] p-[10mm] shadow-lg print:shadow-none print:w-full print:max-w-none print:h-auto print:absolute print:inset-0 print:z-[9999]"
                >
                  <header className="border-b-2 border-slate-800 pb-6 mb-6">
                    <h1 className="text-4xl font-extrabold text-elite-black uppercase tracking-tight mb-2">
                      {resumeData.personalInfo.name}
                    </h1>
                    <p className="text-lg text-slate-600 mb-4 max-w-2xl leading-relaxed">
                      {resumeData.personalInfo.bio}
                    </p>
                    <div className="flex flex-wrap gap-4 text-sm text-slate-600">
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
                    <div className="col-span-2 space-y-8">
                      {resumeData.experience?.length > 0 && (
                        <section>
                          <h3 className="text-lg font-bold text-elite-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-4">
                            Experience
                          </h3>
                          <div className="space-y-5">
                            {resumeData.experience.map((exp: any, i: number) => (
                              <div key={i}>
                                <div className="flex justify-between items-baseline mb-1">
                                  <h4 className="font-bold text-slate-800 text-base">{exp.position}</h4>
                                  <span className="text-sm text-slate-500 font-medium">
                                    {new Date(exp.startDate).getFullYear()} -{" "}
                                    {exp.current ? "Present" : new Date(exp.endDate).getFullYear()}
                                  </span>
                                </div>
                                <div className="text-sm text-[#004fcb] font-semibold mb-2">{exp.company}</div>
                                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                  {exp.description}
                                </p>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {resumeData.performance && (
                        <section>
                          <h3 className="text-lg font-bold text-elite-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-4">
                            Interview Performance
                          </h3>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <div className="text-[10px] text-slate-500 uppercase font-bold">Tech Rating</div>
                              <div className="text-xl font-bold text-elite-black">{resumeData.performance.avgTechnical}/5.0</div>
                            </div>
                            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                              <div className="text-[10px] text-slate-500 uppercase font-bold">Comm Rating</div>
                              <div className="text-xl font-bold text-elite-black">{resumeData.performance.avgCommunication}/5.0</div>
                            </div>
                          </div>
                          {resumeData.performance.highlights?.length > 0 && (
                            <div>
                              <div className="text-sm font-bold text-slate-700 mb-2">Key strengths verified by experts</div>
                              <div className="flex flex-wrap gap-2">
                                {resumeData.performance.highlights.map((h: string, i: number) => (
                                  <span key={i} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100 font-medium">
                                    {h}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </section>
                      )}
                    </div>

                    <div className="space-y-8">
                      {resumeData.skills && (
                        <section>
                          <h3 className="text-lg font-bold text-elite-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-4">
                            Skills
                          </h3>
                          <div className="space-y-4">
                            <div>
                              <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Technical</div>
                              <div className="flex flex-wrap gap-2">
                                {(resumeData.skills.technical || []).map((s: string, i: number) => (
                                  <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Languages</div>
                              <div className="flex flex-wrap gap-2">
                                {(resumeData.skills.languages || []).map((s: string, i: number) => (
                                  <span key={i} className="text-xs bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium">
                                    {s}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </section>
                      )}

                      {resumeData.education?.length > 0 && (
                        <section>
                          <h3 className="text-lg font-bold text-elite-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-4">
                            Education
                          </h3>
                          <div className="space-y-4">
                            {resumeData.education.map((edu: any, i: number) => (
                              <div key={i}>
                                <div className="text-sm font-bold text-elite-black">{edu.degree}</div>
                                <div className="text-sm text-[#004fcb] font-medium">{edu.institution}</div>
                                <div className="text-xs text-slate-500">{edu.startYear} - {edu.endYear || "Present"}</div>
                              </div>
                            ))}
                          </div>
                        </section>
                      )}

                      {resumeData.certifications?.length > 0 && (
                        <section>
                          <h3 className="text-lg font-bold text-elite-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-4">
                            Certifications
                          </h3>
                          <div className="space-y-3">
                            {resumeData.certifications.map((cert: any, i: number) => (
                              <div key={i}>
                                <div className="text-sm font-bold text-elite-black">{cert.name}</div>
                                <div className="text-xs text-slate-600">{cert.issuer}</div>
                                <div className="text-xs text-slate-400">{new Date(cert.issueDate).getFullYear()}</div>
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
          )}
        </div>

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
