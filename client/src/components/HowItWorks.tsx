import { UserPlus, Search, CalendarCheck, Video, ArrowRight } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: UserPlus,
    title: "Sign up & choose your role",
    description: "Create your account as a Student, Company, or Mentor. Set up your profile in seconds and get instant access.",
  },
  {
    number: "02",
    icon: Search,
    title: "Pick a category & expert",
    description: "Browse verified mentors by category (IT, HR, Business, Design). Compare ratings, experience, and session fees.",
  },
  {
    number: "03",
    icon: CalendarCheck,
    title: "Book date & time slot",
    description: "Select your preferred date from the calendar and choose an available time. Session duration and level are configurable.",
  },
  {
    number: "04",
    icon: Video,
    title: "Attend session & get feedback",
    description: "Join the 1:1 video call, run a realistic mock interview, and receive a detailed scorecard with actionable next steps.",
  },
];

const HowItWorks = () => {
  return (
    <section className="py-16 md:py-24 bg-slate-50/80 border-y border-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-elite-blue/10 border border-blue-100 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-elite-blue"></span>
            <span className="text-[10px] font-black text-elite-blue uppercase tracking-[0.2em]">Process</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-elite-black tracking-tight mb-3">
            How it works
          </h2>
          <p className="text-slate-600 text-base md:text-lg max-w-2xl mx-auto font-medium">
            Four simple steps from sign-up to your first mock interview. No hassle, no confusion.
          </p>
        </div>

        {/* Steps grid - professional cards with connector */}
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-4">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative flex flex-col">
                  {/* Card */}
                  <div className="relative bg-white rounded-2xl border border-slate-200/80 p-6 h-full shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_32px_-8px_rgba(0,79,203,0.12)] hover:border-blue-100/80 transition-all duration-300 group">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-12 h-12 rounded-xl bg-elite-blue/10 flex items-center justify-center text-elite-blue group-hover:bg-elite-blue group-hover:text-white transition-colors duration-300">
                        <Icon className="w-6 h-6" strokeWidth={2} />
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                        {step.number}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-elite-black mb-2 leading-snug">
                      {step.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed font-medium">
                      {step.description}
                    </p>
                  </div>

                  {/* Connector line - desktop only, between cards */}
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -translate-y-1/2 left-[calc(100%+0.5rem)] w-[calc(100%/4-2rem)] max-w-[80px] h-0.5 bg-slate-200 -mr-2 pointer-events-none z-0">
                      <div className="h-full w-0 bg-elite-blue group-hover:w-full transition-all duration-500 rounded-full" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <a
            href="#experts"
            className="inline-flex items-center gap-2 px-8 py-4 bg-elite-blue text-white rounded-2xl font-bold text-sm shadow-lg shadow-blue-500/25 hover:bg-blue-600 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-300 active:scale-[0.98]"
          >
            Browse experts & book
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
