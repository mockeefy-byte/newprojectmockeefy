import { Link } from "react-router-dom";
import { MessageSquare, Sparkles, ArrowRight } from "lucide-react";

export default function MockInterviewCardsSection() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
        <div className="rounded-2xl bg-white border border-slate-200/80 p-6 md:p-8 shadow-sm hover:shadow-md hover:border-[#004fcb]/20 transition-all duration-300">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-3">
            <MessageSquare className="w-3.5 h-3.5" />
            Mock interviews
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Practice like the real thing</h3>
          <p className="text-slate-600 text-sm md:text-base mb-6 leading-relaxed">
            HR rounds, technical interviews, and behavioral questions—all with real experts who give you honest, actionable feedback.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center gap-2 text-[#004fcb] font-bold hover:text-blue-700 transition-colors"
          >
            Start practicing
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="rounded-2xl bg-white border border-slate-200/80 p-6 md:p-8 shadow-sm hover:shadow-md hover:border-[#004fcb]/20 transition-all duration-300">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#004fcb]/10 text-[#004fcb] text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Book experts
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Book live mock sessions</h3>
          <p className="text-slate-600 text-sm md:text-base mb-6 leading-relaxed">
            Choose your slot, pick a verified expert, and practice with real-time feedback. Join via Google Meet and get detailed feedback after each session.
          </p>
          <Link
            to="/book-session"
            className="inline-flex items-center gap-2 text-[#004fcb] font-bold hover:text-blue-700 transition-colors"
          >
            Book a session
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
