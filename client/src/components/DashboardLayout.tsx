import React from 'react';
import { useLocation } from "react-router-dom";
import Navigation from "./Navigation";
import Sidebar, { SkeletonSidebar } from "./Sidebar";
import InfoPanel, { SkeletonInfoPanel } from "./InfoPanel";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

/** Left sidebar (quick nav) on main user pages. */
const SHOW_LEFT_SIDEBAR_PATHS = [
    "/",
    "/my-sessions",
    "/book-session",
    "/tips",
    "/career-hub",
    "/saved-experts",
    "/certificates",
];

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { pathname } = useLocation();
    const { isLoading, user } = useAuth();
    const showSkeletons = isLoading;
    const isLoggedIn = !!user?.id;
    const showLeftSidebar = (isLoggedIn || showSkeletons) && SHOW_LEFT_SIDEBAR_PATHS.includes(pathname);

    return (
        <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
            {/* Top Navigation - Sticky */}
            <div className="sticky top-0 z-50">
                <Navigation />
            </div>

            {/* Unified Container: Left Sidebar (only on Overview) | Main | Right Sidebar */}
            <main className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-4 lg:px-5 pt-2 sm:pt-3 pb-4 sm:pb-6 transition-all duration-300">
                <div className="flex flex-col lg:flex-row gap-4 lg:gap-5 items-stretch w-full">

                    {/* Left Sidebar - only on Overview (/) ; on Sessions/Profile only main content (experts etc.) shows */}
                    {showLeftSidebar && (
                        <aside className="hidden lg:block w-[240px] shrink-0 sticky top-16 self-start">
                            <div className="space-y-4">
                                {showSkeletons ? <SkeletonSidebar /> : <Sidebar />}
                            </div>
                        </aside>
                    )}

                    {/* Main Content Area - expands when left sidebar is hidden */}
                    <section className="flex-1 min-w-0 w-full max-w-full overflow-hidden animate-in fade-in duration-500">
                        {children}
                    </section>

                    {/* Right Sidebar - show on laptop and above */}
                    {(isLoggedIn || showSkeletons) && (
                        <aside className="hidden lg:block w-[280px] shrink-0 sticky top-16 self-start">
                            <div className="space-y-4">
                                {showSkeletons ? <SkeletonInfoPanel /> : <InfoPanel />}
                            </div>
                        </aside>
                    )}
                </div>
                {/* Book experts & pipeline below main only on mobile/tablet */}
                {(isLoggedIn || showSkeletons) && (
                    <div className="lg:hidden w-full mt-6">
                        {showSkeletons ? <SkeletonInfoPanel /> : <InfoPanel fullWidth />}
                    </div>
                )}
            </main>

            <Footer />
        </div>
    );
};

export default DashboardLayout;
