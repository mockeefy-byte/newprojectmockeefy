import { useState } from 'react';
import {
  Users,
  HelpCircle,
  BarChart3,
  MessageSquare,
  FileText,
  Megaphone,
  Settings,
  Clock,
  LogOut,
  Search,
  X,
} from 'lucide-react';

export type SidebarTab = 'people' | 'questions' | 'polls' | 'chats' | 'handouts' | 'broadcast' | 'settings';

interface MeetingSidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onEndCall: () => void;
  participants: string[];
  role: string;
  elapsedSeconds: number;
  /** Seconds until session end (from session endTime). When 0, meeting auto-ends. */
  sessionEndsInSeconds?: number | null;
  children?: React.ReactNode;
  /** On mobile: render as overlay drawer when true */
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const tabs: { id: SidebarTab; label: string; icon: typeof Users }[] = [
  { id: 'people', label: 'People', icon: Users },
  { id: 'questions', label: 'Questions', icon: HelpCircle },
  { id: 'polls', label: 'Polls', icon: BarChart3 },
  { id: 'chats', label: 'Chats', icon: MessageSquare },
  { id: 'handouts', label: 'Handouts', icon: FileText },
  { id: 'broadcast', label: 'Broadcast message', icon: Megaphone },
  { id: 'settings', label: 'Settings', icon: Settings },
];

function formatTimer(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function MeetingSidebar({
  activeTab,
  onTabChange,
  onEndCall,
  participants,
  role,
  elapsedSeconds,
  sessionEndsInSeconds = null,
  children,
  mobileOpen = false,
  onMobileClose,
}: MeetingSidebarProps) {
  const [peopleSubTab, setPeopleSubTab] = useState<'attendees' | 'trainers'>('attendees');
  const [searchQuery, setSearchQuery] = useState('');

  const sidebarContent = (
    <div className="flex h-full bg-[#25262a] border-r border-[#3c3e42] w-full max-w-[280px] md:max-w-none md:w-[280px] shrink-0 flex-col">
      {/* Mobile: close button */}
      {onMobileClose && (
        <div className="flex items-center justify-end p-2 border-b border-[#3c3e42] md:hidden">
          <button
            onClick={onMobileClose}
            className="p-2 rounded-lg hover:bg-[#2d2e32] text-gray-400 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}
      {/* Tab list */}
      <nav className="flex flex-col py-2">
        {tabs.map(({ id, label, icon: Icon }) => {
          const isActive = activeTab === id;
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={`flex items-center gap-3 px-4 py-3 text-left transition-colors ${
                isActive
                  ? 'bg-[#2d2e32] text-[#f97316] border-l-2 border-[#f97316]'
                  : 'text-gray-400 hover:bg-[#2d2e32] hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 shrink-0" />
              <span className="text-sm font-medium">{label}</span>
            </button>
          );
        })}
      </nav>

      {/* Content area for active tab */}
      <div className="flex-1 flex flex-col min-h-0 border-t border-[#3c3e42]">
        {activeTab === 'people' && (
          <>
            <div className="px-4 py-3 border-b border-[#3c3e42]">
              <h2 className="text-white font-semibold text-base mb-2">People</h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setPeopleSubTab('attendees')}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                    peopleSubTab === 'attendees'
                      ? 'text-[#f97316] border-b-2 border-[#f97316]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Attendees
                </button>
                <button
                  onClick={() => setPeopleSubTab('trainers')}
                  className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                    peopleSubTab === 'trainers'
                      ? 'text-[#f97316] border-b-2 border-[#f97316]'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Trainer(s)
                </button>
              </div>
              <div className="mt-3 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search with name or email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1c1d20] border border-[#3c3e42] rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#f97316]"
                />
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#2d2e32] flex items-center justify-center mb-3">
                <Users className="w-8 h-8 text-gray-500" />
              </div>
              <p className="text-gray-400 text-sm">
                No participants have joined this session yet.
              </p>
              {participants.length > 0 && (
                <div className="mt-4 space-y-2 w-full text-left">
                  {participants.map((name, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#2d2e32] text-white text-sm"
                    >
                      <div className="w-8 h-8 rounded-full bg-[#f97316]/20 flex items-center justify-center text-[#f97316] font-semibold text-xs">
                        {name.charAt(0)}
                      </div>
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
        {activeTab === 'questions' && (
          <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center text-center">
            <HelpCircle className="w-12 h-12 text-gray-500 mb-3" />
            <p className="text-gray-400 text-sm">Questions will appear here.</p>
          </div>
        )}
        {activeTab === 'polls' && (
          <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center text-center">
            <BarChart3 className="w-12 h-12 text-gray-500 mb-3" />
            <p className="text-gray-400 text-sm">Polls will appear here.</p>
          </div>
        )}
        {activeTab === 'chats' && (
          <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center text-center">
            <MessageSquare className="w-12 h-12 text-gray-500 mb-3" />
            <p className="text-gray-400 text-sm">In-call chat opens in the main view.</p>
          </div>
        )}
        {activeTab === 'handouts' && (
          <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center text-center">
            <FileText className="w-12 h-12 text-gray-500 mb-3" />
            <p className="text-gray-400 text-sm">No handouts in this session.</p>
          </div>
        )}
        {activeTab === 'broadcast' && (
          <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center text-center">
            <Megaphone className="w-12 h-12 text-gray-500 mb-3" />
            <p className="text-gray-400 text-sm">Broadcast messages will appear here.</p>
          </div>
        )}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-auto p-4 flex flex-col items-center justify-center text-center">
            <Settings className="w-12 h-12 text-gray-500 mb-3" />
            <p className="text-gray-400 text-sm">Meeting settings.</p>
          </div>
        )}
      </div>

      {/* Timer + End at bottom */}
      <div className="p-3 border-t border-[#3c3e42] space-y-2">
        <div className="flex flex-col items-center gap-1 text-gray-400 text-sm font-mono">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {formatTimer(elapsedSeconds)}
            <span className="text-xs text-gray-500">elapsed</span>
          </div>
          {sessionEndsInSeconds != null && (
            <div className={`text-xs ${sessionEndsInSeconds <= 60 ? 'text-amber-400' : 'text-gray-500'}`}>
              {sessionEndsInSeconds <= 0 ? "Time's up — ending..." : `Ends in ${formatTimer(sessionEndsInSeconds)}`}
            </div>
          )}
        </div>
        <button
          onClick={onEndCall}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 border border-red-500/30 transition-colors text-sm font-medium"
        >
          <LogOut className="w-4 h-4" />
          End
        </button>
      </div>

      {children}
    </div>
  );

  /* Mobile: overlay drawer. Desktop: inline (same div with responsive classes) */
  return (
    <>
      {/* Backdrop: mobile only, when drawer open */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onMobileClose}
        aria-hidden="true"
      />
      {/* Sidebar: fixed drawer on mobile, inline on md+ */}
      <div
        className={`flex flex-col h-full bg-[#25262a] border-r border-[#3c3e42] shrink-0
          fixed top-0 left-0 bottom-0 z-50 w-[280px] max-w-[85vw] shadow-xl transition-transform duration-300 ease-out
          md:relative md:z-auto md:translate-x-0 md:shadow-none md:w-[280px] md:max-w-none
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        {sidebarContent}
      </div>
    </>
  );
}
