import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Calendar, User, Award, Settings, LogOut, FileText } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export type NavItem = {
  id: string;
  label: string;
  to: string;
  icon?: ReactNode;
};

type SideNavProps = {
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  active?: string;
};

export default function SideNav({ isOpen = false, onClose, className = "" }: SideNavProps) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = () => {
    logout();
    navigate("/signin", { replace: true });
  };

  const items: NavItem[] = [
    { id: "dashboard", label: "Dashboard", to: "/dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "profile", label: "Profile", to: "/dashboard/profile", icon: <User size={20} /> },
    { id: "availability", label: "Availability", to: "/dashboard/availability", icon: <Calendar size={20} /> },
    { id: "expertise", label: "Skills & Experience", to: "/dashboard/skills", icon: <Award size={20} /> },
    { id: "sessions", label: "Sessions", to: "/dashboard/sessions", icon: <LayoutDashboard size={20} /> },
    { id: "reports", label: "Reports", to: "/dashboard/reports", icon: <FileText size={20} /> },
  ];

  const extras: NavItem[] = [
    { id: "settings", label: "Settings", to: "/dashboard/settings", icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 min-h-screen ${className}`}>
        <div className="h-[80px] flex items-center px-6 border-b border-blue-50/50 overflow-hidden">
          <div className="relative flex items-center w-full h-full gap-3">
            <div className="w-8 h-8 bg-[#004fcb] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-gray-900 font-['Outfit']">Mockeefy</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5">
          {items.map(item => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                  ? 'bg-[#004fcb] text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-600 hover:text-[#004fcb] hover:bg-blue-50/80'
                }`
              }
              itemProp="url"
              end={item.to === "/dashboard"}
            >
              {({ isActive }) => (
                <>
                  <span className={`transition-colors duration-200 ${isActive ? "text-white" : "text-gray-400 group-hover:text-[#004fcb]"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}

          <div className="pt-8 pb-3 px-3.5 text-xs font-bold text-gray-400 uppercase tracking-wider">
            System
          </div>

          {extras.map(item => (
            <NavLink
              key={item.id}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${isActive
                  ? 'bg-[#004fcb] text-white shadow-md shadow-blue-500/20'
                  : 'text-gray-600 hover:text-[#004fcb] hover:bg-blue-50/80'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={`transition-colors duration-200 ${isActive ? "text-white" : "text-gray-400 group-hover:text-[#004fcb]"}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-3.5 py-2.5 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors group">
            <LogOut size={20} className="group-hover:text-red-600 text-gray-400 transition-colors" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile slide-over */}
      <div className={`fixed inset-0 z-50 transition-opacity lg:hidden ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!isOpen}>
        <div
          className={`absolute inset-0 bg-gray-900/50 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={onClose}
        />

        <div className={`absolute inset-y-0 left-0 w-72 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 h-[80px]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-[#004fcb] rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/20">
                <span className="text-white font-bold text-lg">M</span>
              </div>
              <span className="text-xl font-bold tracking-tight text-gray-900 font-['Outfit']">Mockeefy</span>
            </div>
            <button type="button" onClick={onClose} className="p-2 -mr-2 text-gray-400 hover:text-gray-600 rounded-md">
              <span className="sr-only">Close menu</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <nav className="px-4 py-6 space-y-1.5">
            {items.map(item => (
              <NavLink
                key={item.id}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-3 rounded-lg text-sm font-medium transition-colors group ${isActive
                    ? 'bg-[#004fcb] text-white shadow-lg shadow-blue-500/20'
                    : 'text-gray-600 hover:text-[#004fcb] hover:bg-blue-50/80'
                  }`
                }
                itemProp="url"
              >
                {({ isActive }) => (
                  <>
                    <span className={`transition-colors duration-200 ${isActive ? "text-white" : "text-gray-400 group-hover:text-[#004fcb]"}`}>
                      {item.icon}
                    </span>
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            ))}

            <div className="mt-8 pt-8 border-t border-gray-100">
              <h6 className="px-3 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Settings</h6>
              {extras.map(item => (
                <NavLink
                  key={item.id}
                  to={item.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-colors ${isActive
                      ? 'bg-[#004fcb] text-white'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                    }`
                  }
                >
                  <span className="text-gray-400">{item.icon}</span>
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
            <button onClick={handleSignOut} className="flex items-center gap-3 w-full px-3 py-3 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut size={20} />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
