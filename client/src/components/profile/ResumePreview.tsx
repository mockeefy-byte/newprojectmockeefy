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
    <div className="w-full aspect-210/297 max-h-32 rounded-lg border border-slate-200 overflow-hidden bg-white flex shadow-sm">
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

const TEMPLATE_STYLES: Record<string, {
  headerBorder: string;
  accentText: string;
  chipBg: string;
  chipText: string;
  chipBorder: string;
  statsBg: string;
  statsBorder: string;
  rightColumnBg: string;
  singleColumn: boolean;
  layout: "standard" | "sidebar";
}> = {
  "professional-blue": {
    headerBorder: "border-[#1e3a5f]",
    accentText: "text-[#1e3a5f]",
    chipBg: "bg-[#eff4ff]",
    chipText: "text-[#1e3a5f]",
    chipBorder: "border-[#c7d8ff]",
    statsBg: "bg-[#f5f8ff]",
    statsBorder: "border-[#dbe7ff]",
    rightColumnBg: "bg-[#f8fbff]",
    singleColumn: false,
    layout: "sidebar",
  },
  "minimalist": {
    headerBorder: "border-slate-400",
    accentText: "text-slate-700",
    chipBg: "bg-slate-100",
    chipText: "text-slate-700",
    chipBorder: "border-slate-200",
    statsBg: "bg-slate-50",
    statsBorder: "border-slate-200",
    rightColumnBg: "bg-white",
    singleColumn: false,
    layout: "standard",
  },
  "dark-header": {
    headerBorder: "border-slate-900",
    accentText: "text-slate-900",
    chipBg: "bg-slate-100",
    chipText: "text-slate-800",
    chipBorder: "border-slate-300",
    statsBg: "bg-slate-100",
    statsBorder: "border-slate-300",
    rightColumnBg: "bg-slate-50",
    singleColumn: false,
    layout: "standard",
  },
  "modern-clean": {
    headerBorder: "border-slate-500",
    accentText: "text-slate-700",
    chipBg: "bg-slate-100",
    chipText: "text-slate-700",
    chipBorder: "border-slate-200",
    statsBg: "bg-slate-50",
    statsBorder: "border-slate-200",
    rightColumnBg: "bg-white",
    singleColumn: true,
    layout: "standard",
  },
  "classic": {
    headerBorder: "border-slate-800",
    accentText: "text-slate-800",
    chipBg: "bg-slate-100",
    chipText: "text-slate-700",
    chipBorder: "border-slate-200",
    statsBg: "bg-slate-50",
    statsBorder: "border-slate-200",
    rightColumnBg: "bg-white",
    singleColumn: false,
    layout: "standard",
  },
  "elegant": {
    headerBorder: "border-[#364152]",
    accentText: "text-[#364152]",
    chipBg: "bg-[#f4f6f8]",
    chipText: "text-[#364152]",
    chipBorder: "border-[#d7dde5]",
    statsBg: "bg-[#f8fafc]",
    statsBorder: "border-[#d7dde5]",
    rightColumnBg: "bg-[#f8fafc]",
    singleColumn: false,
    layout: "standard",
  },
  "sidebar-dark": {
    headerBorder: "border-[#0c1929]",
    accentText: "text-[#0c1929]",
    chipBg: "bg-[#ecf2ff]",
    chipText: "text-[#0c1929]",
    chipBorder: "border-[#c4d7ff]",
    statsBg: "bg-[#f5f8ff]",
    statsBorder: "border-[#d5e3ff]",
    rightColumnBg: "bg-[#f8fbff]",
    singleColumn: false,
    layout: "sidebar",
  },
  "bold-accent": {
    headerBorder: "border-rose-700",
    accentText: "text-rose-700",
    chipBg: "bg-rose-50",
    chipText: "text-rose-700",
    chipBorder: "border-rose-200",
    statsBg: "bg-rose-50",
    statsBorder: "border-rose-200",
    rightColumnBg: "bg-rose-50/30",
    singleColumn: false,
    layout: "standard",
  },
  "blue-yellow": {
    headerBorder: "border-[#004fcb]",
    accentText: "text-[#004fcb]",
    chipBg: "bg-[#eef4ff]",
    chipText: "text-[#004fcb]",
    chipBorder: "border-[#c9dbff]",
    statsBg: "bg-[#f7faff]",
    statsBorder: "border-[#dbe7ff]",
    rightColumnBg: "bg-[#fffef2]",
    singleColumn: false,
    layout: "sidebar",
  },
  "green-sidebar": {
    headerBorder: "border-emerald-800",
    accentText: "text-emerald-800",
    chipBg: "bg-emerald-50",
    chipText: "text-emerald-800",
    chipBorder: "border-emerald-200",
    statsBg: "bg-emerald-50",
    statsBorder: "border-emerald-200",
    rightColumnBg: "bg-emerald-50/40",
    singleColumn: false,
    layout: "sidebar",
  },
};

const GENERIC_BIO_VALUES = new Set(["new", "na", "n/a", "nil", "none", "-", "--"]);

function getCleanBio(bio?: string) {
  const text = (bio || "").trim();
  if (!text) return "";
  if (GENERIC_BIO_VALUES.has(text.toLowerCase())) return "";
  if (text.length < 4) return "";
  return text;
}

function getResumeHeadline(resumeData: any) {
  const isFresher = String(resumeData?.preferences?.experienceLevel || "").toLowerCase() === "fresher";
  const firstRole = resumeData?.experienceSummary?.hasProfessionalExperience
    ? (resumeData?.experience?.[0]?.position || "").trim()
    : "";

  if (isFresher) return "Fresher Candidate";
  if (firstRole) return firstRole;
  return "Professional Candidate";
}

export default function ResumePreview({ isOpen, onClose }: ResumePreviewProps) {
  const { user } = useAuth();
  const resumeRef = useRef<HTMLDivElement>(null);
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
    enabled: isOpen && !!user?.id,
  });

  const handleClose = () => {
    setSelectedTemplateId(null);
    onClose();
  };

  const handlePrint = () => {
    setTimeout(() => window.print(), 100);
  };

  const selectedTemplate = RESUME_TEMPLATES.find((t) => t.id === selectedTemplateId) || RESUME_TEMPLATES[0];
  const templateStyle = TEMPLATE_STYLES[selectedTemplate.id] || TEMPLATE_STYLES["professional-blue"];
  const isSidebarLayout = templateStyle.layout === "sidebar";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex bg-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      
      {/* LEFT SIDEBAR */}
      <div className="w-full max-w-[360px] bg-white border-r border-slate-200 flex flex-col shrink-0 shadow-2xl relative z-20 print:hidden overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 text-[#004fcb] flex items-center justify-center rounded-xl shadow-sm">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-black text-slate-900 tracking-tight">Resume Builder</h2>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Select Template</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2.5 bg-slate-50 text-slate-500 hover:bg-slate-100 hover:text-slate-900 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Templates List */}
        <div className="flex-1 overflow-y-auto p-5 pb-8 custom-scrollbar bg-slate-50/50">
          <div className="grid gap-4">
            {RESUME_TEMPLATES.map((t) => {
              const isActive = selectedTemplateId === t.id || (!selectedTemplateId && t.id === RESUME_TEMPLATES[0].id);
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplateId(t.id)}
                  className={`
                    group text-left rounded-2xl border-2 transition-all p-4 bg-white focus:outline-none relative overflow-hidden
                    ${isActive 
                      ? "border-[#004fcb] shadow-md ring-4 ring-blue-500/10 scale-[1.02]" 
                      : "border-slate-200 hover:border-slate-300 hover:shadow-sm hover:-translate-y-0.5"
                    }
                  `}
                >
                  {isActive && <div className="absolute inset-0 bg-blue-50/20" />}
                  <div className="relative">
                    <TemplateThumb accent={t.accent} />
                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className={`text-[13px] font-bold ${isActive ? "text-[#004fcb]" : "text-slate-900"}`}>{t.name}</p>
                        <p className="text-[11px] font-medium text-slate-500 mt-0.5 line-clamp-1">{t.description}</p>
                      </div>
                      {isActive && (
                        <div className="w-6 h-6 bg-[#004fcb] text-white rounded-full flex items-center justify-center shadow-sm shrink-0">
                          <span className="text-[10px] font-black leading-none mt-px">✓</span>
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        
        {/* Footer Actions */}
        <div className="p-5 border-t border-slate-100 bg-white relative z-10">
          <button
             onClick={handlePrint}
             disabled={isLoading || isError}
             className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#004fcb] text-white rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 text-[14px] font-bold shadow-lg shadow-blue-500/20 active:scale-95 group focus:outline-none focus:ring-4 focus:ring-blue-500/20"
          >
             <Download className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" />
             Download PDF
          </button>
        </div>
      </div>

      {/* RIGHT MAIN AREA */}
      <div className="flex-1 overflow-y-auto bg-slate-200/50 relative flex justify-center items-start p-8 lg:p-12 print:p-0 print:overflow-visible custom-scrollbar">
         {/* Decorative Background */}
         <div className="absolute inset-0 top-0 left-0 w-full h-[40vh] bg-gradient-to-b from-slate-300/40 to-transparent pointer-events-none print:hidden"></div>

         {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-4 mt-32 relative z-10">
              <div className="w-12 h-12 border-4 border-slate-200 border-t-[#004fcb] rounded-full animate-spin"></div>
              <p className="text-[13px] font-bold uppercase tracking-widest text-slate-500">Compiling resume data...</p>
            </div>
          ) : isError || !resumeData ? (
            <div className="text-center bg-red-50 text-red-600 px-6 py-4 rounded-xl border border-red-100 text-[13px] font-bold mt-32 h-fit shadow-sm flex items-center gap-3 relative z-10">
              Failed to load resume data. Please ensure your profile is updated.
            </div>
          ) : (
            <div
              ref={resumeRef}
              id="resume-content"
              className="bg-white w-full max-w-[210mm] min-h-[297mm] shadow-2xl p-[10mm] rounded-sm overflow-hidden h-fit print:shadow-none print:w-full print:max-w-none print:h-auto print:absolute print:inset-0 print:z-[9999] print:rounded-none transition-all duration-500 mx-auto relative z-10"
            >
                  {isSidebarLayout ? (
                    <div className="grid grid-cols-12 gap-0 border border-slate-200 rounded-xl overflow-hidden">
                      <aside className={`col-span-4 p-5 ${templateStyle.chipBg}`}>
                        <h1 className="text-2xl font-extrabold text-elite-black uppercase tracking-tight mb-1">
                          {resumeData.personalInfo.name}
                        </h1>
                        <p className={`text-sm font-semibold mb-4 ${templateStyle.accentText}`}>
                          {getResumeHeadline(resumeData)}
                        </p>
                        <div className="space-y-2 text-xs text-slate-700 mb-5">
                          <div className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{resumeData.personalInfo.email}</div>
                          {resumeData.personalInfo.phone ? <div className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{resumeData.personalInfo.phone}</div> : null}
                          {resumeData.personalInfo.location ? <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{resumeData.personalInfo.location}</div> : null}
                        </div>

                        <section className="mb-5">
                          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Skills</h3>
                          {(resumeData.skills?.technical?.length || resumeData.skills?.soft?.length || resumeData.skills?.languages?.length) ? (
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                ...(resumeData.skills?.technical || []),
                                ...(resumeData.skills?.soft || []),
                                ...(resumeData.skills?.languages || []),
                              ].map((s: string, i: number) => (
                                <span key={i} className={`text-[11px] px-2 py-1 rounded border font-semibold ${templateStyle.chipBg} ${templateStyle.chipText} ${templateStyle.chipBorder}`}>{s}</span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500">No skills added yet.</p>
                          )}
                        </section>

                        <section className="mb-5">
                          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Education</h3>
                          {resumeData.education?.length ? (
                            <div className="space-y-2">
                              {resumeData.education.map((edu: any, i: number) => (
                                <div key={i}>
                                  <p className="text-xs font-bold text-slate-800">{edu.degree}</p>
                                  <p className={`text-[11px] ${templateStyle.accentText}`}>{edu.institution}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500">No education details added yet.</p>
                          )}
                        </section>

                        <section>
                          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Certifications & Achievements</h3>
                          {resumeData.certifications?.length ? (
                            <div className="space-y-2">
                              {resumeData.certifications.map((cert: any, i: number) => (
                                <div key={i}>
                                  <p className="text-xs font-bold text-slate-800">{cert.name}</p>
                                  <p className={`text-[11px] ${templateStyle.accentText}`}>{cert.issuer || "Certification"}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-[11px] text-slate-500">No certifications added yet.</p>
                          )}
                        </section>
                      </aside>

                      <main className="col-span-8 p-5">
                        <section className={`border-b-2 pb-4 mb-4 ${templateStyle.headerBorder}`}>
                          <h2 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-2">Career Objective</h2>
                          <p className="text-sm text-slate-700 leading-relaxed">
                            {getCleanBio(resumeData.personalInfo.bio) || "Motivated candidate focused on interview readiness, skill growth, and strong contribution in the target role."}
                          </p>
                        </section>

                        <section className="mb-5">
                          <h3 className="text-base font-bold text-elite-black uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
                            Experience
                          </h3>
                          {(resumeData.experience?.length > 0 || resumeData.experienceSummary?.isFresher) ? (
                            <div className="space-y-3">
                              {resumeData.experience.map((exp: any, i: number) => (
                                <div key={i}>
                                  <div className="flex justify-between items-baseline gap-3">
                                    <p className="text-sm font-bold text-slate-800">{exp.position}</p>
                                    <p className="text-xs text-slate-500">
                                      {exp.startDate ? new Date(exp.startDate).getFullYear() : "N/A"} - {exp.current ? "Present" : (exp.endDate ? new Date(exp.endDate).getFullYear() : "N/A")}
                                    </p>
                                  </div>
                                  <p className={`text-xs font-semibold ${templateStyle.accentText}`}>{exp.company}</p>
                                  <p className="text-xs text-slate-600 mt-1 whitespace-pre-wrap">{exp.description}</p>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-slate-500">No experience details added yet.</p>
                          )}
                        </section>

                        {resumeData.performance && (
                          <section>
                            <h3 className="text-base font-bold text-elite-black uppercase tracking-wider border-b border-slate-200 pb-1 mb-3">
                              Interview Performance
                            </h3>
                            <div className="grid grid-cols-2 gap-3 mb-3">
                              <div className={`p-2.5 rounded-lg border ${templateStyle.statsBg} ${templateStyle.statsBorder}`}>
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Tech</p>
                                <p className="text-lg font-bold text-slate-900">{resumeData.performance.avgTechnical}/5</p>
                              </div>
                              <div className={`p-2.5 rounded-lg border ${templateStyle.statsBg} ${templateStyle.statsBorder}`}>
                                <p className="text-[10px] text-slate-500 uppercase font-bold">Communication</p>
                                <p className="text-lg font-bold text-slate-900">{resumeData.performance.avgCommunication}/5</p>
                              </div>
                            </div>
                            {resumeData.performance.highlights?.length ? (
                              <div className="flex flex-wrap gap-1.5">
                                {resumeData.performance.highlights.map((h: string, i: number) => (
                                  <span key={i} className={`text-[11px] px-2 py-1 rounded border font-medium ${templateStyle.chipBg} ${templateStyle.chipText} ${templateStyle.chipBorder}`}>{h}</span>
                                ))}
                              </div>
                            ) : null}
                          </section>
                        )}
                      </main>
                    </div>
                  ) : (
                    <>
                      <header className={`border-b-2 pb-6 mb-6 ${templateStyle.headerBorder}`}>
                        <h1 className="text-4xl font-extrabold text-elite-black uppercase tracking-tight mb-2">
                          {resumeData.personalInfo.name}
                        </h1>
                        <p className="text-lg text-slate-600 mb-4 max-w-2xl leading-relaxed">
                          {getResumeHeadline(resumeData)}
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

                      {(() => {
                        const effectiveSingleColumn = templateStyle.singleColumn;
                        return (
                          <div className={`grid gap-8 ${effectiveSingleColumn ? "grid-cols-1" : "grid-cols-3"}`}>
                            <div className={`${effectiveSingleColumn ? "col-span-1" : "col-span-2"} space-y-8`}>
                              <section>
                                <h3 className="text-lg font-bold text-elite-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-4">
                                  Objective
                                </h3>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                  {getCleanBio(resumeData.personalInfo.bio) || "Motivated candidate focused on interview preparation, practical execution, and strong contribution in the target role."}
                                </p>
                              </section>

                              <section>
                                <h3 className="text-lg font-bold text-elite-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-4">
                                  Experience ({resumeData.sectionCounts?.experience ?? resumeData.experience?.length ?? 0})
                                </h3>
                                {resumeData.experienceSummary?.isFresher && !resumeData.experienceSummary?.hasProfessionalExperience && (
                                  <div className={`mb-4 p-3 rounded-lg border ${templateStyle.statsBg} ${templateStyle.statsBorder}`}>
                                    <p className="text-sm font-semibold text-slate-800">Fresher Profile</p>
                                    <p className="text-xs text-slate-600 mt-1">
                                      Entry-level candidate profile. Resume includes project/skills readiness for first role.
                                    </p>
                                  </div>
                                )}
                                {(resumeData.experience?.length > 0 || resumeData.experienceSummary?.isFresher) ? (
                                  <div className="space-y-5">
                                    {resumeData.experience.map((exp: any, i: number) => (
                                      <div key={i}>
                                        <div className="flex justify-between items-baseline mb-1">
                                          <h4 className="font-bold text-slate-800 text-base">{exp.position}</h4>
                                          <span className="text-sm text-slate-500 font-medium">
                                            {exp.startDate ? new Date(exp.startDate).getFullYear() : "N/A"} -{" "}
                                            {exp.current ? "Present" : (exp.endDate ? new Date(exp.endDate).getFullYear() : "N/A")}
                                          </span>
                                        </div>
                                        <div className={`text-sm font-semibold mb-2 ${templateStyle.accentText}`}>{exp.company}</div>
                                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                                          {exp.description}
                                        </p>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-slate-500">No experience details added yet.</p>
                                )}
                              </section>

                              {resumeData.performance && (
                                <section>
                                  <h3 className="text-lg font-bold text-elite-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-4">
                                    Interview Performance
                                  </h3>
                                  <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className={`p-3 rounded-lg border ${templateStyle.statsBg} ${templateStyle.statsBorder}`}>
                                      <div className="text-[10px] text-slate-500 uppercase font-bold">Tech Rating</div>
                                      <div className="text-xl font-bold text-elite-black">{resumeData.performance.avgTechnical}/5.0</div>
                                    </div>
                                    <div className={`p-3 rounded-lg border ${templateStyle.statsBg} ${templateStyle.statsBorder}`}>
                                      <div className="text-[10px] text-slate-500 uppercase font-bold">Comm Rating</div>
                                      <div className="text-xl font-bold text-elite-black">{resumeData.performance.avgCommunication}/5.0</div>
                                    </div>
                                  </div>
                                  {resumeData.performance.highlights?.length > 0 && (
                                    <div>
                                      <div className="text-sm font-bold text-slate-700 mb-2">Key strengths verified by experts</div>
                                      <div className="flex flex-wrap gap-2">
                                        {resumeData.performance.highlights.map((h: string, i: number) => (
                                          <span key={i} className={`text-xs px-2 py-1 rounded-md border font-medium ${templateStyle.chipBg} ${templateStyle.chipText} ${templateStyle.chipBorder}`}>
                                            {h}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </section>
                              )}

                              {effectiveSingleColumn && (
                                <>
                                  <section>
                                    <h3 className="text-lg font-bold text-elite-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-4">
                                      Skills ({((resumeData.sectionCounts?.technicalSkills || 0) + (resumeData.sectionCounts?.softSkills || 0) + (resumeData.sectionCounts?.languages || 0))})
                                    </h3>
                                    <div className="space-y-4">
                                      <div>
                                        <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Technical</div>
                                        {(resumeData.skills?.technical || []).length > 0 ? (
                                          <div className="flex flex-wrap gap-2">
                                            {(resumeData.skills.technical || []).map((s: string, i: number) => (
                                              <span key={i} className={`text-xs px-2 py-1 rounded font-medium border ${templateStyle.chipBg} ${templateStyle.chipText} ${templateStyle.chipBorder}`}>
                                                {s}
                                              </span>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-xs text-slate-500">No technical skills added.</p>
                                        )}
                                      </div>
                                      <div>
                                        <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Soft Skills</div>
                                        {(resumeData.skills?.soft || []).length > 0 ? (
                                          <div className="flex flex-wrap gap-2">
                                            {(resumeData.skills.soft || []).map((s: string, i: number) => (
                                              <span key={i} className={`text-xs px-2 py-1 rounded font-medium border ${templateStyle.chipBg} ${templateStyle.chipText} ${templateStyle.chipBorder}`}>
                                                {s}
                                              </span>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-xs text-slate-500">No soft skills added.</p>
                                        )}
                                      </div>
                                      <div>
                                        <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Languages</div>
                                        {(resumeData.skills?.languages || []).length > 0 ? (
                                          <div className="flex flex-wrap gap-2">
                                            {(resumeData.skills.languages || []).map((s: string, i: number) => (
                                              <span key={i} className={`text-xs px-2 py-1 rounded font-medium border ${templateStyle.chipBg} ${templateStyle.chipText} ${templateStyle.chipBorder}`}>
                                                {s}
                                              </span>
                                            ))}
                                          </div>
                                        ) : (
                                          <p className="text-xs text-slate-500">No language skills added.</p>
                                        )}
                                      </div>
                                    </div>
                                  </section>

                                  <section>
                                    <h3 className="text-lg font-bold text-elite-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-4">
                                      Education ({resumeData.sectionCounts?.education ?? resumeData.education?.length ?? 0})
                                    </h3>
                                    {resumeData.education?.length > 0 ? (
                                      <div className="space-y-4">
                                        {resumeData.education.map((edu: any, i: number) => (
                                          <div key={i}>
                                            <div className="text-sm font-bold text-elite-black">{edu.degree}</div>
                                            <div className={`text-sm font-medium ${templateStyle.accentText}`}>{edu.institution}</div>
                                            <div className="text-xs text-slate-500">{edu.startYear} - {edu.endYear || "Present"}</div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-slate-500">No education details added yet.</p>
                                    )}
                                  </section>

                                  <section>
                                    <h3 className="text-lg font-bold text-elite-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-4">
                                      Certifications & Achievements ({resumeData.sectionCounts?.certifications ?? resumeData.certifications?.length ?? 0})
                                    </h3>
                                    {resumeData.certifications?.length > 0 ? (
                                      <div className="space-y-3">
                                        {resumeData.certifications.map((cert: any, i: number) => (
                                          <div key={i}>
                                            <div className="text-sm font-bold text-elite-black">{cert.name}</div>
                                            <div className="text-xs text-slate-600">{cert.issuer}</div>
                                            <div className="text-xs text-slate-400">{cert.issueDate ? new Date(cert.issueDate).getFullYear() : ""}</div>
                                          </div>
                                        ))}
                                      </div>
                                    ) : (
                                      <p className="text-sm text-slate-500">No certifications added yet.</p>
                                    )}
                                  </section>
                                </>
                              )}
                            </div>

                            {!effectiveSingleColumn && (
                              <div className={`space-y-8 ${templateStyle.rightColumnBg} rounded-lg p-4`}>
                                <section>
                                  <h3 className="text-lg font-bold text-elite-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-4">
                                    Skills ({((resumeData.sectionCounts?.technicalSkills || 0) + (resumeData.sectionCounts?.softSkills || 0) + (resumeData.sectionCounts?.languages || 0))})
                                  </h3>
                                  <div className="space-y-4">
                                    <div>
                                      <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Technical</div>
                                      {(resumeData.skills?.technical || []).length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                          {(resumeData.skills.technical || []).map((s: string, i: number) => (
                                            <span key={i} className={`text-xs px-2 py-1 rounded font-medium border ${templateStyle.chipBg} ${templateStyle.chipText} ${templateStyle.chipBorder}`}>
                                              {s}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-xs text-slate-500">No technical skills added.</p>
                                      )}
                                    </div>
                                    <div>
                                      <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Soft Skills</div>
                                      {(resumeData.skills?.soft || []).length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                          {(resumeData.skills.soft || []).map((s: string, i: number) => (
                                            <span key={i} className={`text-xs px-2 py-1 rounded font-medium border ${templateStyle.chipBg} ${templateStyle.chipText} ${templateStyle.chipBorder}`}>
                                              {s}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-xs text-slate-500">No soft skills added.</p>
                                      )}
                                    </div>
                                    <div>
                                      <div className="text-[10px] font-bold text-slate-500 mb-2 uppercase">Languages</div>
                                      {(resumeData.skills?.languages || []).length > 0 ? (
                                        <div className="flex flex-wrap gap-2">
                                          {(resumeData.skills.languages || []).map((s: string, i: number) => (
                                            <span key={i} className={`text-xs px-2 py-1 rounded font-medium border ${templateStyle.chipBg} ${templateStyle.chipText} ${templateStyle.chipBorder}`}>
                                              {s}
                                            </span>
                                          ))}
                                        </div>
                                      ) : (
                                        <p className="text-xs text-slate-500">No language skills added.</p>
                                      )}
                                    </div>
                                  </div>
                                </section>

                                <section>
                                  <h3 className="text-lg font-bold text-elite-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-4">
                                    Education ({resumeData.sectionCounts?.education ?? resumeData.education?.length ?? 0})
                                  </h3>
                                  {resumeData.education?.length > 0 ? (
                                    <div className="space-y-4">
                                      {resumeData.education.map((edu: any, i: number) => (
                                        <div key={i}>
                                          <div className="text-sm font-bold text-elite-black">{edu.degree}</div>
                                          <div className={`text-sm font-medium ${templateStyle.accentText}`}>{edu.institution}</div>
                                          <div className="text-xs text-slate-500">{edu.startYear} - {edu.endYear || "Present"}</div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-slate-500">No education details added yet.</p>
                                  )}
                                </section>

                                <section>
                                  <h3 className="text-lg font-bold text-elite-black uppercase tracking-wider border-b border-slate-300 pb-1 mb-4">
                                    Certifications & Achievements ({resumeData.sectionCounts?.certifications ?? resumeData.certifications?.length ?? 0})
                                  </h3>
                                  {resumeData.certifications?.length > 0 ? (
                                    <div className="space-y-3">
                                      {resumeData.certifications.map((cert: any, i: number) => (
                                        <div key={i}>
                                          <div className="text-sm font-bold text-elite-black">{cert.name}</div>
                                          <div className="text-xs text-slate-600">{cert.issuer}</div>
                                          <div className="text-xs text-slate-400">{cert.issueDate ? new Date(cert.issueDate).getFullYear() : ""}</div>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <p className="text-sm text-slate-500">No certifications added yet.</p>
                                  )}
                                </section>
                              </div>
                            )}
                          </div>
                        );
                      })()}
                    </>
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
  );
}
