import { Toaster } from "./components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate } from "react-router-dom";
import NotFound from "./pages/NotFound";
import Login from "./components/Login";
import Register from "./components/Register";
import ForgotPassword from "./components/ForgotPassword";
import CompleteProfile from "./components/CompleteProfile";
import BookSessionPage from "./components/BookSessionPage";
import Index from "./pages/Index";
import { RoleBasedRoute } from "./routes/RoleBasedRoute";
import { GuestRoute } from "./routes/GuestRoute";
import { useAuth } from "./context/AuthContext";
import MySessions from "./components/MySessions";
import PaymentPage from "./components/PaymentPage";
import ExpertLayout from "./components/ExpertLayout";
import TermsConditions from "./pages/TermsConditions";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundCancellation from "./pages/RefundCancellation";
import ReturnPolicy from "./pages/ReturnPolicy";
import ShippingPolicy from "./pages/ShippingPolicy";
// import DashboardLayout from "./components/DashboardLayout"; // New Layout
import DashboardIndex from "./pages/expert/Index";
import ProfilePage from "./pages/expert/Profile";
import SessionsPage from "./pages/expert/Sessions";
import AvailabilityPage from "./pages/expert/Availability";
import SkillsPage from "./pages/expert/Skills";
import ExpertReports from "./pages/expert/Reports";
import SettingsPage from "./pages/expert/Settings";
import LiveMeeting from "./pages/LiveMeeting";
import ScrollToTop from "./ScrollToTop";
import UserProfile from "./pages/UserProfile";
import Notifications from "./pages/Notifications";
import WatchMock from "./pages/WatchMock";
import AiInterview from "./pages/AiInterview";
import BottomNav from "./components/BottomNav";
import JobReferral from "./pages/JobReferral";

import PendingExpertsTable from "./components/PendingExpertsTable";
import RejectedExpertsTable from "./components/RejectedExpertsTable";
import CategoriesPanel from "./components/CategoriesPanel";
import AdminDashboardIndex from "./components/AdminDashboardIndex";
import AdminPage from "./pages/AdminPage";
import SessionManagement from "./components/SessionManagement";
import VerifiedExpertsTable from "./components/VerifiedExpertsTable";
import UsersTable from "./components/UsersTable";
import PricingRules from "./pages/admin/PricingRules";
import PricingMatrix from "./pages/admin/PricingMatrix";
import CertificationRules from "./pages/admin/CertificationRules";
import HrContacts from "./pages/admin/HrContacts";

import Reports from "./pages/admin/Reports";
// Removed ExportMapping import

// import UserManagement from "./pages/admin/UserManagement";
import JobManagement from "./pages/admin/JobManagement";
import SkillManagement from "./pages/admin/SkillManagement";
import BookingSearch from "./pages/admin/BookingSearch"; // Demo route


const queryClient = new QueryClient();

// Initial Auth Check Loader
function AppRoutes() {
  const { user, isLoading } = useAuth();

  // GLOBAL AUTH LOADER: Prevents any route rendering until auth check completes.
  // This solves the flicker issue completely.
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* NEW DEMO ROUTE */}
        <Route path="/demo/booking" element={<BookingSearch />} />

        {/* PUBLIC / GUEST ROUTES */}
        {/* Root: If logged in -> Dashboard. Else -> Landing Page */}
        <Route path="/" element={
          user ? (
            user.userType === "expert" ? <Navigate to="/dashboard" replace /> :
              user.userType === "admin" ? <Navigate to="/admin" replace /> :
                <Index /> /* Fallback for unknown role, or show landing? Usually redirect */
          ) : (
            <Index />
          )
        } />

        <Route path="/signin" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/signup" element={<GuestRoute><Register /></GuestRoute>} />
        <Route path="/forgot-password" element={<GuestRoute><ForgotPassword /></GuestRoute>} />
        <Route path="/complete-profile" element={<CompleteProfile />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/refund-cancellation" element={<RefundCancellation />} />
        <Route path="/return-policy" element={<ReturnPolicy />} />
        <Route path="/shipping-policy" element={<ShippingPolicy />} />


        {/* SHARED PROTECTED ROUTES (Allowed for Expert and Candidate) */}
        {/* We use RoleBasedRoute here to enforce login and role access. */}
        {/* Adjust allowedRoles as needed. 'expert' is definitely one. If 'candidate' exists, add it. */}
        <Route element={<RoleBasedRoute allowedRoles={['expert', 'candidate', 'user']} />}>
          <Route path="/watch-mock" element={<WatchMock />} />
          <Route path="/ai-video" element={<AiInterview />} />
          <Route path="/book-session" element={<BookSessionPage />} />
          <Route path="/payment" element={<PaymentPage />} />
          <Route path="/my-sessions" element={<MySessions />} />
          <Route path="/live-meeting" element={<LiveMeeting />} />
          <Route path="/profile" element={<UserProfile />} />
          <Route path="/notifications" element={<Notifications />} />
        </Route>


        {/* ---------------- EXPERT DASHBOARD ---------------- */}
        <Route path="/dashboard/*" element={<RoleBasedRoute allowedRoles={['expert']} />}>
          <Route element={<ExpertLayout />}>
            <Route index element={<DashboardIndex />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="sessions" element={<SessionsPage />} />
            <Route path="availability" element={<AvailabilityPage />} />
            <Route path="skills" element={<SkillsPage />} />
            <Route path="reports" element={<ExpertReports />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* ---------------- ADMIN DASHBOARD ---------------- */}
        <Route path="/admin/*" element={<RoleBasedRoute allowedRoles={['admin']} />}>
          <Route element={<AdminPage />}>
            <Route index element={<AdminDashboardIndex />} />
            <Route path="sessions" element={<SessionManagement />} />
            <Route path="experts/pending" element={<PendingExpertsTable />} />
            <Route path="experts/verified" element={<VerifiedExpertsTable />} />
            <Route path="experts/rejected" element={<RejectedExpertsTable />} />
            <Route path="users" element={<UsersTable />} />

            <Route path="jobs" element={<JobManagement />} />
            <Route path="categories" element={<CategoriesPanel />} />
            <Route path="reports" element={<Reports />} />
            <Route path="certifications" element={<CertificationRules />} />
            <Route path="pricing" element={<PricingRules />} />
            <Route path="hr-contacts" element={<HrContacts />} />

            <Route path="skills" element={<SkillManagement />} />
          </Route>


        </Route>




        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Toaster richColors position="top-right" />
        <AppRoutes />
        <BottomNav />
      </QueryClientProvider>
    </>
  );
}