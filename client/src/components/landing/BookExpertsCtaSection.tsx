import { Link } from "react-router-dom";
import { Calendar, ArrowRight } from "lucide-react";

export default function BookExpertsCtaSection() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <Link
        to="/signup"
        className="block group relative overflow-hidden rounded-2xl bg-[#004fcb] text-white p-6 md:p-8 shadow-xl shadow-blue-900/20 hover:shadow-2xl hover:shadow-blue-900/25 transition-all duration-300 [&_h1]:!text-white [&_h2]:!text-white [&_p]:!text-white"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#004fcb] to-blue-800/80" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: "24px 24px" }} />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold uppercase tracking-wider mb-4">
              <Calendar className="w-3.5 h-3.5" />
              Book experts
            </div>
            <h2 className="!text-white text-2xl md:text-3xl font-bold mb-2">
              Book a session with verified experts
            </h2>
            <p className="!text-blue-100 text-base md:text-lg max-w-xl">
              Choose your category, pick an expert, and book a time that works. Get a realistic mock interview and detailed feedback.
            </p>
          </div>
          <div className="flex-shrink-0">
            <span className="inline-flex items-center gap-2 px-6 py-3.5 bg-white text-[#004fcb] font-bold rounded-xl group-hover:bg-blue-50 transition-colors shadow-lg">
              Book an expert
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </div>
      </Link>
    </section>
  );
}
