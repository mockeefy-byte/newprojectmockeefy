import { Video, Users, Award } from "lucide-react";

export default function WhyMockeefySection() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <p className="text-center text-[#004fcb] text-sm font-bold uppercase tracking-widest mb-2">Why Mockeefy</p>
      <h2 className="text-center text-2xl sm:text-3xl font-bold text-slate-900 mb-10">Practice like the real thing</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        <div className="text-center p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-[#004fcb]/20 transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-[#004fcb]/10 flex items-center justify-center mx-auto mb-4 text-[#004fcb]">
            <Video className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2 text-lg">Live mock interviews</h3>
          <p className="text-sm text-slate-600 leading-relaxed">1:1 video sessions with real industry experts. No bots, no scripts.</p>
        </div>
        <div className="text-center p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-[#004fcb]/20 transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-[#004fcb]/10 flex items-center justify-center mx-auto mb-4 text-[#004fcb]">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2 text-lg">Verified mentors</h3>
          <p className="text-sm text-slate-600 leading-relaxed">HR, IT, and domain specialists. Pick by category and book a slot that fits you.</p>
        </div>
        <div className="text-center p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-[#004fcb]/20 transition-all duration-300">
          <div className="w-14 h-14 rounded-2xl bg-[#004fcb]/10 flex items-center justify-center mx-auto mb-4 text-[#004fcb]">
            <Award className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2 text-lg">Actionable feedback</h3>
          <p className="text-sm text-slate-600 leading-relaxed">Scorecards, strengths, and a clear plan so you improve fast.</p>
        </div>
      </div>
    </section>
  );
}
