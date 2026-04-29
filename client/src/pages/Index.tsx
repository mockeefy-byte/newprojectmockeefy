import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
import CoachSessionCard from "../components/CoachSessionCard";
import MarketingLanding from "../components/MarketingLanding";
import Navigation from "../components/Navigation";
import Footer from "../components/Footer";

/**
 * "/" route:
 * - Not logged in: marketing landing (ads for Mockeefy). No "How it works", no experts.
 * - Logged in: app layout with experts only (categories + mentor cards).
 */
const Index = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <>
        <Navigation />
        <MarketingLanding />
        <Footer />
      </>
    );
  }

  return (
    <DashboardLayout>
      <CoachSessionCard />
    </DashboardLayout>
  );
};

export default Index;
