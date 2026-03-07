
import { useState, useEffect, useRef } from "react";
import { Outlet, useLocation } from "react-router-dom";
import SideNav from "./SideNav";
import TopNav from "./TopNav";

export default function ExpertLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      <SideNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0">
        <TopNav onOpenSidebar={() => setSidebarOpen(true)} />
        <main ref={mainRef} className="flex-1 p-4 lg:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
