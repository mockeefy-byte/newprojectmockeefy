import { useNavigate } from "react-router-dom";
import { Sparkles, Award, ChevronRight } from "lucide-react";
import { useCertification } from "../hooks/useCertification";
import { Button } from "./ui/button";

interface HomeHeroSectionProps {
  /** Show compact certificate progress (e.g. "2/3 interviews") */
  showCertProgress?: boolean;
}

export default function HomeHeroSection({ showCertProgress = true }: HomeHeroSectionProps) {
  const navigate = useNavigate();
  const { data: certData } = useCertification();

  const completed = certData?.completedSessions ?? 0;
  const target = certData?.targetSessions ?? 3;
  const isEligible = certData?.isEligibleForCertificate ?? false;
  const hasCert = (certData?.certifications?.length ?? 0) > 0;

  return (
    <section className="relative w-full overflow-hidden rounded-2xl bg-[#004fcb] text-white shadow-xl shadow-blue-900/20 mb-6 md:mb-8 [&_h1]:!text-white [&_h2]:!text-white [&_p]:!text-white [&_span]:!text-inherit">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-[0.06]" aria-hidden>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)`,
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative z-10 px-5 py-6 sm:px-6 sm:py-8 md:px-8 md:py-10">
        <div className="max-w-2xl">
          <p className="text-blue-100 text-xs font-semibold uppercase tracking-widest mb-2 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" />
            Mockeefy
          </p>
          <h1 className="!text-white text-2xl sm:text-3xl md:text-4xl font-bold leading-tight tracking-tight">
            Practice with verified experts. Land the role.
          </h1>
          <p className="mt-3 text-blue-100 text-sm sm:text-base max-w-lg">
            Book live mock interviews, get detailed feedback, and earn your certificate after 3 completed sessions.
          </p>

          {/* Certificate progress / CTA */}
          {showCertProgress && (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              {hasCert ? (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/15 border border-white/20">
                  <Award className="w-4 h-4 text-amber-300" />
                  <span className="text-sm font-medium">Certificate earned</span>
                </div>
              ) : isEligible ? (
                <Button
                  size="sm"
                  onClick={() => navigate("/certificates")}
                  className="bg-white text-[#004fcb] hover:bg-blue-50 font-semibold rounded-xl shadow-lg"
                >
                  Get your certificate
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 border border-white/20">
                  <span className="text-sm font-medium">
                    {completed}/{target} interviews
                  </span>
                  <span className="text-blue-200/80 text-xs">→ certificate</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
