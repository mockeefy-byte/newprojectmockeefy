import React from 'react';
import { Menu, Search, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import NotificationDropdown from './NotificationDropdown';

interface HeaderProps {
  setSidebarOpen: (open: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { logout, user } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b border-blue-100/50 sticky top-0 z-30">
      <div className="flex items-center justify-between px-4 py-4 lg:px-8">
        <div className="flex items-center">
          {/* Mobile menu button */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-blue-50 text-slate-600 hover:text-[#004fcb] lg:hidden transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Search bar */}
          <div className="ml-4 lg:ml-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search..."
                className="pl-10 pr-4 py-2 border border-blue-100 rounded-xl focus:ring-2 focus:ring-[#004fcb] focus:border-transparent w-64 hidden sm:block bg-slate-50/50 focus:bg-white transition-all text-sm"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">

          {/* Notifications */}
          <NotificationDropdown />

          {/* User menu */}
          <div className="flex items-center space-x-3">
            <div className="hidden md:block text-right">
              <p className="text-sm font-bold text-[#002a6b]">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
            </div>

            <button
              onClick={logout}
              className="p-2 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;