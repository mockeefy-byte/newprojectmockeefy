import { useState, useEffect } from "react";
import { ArrowRight, Play, Sparkles, ShieldCheck, Zap, Globe } from "lucide-react";

const roles = [
  { text: "Interview Coach" },
  { text: "Career Mentor" },
  { text: "Placement Partner" },
  { text: "Tech Expert" },
  { text: "HR Specialist" }
];

const companies = ["Zoho", "Infosys", "TCS", "Wipro", "Cognizant", "Accenture"];

const ModernHeroBanner = () => {
  const [currentRole, setCurrentRole] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentRole((prev) => (prev + 1) % roles.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-white text-slate-900 border border-slate-200/60 rounded-[2.5rem] overflow-hidden relative shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] mx-auto max-w-7xl my-4">
      {/* Subtle Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:40px_40px] opacity-40" />

      {/* Premium Gradient Accent */}
      <div className="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-indigo-50/40 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute -bottom-[10%] -left-[5%] w-[30%] h-[30%] bg-slate-50/50 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 px-8 py-20 lg:py-28">
        {/* Main Hero Content */}
        <div className="text-center max-w-4xl mx-auto">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-50 border border-slate-100 shadow-sm mb-10">
            <Sparkles size={14} className="text-elite-blue" />
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-tight">The Global Simulation Protocol</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tighter text-slate-900">
            Your Intel-Driven
            <br />
            <span className="relative inline-block mt-4 text-elite-blue">
              {roles.map((role, idx) => (
                <span
                  key={idx}
                  className={`absolute inset-0 transition-all duration-700 ${idx === currentRole ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
                    }`}
                >
                  {role.text}
                </span>
              ))}
              <span className="opacity-0">{roles[0].text}</span>
            </span>
          </h1>

          <p className="text-lg text-slate-500 mb-12 max-w-xl mx-auto leading-relaxed font-medium">
            Master evaluations with AI-powered mock sessions and real HR intelligence.
            Build your high-density profile for global tech firms.
          </p>

          {/* Feature Pills - Tight & Professional */}
          <div className="flex flex-wrap justify-center gap-2.5 mb-14">
            {[
              { text: "AI Evaluation", icon: Zap },
              { text: "HR Intelligence", icon: ShieldCheck },
              { text: "24/7 Access", icon: Globe },
              { text: "Tier-1 Prep", icon: Sparkles }
            ].map((feature, idx) => (
              <div key={idx} className="px-5 py-2 bg-slate-50/80 border border-slate-100 rounded-xl text-[10px] font-black text-slate-600 tracking-tight flex items-center gap-2 hover:bg-white hover:border-blue-100 transition-all shadow-sm">
                <feature.icon className="w-3.5 h-3.5 text-elite-blue" />
                {feature.text}
              </div>
            ))}
          </div>

          {/* CTA Buttons - Executive Styling */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <button className="group px-10 py-4 bg-elite-blue text-white rounded-2xl font-black text-[11px] tracking-tight hover:bg-blue-600 transition-all flex items-center gap-2.5 shadow-xl shadow-blue-900/10 active:scale-95">
              Initiate Simulation
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="px-10 py-4 bg-white border border-slate-200 rounded-2xl font-black text-[11px] text-slate-600 hover:text-elite-blue hover:border-blue-100 transition-all flex items-center gap-2.5 shadow-sm active:scale-95">
              <Play className="w-4 h-4 fill-current" />
              Watch Demo
            </button>
          </div>

          {/* Unified Partner Section */}
          <div className="pt-12 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 mb-8 uppercase tracking-[0.2em]">Institutional Placements</p>
            <div className="flex flex-wrap justify-center gap-x-12 gap-y-6 items-center opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
              {companies.map((company, idx) => (
                <div key={idx} className="text-xl font-black text-slate-400 tracking-tighter cursor-default">
                  {company}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Integrated Executive Banner */}
      <div className="bg-slate-50/50 border-t border-slate-100 p-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <div className="inline-block px-2 py-0.5 rounded bg-blue-600 text-white text-[9px] font-black mb-2 uppercase tracking-tight">Protocol V2.0</div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-none">Chennai's Premier <span className="text-elite-blue">Sim Studio</span></h3>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-tight mt-2">Join 15,000+ candidates in the global pipeline</p>
          </div>
          <button className="whitespace-nowrap px-8 py-3.5 bg-elite-blue text-white rounded-xl text-[10px] font-black tracking-tight hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 active:scale-95 flex items-center gap-2">
            Get Started
            <ArrowRight size={14} strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModernHeroBanner;