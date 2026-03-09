import { Link } from "react-router-dom";
import {
  Sparkles,
  Video,
  Users,
  Award,
  Calendar,
  MessageSquare,
  ArrowRight,
  Shield,
  Star,
} from "lucide-react";
import { PricingSection } from "@/components/blocks/pricing-section";
import { PAYMENT_FREQUENCIES, TIERS } from "@/components/blocks/pricing-data";

/**
 * Marketing landing for guests: blue hero first, then light sections. Brand #004fcb, clear CTAs.
 */
export default function MarketingLanding() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* ——— Hero: Blue, good-looking, first thing visitors see ——— */}
      <section className="relative overflow-hidden bg-[#004fcb] text-white [&_h1]:!text-white [&_h2]:!text-white [&_p]:!text-white [&_span]:!text-inherit">
        {/* Soft gradient overlay for depth */}
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

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-16 pb-16 sm:pb-20 md:pt-20 md:pb-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/15 border border-white/25 mb-6">
              <Sparkles className="w-4 h-4 text-amber-200" />
              <span className="text-sm font-semibold text-white">Mockeefy</span>
            </div>
            <h1 className="!text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Your first interview
              <span className="block mt-2 text-blue-100">shouldn’t be the real one</span>
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
        </div>
      </section>

      {/* ——— Value props: light background, blue accents ——— */}
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

      {/* ——— Pricing (monthly/yearly tiers) ——— */}
      <section className="relative">
        <div className="absolute inset-0 -z-10 h-full w-full bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:35px_35px] opacity-20 [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]" />
        <PricingSection
          title="Simple Pricing"
          subtitle="Choose the best plan for your needs"
          frequencies={PAYMENT_FREQUENCIES}
          tiers={TIERS}
        />
      </section>

      {/* ——— Expert booking: blue CTA card ——— */}
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

      {/* ——— Mock interview + AI: two cards ——— */}
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
              Mockeefy AI
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">AI-powered practice</h3>
            <p className="text-slate-600 text-sm md:text-base mb-6 leading-relaxed">
              Use Mockeefy AI for instant mock sessions, tailored questions, and quick feedback—anytime you’re ready to practice.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 text-[#004fcb] font-bold hover:text-blue-700 transition-colors"
            >
              Try Mockeefy AI
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ——— Trust strip: light ——— */}
      <section className="border-y border-slate-200/80 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-slate-600 text-sm font-medium">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#004fcb]" />
              Secure booking
            </span>
            <span className="flex items-center gap-2">
              <Star className="w-5 h-5 text-[#004fcb]" />
              Verified experts only
            </span>
            <span className="flex items-center gap-2">
              <Video className="w-5 h-5 text-[#004fcb]" />
              1:1 video sessions
            </span>
          </div>
        </div>
      </section>

      {/* ——— Final CTA: blue again ——— */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="rounded-2xl bg-[#004fcb] text-white p-8 md:p-12 text-center shadow-xl shadow-blue-900/20 relative overflow-hidden [&_h1]:!text-white [&_h2]:!text-white [&_p]:!text-white">
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`, backgroundSize: "24px 24px" }} />
          <div className="relative z-10">
            <h2 className="!text-white text-xl md:text-2xl font-bold mb-2">Ready to ace your next interview?</h2>
            <p className="!text-blue-100 text-sm md:text-base max-w-xl mx-auto mb-8">
              Join Mockeefy, book an expert, and get the practice and feedback you need—without the pressure of the real thing.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-[#004fcb] font-bold rounded-xl hover:bg-blue-50 shadow-lg transition-all"
              >
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/signin"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white/15 border-2 border-white/40 text-white font-semibold rounded-xl hover:bg-white/25 transition-all"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
