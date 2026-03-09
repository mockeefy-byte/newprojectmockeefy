import { Link } from "react-router-dom";
import {
  Sparkles,
  ArrowRight,
  UserPlus,
  Search,
  CalendarCheck,
  Video,
} from "lucide-react";

const processSteps = [
  { number: "01", icon: UserPlus, label: "Sign up & choose your role" },
  { number: "02", icon: Search, label: "Pick a category & expert" },
  { number: "03", icon: CalendarCheck, label: "Book date & time slot" },
  { number: "04", icon: Video, label: "Attend session & get feedback" },
];

export default function LandingHeroSection() {
  return (
    <section className="relative overflow-hidden bg-[#004fcb] text-white [&_h1]:!text-white [&_h2]:!text-white [&_p]:!text-white [&_span]:!text-inherit">
      <div className="absolute inset-0 bg-gradient-to-br from-[#004fcb] via-[#004fcb] to-blue-800/90" />
      <div className="absolute inset-0 opacity-10" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-14 sm:pb-16 md:pt-20 md:pb-20">
        <div className="text-center max-w-3xl mx-auto mb-10 md:mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 mb-6">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span className="text-sm font-semibold text-white">Mockeefy</span>
          </div>
          <p className="text-blue-200/90 text-xs font-bold uppercase tracking-[0.25em] mb-3">The process</p>
          <h1 className="!text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            Your first interview
            <span className="block mt-2 text-blue-100">shouldn't be the real one</span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-blue-100 font-medium leading-relaxed max-w-2xl mx-auto">
            Practice with verified HR & tech experts. Get detailed feedback. Land your dream role with confidence.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#004fcb] font-bold rounded-xl hover:bg-blue-50 shadow-xl shadow-black/10 transition-all active:scale-[0.98]"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/signin"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/15 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/25 transition-all backdrop-blur-sm"
            >
              Log in
            </Link>
          </div>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {processSteps.map((step) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.number}
                  className="relative flex flex-col items-center text-center rounded-xl bg-white/10 border border-white/20 backdrop-blur-sm px-4 py-5 sm:px-5 sm:py-6 hover:bg-white/15 hover:border-white/30 transition-all duration-300"
                >
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-white/20 flex items-center justify-center text-white mb-3">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" strokeWidth={2} />
                  </div>
                  <span className="text-[10px] sm:text-xs font-black text-white/70 uppercase tracking-widest mb-1.5">
                    {step.number}
                  </span>
                  <p className="text-white text-sm sm:text-base font-semibold leading-snug">
                    {step.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
