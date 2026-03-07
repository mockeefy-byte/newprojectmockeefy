import { useState, useEffect, useCallback } from "react";
import ExpertProfileHeader from "../../components/ExpertProfileHeader";
import PersonalInfo from "../../components/PersonalInfo";
import ExpertEducation from "../../components/ExpertEducation";
import ExpertProfession from "../../components/ExpertProfession";
import ExpertVerification from "../../components/ExpertVerification";
import axios from '../../lib/axios';
import { useAuth } from "../../context/AuthContext";
import { Skeleton } from "../../components/ui/skeleton";
import {
  User,
  BookOpen,
  Briefcase,
  ShieldCheck,
  LayoutDashboard,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

// Define the tabs with icons and identifiers
const TABS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "personal", label: "Personal Info", icon: User },
  { id: "education", label: "Education", icon: BookOpen },
  { id: "profession", label: "Experience", icon: Briefcase },
  { id: "verification", label: "Verification", icon: ShieldCheck },
];

export default function ProfilePage() {
  const { user } = useAuth();

  const [active, setActive] = useState<string>("overview");
  // showSidebar state removed as it is no longer needed for the new mobile layout
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  const [missingSections, setMissingSections] = useState<string[]>([]);

  // Derived state to check if a specific section is missing
  const isSectionMissing = (tabId: string) => {
    // Map tab IDs to backend section names
    const sectionMap: Record<string, string> = {
      personal: "Personal Information",
      education: "Education",
      profession: "Professional Details",
      verification: "Verification Documents"
    };

    const backendName = sectionMap[tabId];
    if (!backendName) return false; // Overview or unknown

    return missingSections.includes(backendName);
  };

  const fetchProfileData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const res = await axios.get("/api/expert/profile");
      if (res.data?.success) {
        const p = res.data.profile || {};
        const newStatus = p.status || "pending";
        setStatus(newStatus);
        setProfileData(p);
        setMissingSections(res.data.missingSections || []);
        localStorage.setItem('profile_status', newStatus);
      }
    } catch (err) {
      console.error("Failed to fetch profile", err);
      const cached = localStorage.getItem('profile_status');
      if (cached) setStatus(cached);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user, fetchProfileData]);

  // Handler to refresh data after updates in child components
  const handleUpdate = () => {
    fetchProfileData();
  };

  const renderContent = () => {
    // Pass onUpdate to all children so they can trigger a re-fetch of missing sections
    const commonProps = { onUpdate: handleUpdate, profileData };

    switch (active) {
      case "overview":
        return <ExpertProfileHeader onNavigate={(tab) => { setActive(tab); }} onRefresh={fetchProfileData} />;
      case "personal":
        return <PersonalInfo {...commonProps} isMissing={isSectionMissing('personal')} />;
      case "education":
        return <ExpertEducation {...commonProps} isMissing={isSectionMissing('education')} />;
      case "profession":
        return <ExpertProfession {...commonProps} isMissing={isSectionMissing('professional') || isSectionMissing('profession')} />;
      case "verification":
        return <ExpertVerification {...commonProps} isMissing={isSectionMissing('verification')} />;
      default:
        return <ExpertProfileHeader onNavigate={(tab) => { setActive(tab); }} onRefresh={fetchProfileData} />;
    }
  };

  if (loading && !profileData) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-3 space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div className="col-span-9 space-y-4">
            <Skeleton className="h-12 w-full rounded-md" />
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm h-full flex flex-col overflow-hidden">

        <div className="flex-1 flex min-h-0">
          {/* LEFT SIDEBAR - Fixed Width on Desktop, Hidden on Mobile */}
          <div className="hidden lg:flex w-64 border-r border-gray-200 bg-white flex-col shrink-0 overflow-y-auto transition-all">
            {/* <div className="p-6 border-b border-gray-100 bg-white text-center">
              <div className="w-24 h-24 mx-auto bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-3xl mb-3 shadow-inner">
                {user?.name?.[0]?.toUpperCase() || "E"}
              </div>
              <h2 className="font-bold text-gray-900 truncate px-2">{user?.name}</h2>
              <p className="text-sm text-gray-500 mb-3">{user?.email}</p>

              <div className={`px-3 py-1.5 text-xs font-semibold rounded-full border inline-flex items-center gap-1.5 ${getStatusColor(status)}`}>
                <span className={`relative flex h-2 w-2`}>
                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${status === 'Active' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                  <span className={`relative inline-flex rounded-full h-2 w-2 ${status === 'Active' ? 'bg-green-500' : 'bg-amber-500'}`}></span>
                </span>
                {getStatusLabel(status)}
              </div>
            </div> */}

            {/* Navigation Links */}
            <div className="p-4 space-y-1">
              {TABS.map((tab) => {
                const missing = isSectionMissing(tab.id);
                const isOverview = tab.id === 'overview';

                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActive(tab.id);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-all ${active === tab.id
                      ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-200"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                  >
                    <tab.icon className={`w-5 h-5 ${active === tab.id ? "text-blue-600" : "text-gray-400"}`} />
                    {tab.label}

                    {!isOverview && (
                      <div className="ml-auto">
                        {missing ? (
                          <AlertCircle className="w-4 h-4 text-amber-500" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>

            {/* Profile Completion Widget - Bottom of Sidebar */}
            {status !== 'Active' && (
              <div className="p-4 mt-auto border-t border-gray-100 bg-gray-50/50">
                <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-600">
                  <span>Profile Completion</span>
                  <span>{Math.round((5 - missingSections.length) / 5 * 100)}%</span>
                </div>
                <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden mb-3">
                  <div
                    className="h-full bg-blue-600 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round((5 - missingSections.length) / 5 * 100)}%` }}
                  />
                </div>
                {missingSections.length > 0 ? (
                  <p className="text-xs text-gray-500">
                    Complete <span className="font-medium text-gray-800">{missingSections[0]}</span> next to get verified.
                  </p>
                ) : (
                  <p className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Ready for verification!
                  </p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT CONTENT AREA - Flexible */}
          <div className="flex-1 overflow-y-auto bg-gray-50/30 flex flex-col">
            <div className="p-4 md:p-8 max-w-5xl mx-auto w-full">

              {/* Mobile Tab Navigation */}
              <div className="lg:hidden mb-6 overflow-x-auto no-scrollbar pb-2">
                <div className="flex items-center gap-2">
                  {TABS.map((tab) => {
                    const missing = isSectionMissing(tab.id);
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActive(tab.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold whitespace-nowrap transition-all border ${active === tab.id
                          ? 'bg-gray-900 text-white border-gray-900'
                          : 'bg-white text-gray-600 border-gray-200'
                          }`}
                      >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                        {tab.id !== 'overview' && (
                          missing ? <div className="w-2 h-2 rounded-full bg-amber-500" /> : <div className="w-2 h-2 rounded-full bg-green-500" />
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 min-h-[500px]">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
