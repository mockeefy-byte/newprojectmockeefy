import { Shield, BookOpen, Lightbulb, Sparkles, Briefcase, ChevronRight, Check, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const InfoPanel = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-[280px] space-y-4 font-sans">

      {/* CARD 1: AI TOOLS - ALL WHITE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-elite-blue" />
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Intelligence</h2>
          </div>
        </div>

        <div
          onClick={() => navigate('/ai-video')}
          className="group relative bg-slate-50/50 rounded-xl border border-slate-100 p-3 hover:bg-elite-blue transition-all duration-300 cursor-pointer overflow-hidden"
        >
          <div className="flex gap-3 relative z-10">
            <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-slate-100 group-hover:bg-blue-600 transition-all duration-300">
              <Sparkles className="w-4 h-4 text-slate-400 group-hover:text-white" />
            </div>
            <div className="flex-1 min-w-0 pt-0.5">
              <p className="font-elite group-hover:text-white truncate">Resume Scout</p>
              <p className="text-[8px] text-slate-400 font-bold mt-1 group-hover:text-blue-100 transition-colors uppercase tracking-tight">AI Optimization</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="p-2.5 bg-slate-50/30 rounded-lg border border-slate-100 flex flex-col items-center justify-center group hover:bg-white hover:border-blue-100 transition-all cursor-pointer">
            <Shield className="w-4 h-4 text-slate-300 group-hover:text-elite-blue mb-1" />
            <p className="text-[9px] font-black text-slate-800 tracking-tight">Secure</p>
          </div>
          <div className="p-2.5 bg-slate-50/30 rounded-lg border border-slate-100 flex flex-col items-center justify-center group hover:bg-white hover:border-amber-100 transition-all cursor-pointer">
            <Lightbulb className="w-4 h-4 text-slate-300 group-hover:text-amber-500 mb-1" />
            <p className="text-[9px] font-black text-slate-800 tracking-tight">ST⭐R Tips</p>
          </div>
        </div>
      </div>

      {/* CARD 2: PIPELINE - ALL WHITE BASE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="w-3.5 h-3.5 text-elite-blue" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Referral Pipeline</h2>
        </div>

        <div className="space-y-4">
          {[
            { id: 1, title: "Candidate Audit", desc: "3 simulation sessions", active: false },
            { id: 2, title: "Tier-1 Badge", desc: "System verification", active: false },
            { id: 3, title: "Career Match", desc: "Unlock 500+ firms", active: true }
          ].map((step) => (
            <div key={step.id} className="flex gap-3 items-start group">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${step.id === 3 ? 'bg-elite-blue border-blue-600 text-white' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                {step.id}
              </div>
              <div className="min-w-0 flex-1">
                <p className={`font-black text-[10px] leading-tight mb-0.5 tracking-tight ${step.id === 3 ? 'text-slate-900' : 'text-slate-600'}`}>{step.title}</p>
                <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">{step.desc}</p>
              </div>
              <Check className={`w-3 h-3 transition-opacity ${step.id === 3 ? 'text-emerald-500' : 'text-slate-100'}`} strokeWidth={4} />
            </div>
          ))}

          <button
            onClick={() => navigate('/my-sessions?view=jobs')}
            className="w-full mt-2 flex items-center justify-between px-4 py-2 bg-elite-blue hover:bg-blue-600 text-white rounded-xl text-[9px] font-black tracking-tight transition-all duration-300 shadow-sm"
          >
            <span>Pipeline Hub</span>
            <ChevronRight size={10} strokeWidth={4} />
          </button>
        </div>
      </div>

      {/* CARD 3: REPOSITORY */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 flex gap-2">
        <button className="flex-1 py-1.5 flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-all">
          <BookOpen size={11} /> QA
        </button>
        <button className="flex-1 py-1.5 flex items-center justify-center gap-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-black text-slate-500 uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 transition-all">
          <Zap size={11} /> GUIDES
        </button>
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
