import { useState } from "react";
import {
  User,
  Briefcase,
  FileText,
  AlertTriangle,
  TrendingUp,
  Zap,
  Target,
  BookOpen,
  Trophy
} from "lucide-react";
import axios from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import PersonalInfoSection from "../components/profile/PersonalInfoSection";
import EducationSection from "../components/profile/EducationSection";
import ExperienceSection from "../components/profile/ExperienceSection";
import CertificationsSection from "../components/profile/CertificationsSection";
import SkillsSection from "../components/profile/SkillsSection";
import PreferencesSection from "../components/profile/PreferencesSection";
import { useQuery } from "@tanstack/react-query";
import ResumePreview from "../components/profile/ResumePreview";

export default function UserProfile() {
  const { user } = useAuth();
  const userId = user?.id || user?._id || user?.userId;
  const [activeTab, setActiveTab] = useState("personal");
  const [showResumeBuilder, setShowResumeBuilder] = useState(false);

  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ["userProfile", userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await axios.get("/api/user/profile", {
        headers: { userid: userId },
      });
      return response.data.success ? response.data.data : null;
    },
    enabled: !!userId,
  });

  const tabs = [
    { id: "personal", label: "Personal", icon: User, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
    { id: "education", label: "Education", icon: BookOpen, color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" },
    { id: "experience", label: "Experience", icon: Briefcase, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
    { id: "certifications", label: "Certificates", icon: Trophy, color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
    { id: "skills", label: "Skills", icon: Zap, color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" },
    { id: "preferences", label: "Preferences", icon: Target, color: "text-pink-600", bgColor: "bg-pink-50", borderColor: "border-pink-200" },
  ];

  const completion = profileData?.profileCompletion ?? 0;
  const warnings: string[] = profileData?.profileWarnings || [];
  const completionLabel = isLoading ? "..." : `${completion}%`;

  const skillsObj = profileData?.skills || {};
  const skillsCount = (skillsObj.technical?.length || 0) + (skillsObj.soft?.length || 0) + (skillsObj.languages?.length || 0);
  const isPersonalComplete = !!(profileData?.personalInfo?.phone || profileData?.personalInfo?.city || profileData?.name);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-10 bg-[#FAFAFA] min-h-[calc(100vh-80px)] font-sans">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="p-6 md:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-3">
                <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                  {profileData?.name || profileData?.personalInfo?.fullName || user?.name || 'Your Profile'}
                </h1>
                <p className="text-sm text-slate-500 max-w-2xl">
                  View your profile completion and manage your personal details from one place.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-slate-400">Completion</p>
                    <p className="text-3xl font-black text-slate-900 leading-none">{completionLabel}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-white border border-slate-200 grid place-items-center">
                    <span className="text-sm font-black text-elite-blue">%</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowResumeBuilder(true)}
                  className="flex items-center justify-center gap-2 px-6 py-3 h-[74px] bg-[#0F172A] text-white rounded-2xl font-bold hover:bg-[#1E293B] transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                  <FileText strokeWidth={2.5} className="w-5 h-5 text-blue-400" />
                  <span className="text-[14px]">Resume Templates</span>
                </button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Personal info</p>
                <p className="text-sm text-slate-600">{isPersonalComplete ? 'Complete' : 'Incomplete'}</p>
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Skills</p>
                <p className="text-sm text-slate-600">{skillsCount} items</p>
              </div>
              <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 text-center">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Experience</p>
                <p className="text-sm text-slate-600">{profileData?.experience?.length || 0} entries</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden mt-6">
          <div className="px-5 py-4 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-elite-blue" />
              <h2 className="font-elite leading-none text-slate-900">Profile Sections</h2>
            </div>
          </div>
          <div className="p-5">
            <div className="flex flex-wrap gap-2 overflow-x-auto custom-scrollbar no-scrollbar relative z-10 w-full">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 px-4 py-3 text-[14px] font-bold transition-all outline-none rounded-2xl whitespace-nowrap border border-slate-200
                      ${isActive 
                         ? "bg-elite-blue text-white border-elite-blue" 
                         : "bg-white text-slate-600 hover:text-slate-900 hover:border-slate-300"}
                    `}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-0">
        
        {/* WARNINGS */}
        {warnings.length > 0 && !isLoading && (
          <div className="mb-8 bg-amber-50 rounded-[20px] p-4 sm:p-5 border border-amber-200/50 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-xl shrink-0 mt-0.5">
               <AlertTriangle className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-[14px] font-bold text-amber-900 mb-2">Improve your profile visibility:</h3>
              <div className="flex flex-wrap gap-2">
                {warnings.map((warning, index) => (
                  <span key={index} className="text-[12px] font-bold text-amber-800 bg-white px-3 py-1.5 rounded-lg border border-amber-200 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
                    {warning}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* CENTRIC CONTENT CANVAS */}
        <div className="w-full">
           {isLoading ? (
             <div className="w-full flex flex-col items-center justify-center text-slate-400 gap-4 min-h-[400px]">
               <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
             </div>
           ) : (
             <div className="w-full border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.02)] bg-white rounded-[32px] p-4 md:p-6 relative overflow-hidden min-h-[360px] md:min-h-[500px]">


               {activeTab === "personal" && <PersonalInfoSection profileData={profileData} onUpdate={refetch} />}
               {activeTab === "education" && <EducationSection profileData={profileData} onUpdate={refetch} />}
               {activeTab === "experience" && <ExperienceSection profileData={profileData} onUpdate={refetch} />}
               {activeTab === "certifications" && <CertificationsSection profileData={profileData} onUpdate={refetch} />}
               {activeTab === "skills" && <SkillsSection profileData={profileData} onUpdate={refetch} />}
               {activeTab === "preferences" && <PreferencesSection profileData={profileData} onUpdate={refetch} />}
             </div>
           )}
        </div>

      </div>

      <ResumePreview isOpen={showResumeBuilder} onClose={() => setShowResumeBuilder(false)} />
    </div>
  );
}
