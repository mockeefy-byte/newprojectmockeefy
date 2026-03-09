/**
 * Shared layout for Sign In and Sign Up.
 * Left: branding panel (blue) with faded image from assets. Right: form card.
 */
import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
/** Auth left-panel image: from public folder (client/public/images/) */
const AUTH_IMAGE = "/images/login_mockeefy.png?v=1";

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: "Sign in" | "Sign up" | "Complete profile" | "Forgot password";
}

export default function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row font-sans">
      {/* Left: Branding panel with faded mock-interview imagery (bluish) */}
      <div className="relative flex-shrink-0 w-full lg:w-[44%] min-h-[220px] lg:min-h-screen bg-[#004fcb] text-white overflow-hidden">
        {/* Image layer: from public so it loads on signin/signup */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-[#004fcb]"
          style={{ backgroundImage: `url(${AUTH_IMAGE})` }}
          aria-hidden
        />
        {/* Blue overlay so image looks faded and bluish */}
        <div className="absolute inset-0 bg-[#004fcb]/75" />
        <div className="absolute inset-0 bg-gradient-to-br from-[#004fcb]/85 via-[#004fcb]/80 to-blue-800/85" />
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
        <div className="relative z-10 flex flex-col justify-center px-8 py-12 lg:px-12 lg:py-16">
          <Link to="/" className="inline-flex items-center gap-2 w-fit mb-8 lg:mb-12">
            <img src="/mockeefy.png" alt="Mockeefy" className="h-10 w-auto object-contain" />
            <span className="text-2xl font-bold tracking-tight text-white">Mockeefy</span>
          </Link>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 w-fit mb-6">
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span className="text-sm font-semibold text-white">The process</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight leading-tight text-white">
            Your first interview
            <span className="block mt-1 text-blue-100">shouldn't be the real one</span>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-blue-100/90 max-w-md">
            Practice with verified HR & tech experts. Get detailed feedback. Land your dream role with confidence.
          </p>
        </div>
      </div>

      {/* Right: Form area */}
      <div className="flex-1 flex items-center justify-center bg-slate-50 px-4 py-8 lg:py-12">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center justify-center gap-2 mb-6">
            <img src="/mockeefy.png" alt="Mockeefy" className="h-9 w-auto" />
            <span className="text-xl font-bold text-[#004fcb]">Mockeefy</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
