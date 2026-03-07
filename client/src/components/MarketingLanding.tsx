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

/**
 * Marketing landing for guests: clean white/light theme. Hero, value props, expert booking, mock interviews.
 * CTAs: Get started → /signup, Log in → /signin.
 */
export default function MarketingLanding() {
  return (
    <div className="min-h-screen bg-white">
      {/* ——— Hero ——— */}
      <section className="relative overflow-hidden bg-white border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-100 border border-slate-200 mb-4">
              <Sparkles className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Mockeefy</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 tracking-tight leading-tight mb-3">
              Your first interview
              <span className="block text-slate-600 mt-1">shouldn’t be the real one</span>
            </h1>
            <p className="text-base md:text-lg text-slate-600 mb-6 font-medium leading-relaxed">
              Practice with verified HR & tech experts. Get detailed feedback. Land your dream role with confidence.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 shadow-sm transition-all"
              >
                Get started free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/signin"
                className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Value props ——— */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <div className="text-center p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-600">
              <Video className="w-7 h-7" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2 text-lg">Live mock interviews</h3>
            <p className="text-sm text-slate-600">1:1 video sessions with real industry experts. No bots, no scripts.</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-600">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2 text-lg">Verified mentors</h3>
            <p className="text-sm text-slate-600">HR, IT, and domain specialists. Pick by category and book a slot that fits you.</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-600">
              <Award className="w-7 h-7" />
            </div>
            <h3 className="font-semibold text-slate-900 mb-2 text-lg">Actionable feedback</h3>
            <p className="text-sm text-slate-600">Scorecards, strengths, and a clear plan so you improve fast.</p>
          </div>
        </div>
      </section>

      {/* ——— Expert booking banner ——— */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6">
        <Link
          to="/signup"
          className="block group relative overflow-hidden rounded-2xl bg-white border border-slate-200 p-6 md:p-8 shadow-sm hover:shadow-lg hover:border-slate-300 transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-4">
                <Calendar className="w-3.5 h-3.5" />
                Book experts
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">
                Book a session with verified experts
              </h2>
              <p className="text-slate-600 text-base md:text-lg max-w-xl">
                Choose your category, pick an expert, and book a time that works. Get a realistic mock interview and detailed feedback—all in one place.
              </p>
            </div>
            <div className="flex-shrink-0">
              <span className="inline-flex items-center gap-2 px-6 py-3.5 bg-slate-900 text-white font-semibold rounded-xl group-hover:bg-slate-800 transition-colors shadow-sm">
                Book an expert
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </Link>
      </section>

      {/* ——— Mock interview + AI ——— */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-5">
          <div className="rounded-2xl bg-white border border-slate-200 p-6 md:p-8 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-3">
              <MessageSquare className="w-3.5 h-3.5" />
              Mock interviews
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Practice like the real thing</h3>
            <p className="text-slate-600 text-sm md:text-base mb-6">
              HR rounds, technical interviews, and behavioral questions—all with real experts who give you honest, actionable feedback.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 text-slate-700 font-semibold hover:text-slate-900 transition-colors"
            >
              Start practicing
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="rounded-3xl bg-white border border-slate-200 p-8 md:p-10 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-300">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold uppercase tracking-wider mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Mockeefy AI
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">AI-powered practice</h3>
            <p className="text-slate-600 text-sm md:text-base mb-6">
              Use Mockeefy AI for instant mock sessions, tailored questions, and quick feedback—anytime you’re ready to practice.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 text-slate-700 font-semibold hover:text-slate-900 transition-colors"
            >
              Try Mockeefy AI
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ——— Trust strip ——— */}
      <section className="border-y border-slate-100 bg-slate-50/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-5 md:py-6">
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 text-slate-600 text-sm font-medium">
            <span className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-slate-500" />
              Secure booking
            </span>
            <span className="flex items-center gap-2">
              <Star className="w-5 h-5 text-slate-500" />
              Verified experts only
            </span>
            <span className="flex items-center gap-2">
              <Video className="w-5 h-5 text-slate-500" />
              1:1 video sessions
            </span>
          </div>
        </div>
      </section>

      {/* ——— Final CTA ——— */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="rounded-2xl bg-white border border-slate-200 p-8 md:p-10 text-center shadow-sm">
          <h2 className="text-xl md:text-2xl font-bold text-slate-900 mb-2">Ready to ace your next interview?</h2>
          <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto mb-6">
            Join Mockeefy, book an expert, and get the practice and feedback you need—without the pressure of the real thing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              to="/signup"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 shadow-sm transition-all"
            >
              Get started free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/signin"
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-4 bg-white border-2 border-slate-200 text-slate-700 font-semibold rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all"
            >
              Log in
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
