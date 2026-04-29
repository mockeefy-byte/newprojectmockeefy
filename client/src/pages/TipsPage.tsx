import { useState, useEffect, useRef } from "react";
import {
  Briefcase,
  MapPin,
  Building2,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  ListOrdered,
  Target,
  Sparkles,
  Check,
  CheckCircle2,
  XCircle,
  Code2,
  GitBranch,
} from "lucide-react";
import axios from "../lib/axios";

type ProcessStep = { step: number; label: string; detail: string };
type DoDont = { type: "do" | "dont"; text: string };

type TipsData = {
  category: string;
  title: string;
  intro: string;
  interviewProcess?: ProcessStep[];
  whatTheyAsk: string[];
  howToPrepare: string[];
  technicalDeepDive?: string[];
  doAndDonts?: DoDont[];
  commonPositions: string[];
  customIntro?: string | null;
  context?: { company: string | null; location: string | null; position: string | null };
};

const CATEGORY_OPTIONS = ["IT", "HR", "Business", "Design"];

function CategorySelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div className="relative z-20" ref={menuRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 flex items-center justify-between hover:border-blue-300 hover:bg-blue-50/30 transition-all"
      >
        <span>{value}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-40 mt-2 w-full rounded-xl border border-slate-200 bg-white shadow-xl p-1.5">
          {CATEGORY_OPTIONS.map((option) => {
            const isActive = option === value;
            return (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`w-full px-3 py-2 rounded-lg text-left text-sm font-semibold flex items-center justify-between ${
                  isActive ? "bg-blue-50 text-elite-blue" : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <span>{option}</span>
                {isActive ? <Check className="w-4 h-4" /> : null}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function TipsPage() {
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [position, setPosition] = useState("");
  const [category, setCategory] = useState("IT");
  const [tips, setTips] = useState<TipsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleGetTips = async () => {
    setLoading(true);
    setSubmitted(true);
    setTips(null);
    try {
      const res = await axios.post("/api/tips/generate", {
        company: company.trim() || undefined,
        location: location.trim() || undefined,
        position: position.trim() || undefined,
        category: category || "IT",
      });
      if (res.data?.success && res.data?.data) {
        setTips(res.data.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
      <div className="space-y-8 animate-in fade-in duration-500 pb-10 max-w-4xl mx-auto">
        {/* Header - same style as My Simulations / other pages */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-visible">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2.5">
                <Lightbulb className="w-4 h-4 text-elite-blue" />
                <h1 className="font-elite leading-none text-slate-900">Interview Tips & Job Process</h1>
              </div>
              <p className="text-[10px] text-slate-500 font-medium mt-1">
                Technical, HR, and process tips by category — what companies ask and how to prepare
              </p>
            </div>
          </div>

          {/* Filter form - inside same card */}
          <div className="p-6 md:p-7 border-b border-slate-100 bg-slate-50/30">
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-5">
              Filter by context
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Company name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. TCS, Infosys"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-elite-blue/20 focus:border-elite-blue"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Chennai, Remote"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-elite-blue/20 focus:border-elite-blue"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Position / Role
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="e.g. Software Engineer"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-elite-blue/20 focus:border-elite-blue"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <CategorySelect value={category} onChange={setCategory} />
              </div>
            </div>
            <button
              onClick={handleGetTips}
              disabled={loading}
              className="mt-5 px-5 py-2.5 bg-elite-blue hover:bg-blue-600 disabled:opacity-70 text-white rounded-xl text-[11px] font-black tracking-tight flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                  Generating your tips...
                </>
              ) : (
                <>
                  Get tips
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading state - full card like other pages */}
        {loading && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden p-8 md:p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 border-2 border-elite-blue border-t-transparent rounded-full animate-spin" />
              <p className="text-sm font-bold text-slate-700">Generating your tips...</p>
              <p className="text-[10px] text-slate-500 font-medium">
                Preparing category-based process, technical focus, and do’s & don’ts
              </p>
            </div>
          </div>
        )}

        {/* Tips result */}
        {!loading && tips && (
          <div className="space-y-6">
            {tips.customIntro && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-sm text-blue-900 font-medium">
                {tips.customIntro}
              </div>
            )}

            {/* Process steps */}
            {tips.interviewProcess && tips.interviewProcess.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-2.5">
                  <GitBranch className="w-4 h-4 text-elite-blue" />
                  <h2 className="font-elite leading-none text-slate-900">Interview process</h2>
                </div>
                <div className="p-5 md:p-6">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-4">
                    Typical flow for this category
                  </p>
                  <ol className="space-y-4">
                    {tips.interviewProcess.map((item) => (
                      <li key={item.step} className="flex gap-4">
                        <span className="w-8 h-8 rounded-xl bg-elite-blue text-white flex items-center justify-center text-xs font-black shrink-0">
                          {item.step}
                        </span>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.label}</p>
                          <p className="text-xs text-slate-600 mt-0.5">{item.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* What they ask + How to prepare - one card */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <h3 className="font-bold text-slate-900">{tips.title}</h3>
                <p className="text-sm text-slate-600 mt-0.5">{tips.intro}</p>
              </div>
              <div className="p-5 md:p-6 space-y-6">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <ListOrdered className="w-4 h-4" />
                    What they typically ask
                  </h4>
                  <ul className="space-y-2">
                    {tips.whatTheyAsk.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-elite-blue font-bold shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                    <Target className="w-4 h-4" />
                    How to prepare
                  </h4>
                  <ul className="space-y-2">
                    {tips.howToPrepare.map((item, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-700">
                        <span className="text-emerald-600 font-bold shrink-0">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technical deep-dive (IT) */}
                {tips.technicalDeepDive && tips.technicalDeepDive.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2 mb-3">
                      <Code2 className="w-4 h-4" />
                      Technical focus areas
                    </h4>
                    <ul className="space-y-2">
                      {tips.technicalDeepDive.map((item, i) => (
                        <li key={i} className="flex gap-2 text-sm text-slate-700">
                          <span className="text-amber-600 font-bold shrink-0">•</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Do's & Don'ts */}
                {tips.doAndDonts && tips.doAndDonts.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-3">
                      Do’s & don’ts
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {tips.doAndDonts.map((item, i) => (
                        <div
                          key={i}
                          className={`flex gap-2 p-3 rounded-xl text-sm ${
                            item.type === "do"
                              ? "bg-emerald-50 border border-emerald-100 text-emerald-900"
                              : "bg-rose-50 border border-rose-100 text-rose-900"
                          }`}
                        >
                          {item.type === "do" ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                          ) : (
                            <XCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                          )}
                          <span>{item.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {tips.commonPositions && tips.commonPositions.length > 0 && (
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-2">
                      Common positions in this category
                    </h4>
                    <p className="text-sm text-slate-600">
                      {tips.commonPositions.join(" · ")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {!loading && !tips && submitted && (
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-8 text-center">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">Click &quot;Get tips&quot; to see interview process and tips for your chosen category.</p>
          </div>
        )}
      </div>
  );
}
