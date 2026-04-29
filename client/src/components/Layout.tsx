import type { ReactNode } from "react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import SideNav from "./SideNav";
import TopNav from "./TopNav";

export default function ExpertLayout({ active = "dashboard", children }: { active?: string; children?: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <div className="flex">
        <SideNav isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <div className="flex-1 min-h-screen">
          <TopNav onOpenSidebar={() => setSidebarOpen(true)} />
          <main className="p-6">
            {/* Nested routes render here */}
            {children || <Outlet />}
          </main>
        </div>
      </div>
    </div>
  );
}
