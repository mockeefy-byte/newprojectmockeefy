import { useRef, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import TopNav from "../components/TopNav";
import AdminSidebar from "../components/AdminSidebar";

export default function AdminPage() {
  const mainRef = useRef<HTMLElement>(null);
  const { pathname } = useLocation();

  const isFullHeightPage = pathname.startsWith('/admin/sessions');

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTo(0, 0);
    }
  }, [pathname]);

  return (
    <div className="flex bg-gray-50 h-screen overflow-hidden">
      {/* SIDEBAR - Fixed width, independent scroll handling inside component */}
      <AdminSidebar />

      {/* MAIN CONTENT - Takes remaining width */}
      <div className="flex-1 flex flex-col min-w-0 h-full">
        {/* TopNav stays at top */}
        <div className="flex-shrink-0">
          <TopNav />
        </div>

        {/* Scrollable Content Area */}
        {/* If full height page, we remove padding and overflow-y-auto to let child handle it */}
        <main
          ref={mainRef}
          className={`flex-1 ${isFullHeightPage ? 'overflow-hidden p-0' : 'overflow-y-auto p-8'} scroll-smooth`}
        >
          <div className={`${isFullHeightPage ? 'h-full' : 'max-w-7xl mx-auto pb-10'}`}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
