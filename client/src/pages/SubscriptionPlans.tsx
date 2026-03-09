import { Link } from "react-router-dom";
import { Check, Crown, Zap, Sparkles, Award, MessageSquare, Star } from "lucide-react";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";
import { Button } from "../components/ui/button";

const PLANS = [
  {
    id: "free",
    name: "Free",
    tagline: "Get started",
    price: "₹0",
    period: "forever",
    icon: Zap,
    features: [
      "3 AI mock interviews per month",
      "Basic feedback & scorecards",
      "Browse expert profiles",
      "Email support",
    ],
    cta: "Current plan",
    ctaLink: "/",
    highlighted: false,
  },
  {
    id: "pro-monthly",
    name: "Pro",
    tagline: "Most popular",
    price: "₹499",
    period: "/ month",
    icon: Crown,
    features: [
      "Unlimited AI mock interviews",
      "1 live expert session per month",
      "Priority feedback & detailed scorecards",
      "Certificate after 3 completed sessions",
      "Job referral pipeline access",
      "Priority support",
    ],
    cta: "Upgrade to Pro",
    ctaLink: "/payment?plan=pro-monthly",
    highlighted: true,
  },
  {
    id: "pro-annual",
    name: "Pro Annual",
    tagline: "Best value",
    price: "₹4,499",
    period: "/ year",
    savings: "Save 25%",
    icon: Sparkles,
    features: [
      "Everything in Pro",
      "12 live expert sessions per year",
      "Unlimited AI mocks",
      "Certificate & referral pipeline",
      "Dedicated support",
    ],
    cta: "Get annual plan",
    ctaLink: "/payment?plan=pro-annual",
    highlighted: false,
  },
];

export default function SubscriptionPlans() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="sticky top-0 z-50">
        <Navigation />
      </div>

      <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14">
        {/* Header */}
        <div className="text-center mb-10 md:mb-14">
          <p className="text-[#004fcb] text-sm font-semibold uppercase tracking-widest mb-2">
            Pricing
          </p>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 tracking-tight">
            Simple, transparent plans
          </h1>
          <p className="mt-3 text-gray-600 text-base sm:text-lg max-w-2xl mx-auto">
            Start free. Upgrade when you’re ready for unlimited mocks and expert sessions.
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <div
                key={plan.id}
                className={`relative rounded-2xl border-2 bg-white p-6 sm:p-8 flex flex-col transition-all duration-300 ${
                  plan.highlighted
                    ? "border-[#004fcb] shadow-xl shadow-blue-900/10 scale-[1.02] md:scale-105 z-10"
                    : "border-slate-200 hover:border-slate-300 hover:shadow-lg"
                }`}
              >
                {plan.tagline && (
                  <span
                    className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      plan.highlighted
                        ? "bg-[#004fcb] text-white"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {plan.tagline}
                  </span>
                )}
                {plan.savings && (
                  <span className="absolute top-4 right-4 px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 text-[10px] font-bold">
                    {plan.savings}
                  </span>
                )}

                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      plan.highlighted ? "bg-[#004fcb] text-white" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">{plan.name}</h2>
                </div>

                <div className="flex items-baseline gap-1 mt-2 mb-6">
                  <span className="text-3xl sm:text-4xl font-bold text-gray-900">{plan.price}</span>
                  <span className="text-slate-500 text-sm font-medium">{plan.period}</span>
                </div>

                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                      <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-emerald-600" strokeWidth={3} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button
                    asChild
                    className={`w-full py-6 rounded-xl text-sm font-semibold transition-all ${
                      plan.highlighted
                        ? "bg-[#004fcb] hover:bg-[#003bb5] text-white shadow-lg shadow-blue-900/20"
                        : "bg-[#004fcb] hover:bg-blue-600 text-white"
                    }`}
                  >
                    <Link to={plan.ctaLink}>{plan.cta}</Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Trust row */}
        <div className="mt-14 flex flex-wrap items-center justify-center gap-8 text-slate-500 text-sm">
          <span className="flex items-center gap-2">
            <Award className="w-4 h-4 text-[#004fcb]" />
            Certificate after 3 sessions
          </span>
          <span className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#004fcb]" />
            Cancel anytime
          </span>
          <span className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#004fcb]" />
            Verified experts
          </span>
        </div>
      </main>

      <Footer />
    </div>
  );
}
