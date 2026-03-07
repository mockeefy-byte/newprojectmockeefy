import React from 'react';
import Navigation from "./Navigation";
import Sidebar, { SkeletonSidebar } from "./Sidebar";
import InfoPanel, { SkeletonInfoPanel } from "./InfoPanel";
import Footer from "./Footer";
import { useAuth } from "../context/AuthContext";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { isLoading, user } = useAuth();
    const showSkeletons = isLoading;
    const isLoggedIn = !!user?.id;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col font-sans text-gray-900">
            {/* Top Navigation - Sticky */}
            <div className="sticky top-0 z-50">
                <Navigation />
            </div>

            {/* Unified Container */}
            <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all duration-300">
                <div className="flex flex-col lg:flex-row gap-5 items-start">

                    {/* Left Sidebar - High Density */}
                    {(isLoggedIn || showSkeletons) && (
                        <aside className="hidden lg:block w-[240px] shrink-0 space-y-4 sticky top-16 self-start">
                            {showSkeletons ? <SkeletonSidebar /> : <Sidebar />}
                        </aside>
                    )}

                    {/* Main Content Area */}
                    <section className="flex-1 min-w-0 w-full animate-in fade-in duration-500">
                        {children}
                    </section>

                    {/* Right Sidebar - High Density */}
                    {(isLoggedIn || showSkeletons) && (
                        <aside className="hidden xl:block w-[280px] shrink-0 space-y-4 sticky top-16 self-start">
                            {showSkeletons ? <SkeletonInfoPanel /> : <InfoPanel />}
                        </aside>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default DashboardLayout;
