import { Briefcase, ChevronRight, Check, Lightbulb, Zap, BookOpen, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCertification } from "../hooks/useCertification";
import axios from "../lib/axios";
import { toast } from "sonner";

interface InfoPanelProps {
  /** When true (e.g. below main on mobile), panel uses full width instead of 280px */
  fullWidth?: boolean;
}

const InfoPanel = ({ fullWidth }: InfoPanelProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: certData } = useCertification();

  const completed = certData?.completedSessions ?? 0;
  const target = certData?.targetSessions ?? 3;
  const isEligible = certData?.isEligibleForCertificate ?? false;
  const hasCert = (certData?.certifications?.length ?? 0) > 0;
  const step1Done = completed >= target;
  const step2Active = step1Done && (hasCert || isEligible);
  const step3Active = hasCert;

  const handleGetCertificate = async () => {
    const userId = (user as any)?._id ?? user?.id;
    if (!userId) return;
    try {
      const res = await axios.post("/api/certifications/issue", { userId });
      if (res.data?.success) {
        toast.success("Certificate issued!");
        navigate("/certificates");
        window.location.reload();
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Could not issue certificate.");
    }
  };

  return (
    <div className={`space-y-4 font-sans ${fullWidth ? "w-full max-w-full" : "max-w-[280px]"}`}>

      {/* Book experts & related – no AI/Intelligence */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-100">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Book & practice</h2>
        </div>
        <div className="p-3 space-y-2">
          <button
            onClick={() => navigate('/my-sessions')}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100 border border-slate-100 hover:border-slate-200 transition-all text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4 text-slate-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">My bookings</p>
              <p className="text-[10px] text-slate-500 mt-0.5">View, join, and review</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </button>
          <button
            onClick={() => navigate('/tips')}
            className="w-full flex items-center gap-3 p-3 rounded-xl bg-slate-50/80 hover:bg-amber-50 border border-slate-100 hover:border-amber-200 transition-all text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-white border border-slate-100 flex items-center justify-center shrink-0">
              <Lightbulb className="w-4 h-4 text-amber-500" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800">Interview tips</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Get hired faster</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 shrink-0" />
          </button>
          <button
            onClick={() => navigate('/plans')}
            className="group w-full flex items-center gap-3 p-3 rounded-xl bg-elite-blue/10 hover:bg-elite-blue hover:text-white border border-blue-100 hover:border-elite-blue transition-all text-left"
          >
            <div className="w-9 h-9 rounded-lg bg-white border border-blue-100 flex items-center justify-center shrink-0 group-hover:border-blue-200">
              <Zap className="w-4 h-4 text-elite-blue" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-slate-800 group-hover:text-white">Plans & pricing</p>
              <p className="text-[10px] text-slate-500 group-hover:text-blue-100 mt-0.5">Unlimited mocks</p>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-white shrink-0" />
          </button>
        </div>
      </div>

      {/* Interview → Certificate (3 completed = certificate) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-5 sm:p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <Briefcase className="w-4 h-4 text-elite-blue shrink-0" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-600">Path to certificate</h2>
        </div>
        <div className="space-y-4">
          <div className="flex gap-4 items-start">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 ${step1Done ? 'bg-elite-blue border-elite-blue text-white' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              1
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-slate-900">Complete 3 mock interviews</p>
              <p className="text-xs text-slate-500 mt-1">{completed} of {target} sessions done</p>
            </div>
            {step1Done && <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" strokeWidth={3} />}
          </div>
          <div className="flex gap-4 items-start">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 ${step2Active ? 'bg-elite-blue border-elite-blue text-white' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              2
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-slate-900">Earn your certificate</p>
              <p className="text-xs text-slate-500 mt-1">{hasCert ? "Certificate issued" : isEligible ? "Ready to claim" : "Available after step 1"}</p>
            </div>
            {(hasCert || isEligible) && <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" strokeWidth={3} />}
          </div>
          <div className="flex gap-4 items-start">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border shrink-0 ${step3Active ? 'bg-elite-blue border-elite-blue text-white' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
              3
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="text-sm font-semibold text-slate-900">Get referred to companies</p>
              <p className="text-xs text-slate-500 mt-1">500+ hiring companies in Pipeline Hub</p>
            </div>
            {step3Active && <Check className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" strokeWidth={3} />}
          </div>
          {isEligible ? (
            <button
              onClick={handleGetCertificate}
              className="w-full mt-5 flex items-center justify-center gap-2 py-3 bg-elite-blue hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all"
            >
              <Award size={16} /> Get your certificate
            </button>
          ) : (
            <button
              onClick={() => navigate(hasCert ? '/certificates' : '/tips')}
              className="w-full mt-5 flex items-center justify-center gap-2 py-3 bg-elite-blue hover:bg-blue-600 text-white rounded-xl text-sm font-semibold transition-all"
            >
              {hasCert ? "View certificates" : "Open Pipeline Hub"} <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>

    </div>
  );
};

export const SkeletonInfoPanel = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-40 bg-white rounded-2xl border border-slate-100"></div>
    <div className="h-48 bg-white rounded-2xl border border-slate-100"></div>
  </div>
);

export default InfoPanel;
