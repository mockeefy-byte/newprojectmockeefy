import {
  LandingHeroSection,
  WhyMockeefySection,
  LandingPricingSection,
  BookExpertsCtaSection,
  MockInterviewCardsSection,
  TrustStripSection,
  FinalCtaSection,
} from "@/components/landing";

/**
 * Marketing landing for guests: each section in its own file, composed here. Brand #004fcb.
 */
export default function MarketingLanding() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <LandingHeroSection />
      <WhyMockeefySection />
      <LandingPricingSection />
      <BookExpertsCtaSection />
      <MockInterviewCardsSection />
      <TrustStripSection />
      <FinalCtaSection />
    </div>
  );
}
