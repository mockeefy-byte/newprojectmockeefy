import { useState, useEffect } from "react";
import {
  User,
  Calendar,
  Video,
  Briefcase,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  Bookmark,
  Award
} from "lucide-react";
import axios from '../lib/axios';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getProfileImageUrl } from "../lib/imageUtils";
import { useUserProfile } from "../hooks/useUserProfile";
import { ProUpgradeCard } from "./ProUpgradeCard";

const Sidebar = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { data: userProfile, isLoading: isProfileLoading } = useUserProfile();
  const [nextSession, setNextSession] = useState<any>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      if (user?.id) {
        try {
          const sessionsRes = await axios.get(`/api/sessions/candidate/${user.id}`);
          if (Array.isArray(sessionsRes.data)) {
            const now = new Date();
            const upcoming = sessionsRes.data
              .filter((s: any) => new Date(s.startTime) > now && s.status !== 'Cancelled')
              .sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())[0];
            if (upcoming) setNextSession(upcoming);
          }
        } catch (error) {
          console.error("Error fetching sessions:", error);
        }
      }
    };
    fetchSessions();
  }, [user?.id]);

  const displayProfile = userProfile?.data || {
    name: user?.name || "User",
    profileImage: null,
    profileCompletion: 65,
  };

  const NavItem = ({ icon: Icon, label, path, active }: any) => (
    <button
      onClick={() => navigate(path)}
      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-[11px] font-black transition-all duration-300 group tracking-tight ${active
        ? "bg-elite-blue text-white shadow-lg shadow-blue-500/20"
        : "text-slate-500 hover:bg-blue-50/50 hover:text-elite-blue"
        }`}
    >
      <div className="flex items-center gap-3">
        <Icon size={14} className={`transition-colors ${active ? "text-white" : "text-slate-400 group-hover:text-elite-blue"}`} />
        {label}
      </div>
      {active && <ChevronRight size={10} strokeWidth={4} />}
    </button>
  );

  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - ((displayProfile.profileCompletion || 0) / 100) * circumference;

  if (!displayProfile && isProfileLoading) return <SkeletonSidebar />;

  return (
    <div className="w-full max-w-[240px] mx-auto space-y-4 font-sans">

      {/* CARD 1: IDENTITY */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="relative shrink-0">
            <div className="relative w-11 h-11 flex items-center justify-center">
              <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="2.5" />
                <circle
                  cx="22" cy="22" r={radius}
                  fill="none"
                  stroke="#004fcb"
                  strokeWidth="2.5"
                  strokeDasharray={circumference}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                />
              </svg>
              <img
                src={getProfileImageUrl(displayProfile.profileImage)}
                alt={displayProfile.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-white absolute bg-slate-50"
                onError={(e) => { e.currentTarget.src = getProfileImageUrl(null); }}
              />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-elite truncate tracking-tight">{displayProfile.name}</h3>
            <p className="text-[8px] font-black text-blue-600 tracking-widest mt-1 uppercase">Tier-1 Profile</p>
          </div>
        </div>
        <button
          onClick={() => navigate("/profile")}
          className="w-full py-1.5 bg-slate-50 hover:bg-elite-blue hover:text-white rounded-lg text-[9px] font-black tracking-tight transition-all border border-slate-100/50"
        >
          Manage Profile
        </button>
      </div>

      {/* CARD 2: NAVIGATION */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-2 shadow-sm space-y-1">
        <NavItem icon={User} label="Overview" path="/" active={location.pathname === "/" || location.pathname === "/dashboard"} />
        <NavItem icon={Calendar} label="Sessions" path="/my-sessions" active={location.pathname === "/my-sessions" && (!location.search || !location.search.includes('view='))} />
        <NavItem icon={Briefcase} label="Career Hub" path="/my-sessions?view=jobs" active={location.pathname === "/my-sessions" && location.search.includes('view=jobs')} />
        <NavItem icon={Bookmark} label="Saved Experts" path="/my-sessions?view=saved" active={location.pathname === "/my-sessions" && location.search.includes('view=saved')} />
        <NavItem icon={Award} label="Certificates" path="/my-sessions?view=certificates" active={location.pathname === "/my-sessions" && location.search.includes('view=certificates')} />
      </div>

      {/* CARD 3: UPGRADE */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-1 shadow-sm overflow-hidden">
        <ProUpgradeCard />
      </div>

      {/* CARD 4: UPCOMING (ONLY WHITE CARD - NO DARK BG) */}
      {nextSession && (
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm relative overflow-hidden group">
          <div className="flex items-center justify-between mb-3.5 relative z-10">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[9px] font-black uppercase text-emerald-600 tracking-widest">Confirmed</span>
            </div>
            <span className="text-[9px] font-black text-slate-400 tracking-tight">
              {new Date(nextSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-3 mb-4 relative z-10">
            <div className="w-9 h-9 rounded-xl border border-slate-100 p-0.5">
              <img
                src={getProfileImageUrl(nextSession.expertDetails?.profileImage)}
                className="w-full h-full rounded-lg object-cover"
                alt="Expert"
              />
            </div>
            <div className="min-w-0">
              <p className="font-elite text-[11px] truncate">{nextSession.expertDetails?.name}</p>
              <p className="text-[8px] font-black text-slate-400 tracking-tight mt-1 uppercase">Simulation</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/my-sessions')}
            className="w-full py-1.5 bg-elite-blue text-white rounded-lg text-[9px] font-black tracking-tight hover:bg-blue-600 transition-all shadow-sm flex items-center justify-center gap-2"
          >
            <Video size={10} strokeWidth={4} />
            Join Studio
          </button>
        </div>
      )}

      {/* CARD 5: STATS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-3 shadow-sm grid grid-cols-2 gap-2">
        <div className="bg-slate-50/50 p-2 rounded-lg flex flex-col items-center justify-center gap-0.5 group">
          <TrendingUp size={12} className="text-slate-300 group-hover:text-emerald-500" />
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">92% Skill</span>
        </div>
        <div className="bg-slate-50/50 p-2 rounded-lg flex flex-col items-center justify-center gap-0.5 group">
          <ShieldCheck size={12} className="text-slate-300 group-hover:text-amber-500" />
          <span className="text-[8px] font-black text-slate-500 uppercase tracking-tighter">TOP 5%</span>
        </div>
      </div>
    </div>
  );
};

export const SkeletonSidebar = () => (
  <div className="w-full space-y-4 animate-pulse">
    <div className="h-32 bg-white rounded-2xl border border-slate-100"></div>
    <div className="h-40 bg-white rounded-2xl border border-slate-100"></div>
  </div>
);

export default Sidebar;