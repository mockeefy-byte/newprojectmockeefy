import { useState } from "react";
import {
  User,
  Calendar,
  Briefcase,
  Award,
  Settings2,
  FileText,
  TrendingUp,
} from "lucide-react";
import axios from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import PersonalInfoSection from "../components/profile/PersonalInfoSection";
import EducationSection from "../components/profile/EducationSection";
import ExperienceSection from "../components/profile/ExperienceSection";
import CertificationsSection from "../components/profile/CertificationsSection";
import SkillsSection from "../components/profile/SkillsSection";
import PreferencesSection from "../components/profile/PreferencesSection";
import ResumePreview from "../components/profile/ResumePreview";
import { useQuery } from "@tanstack/react-query";
import { getProfileImageUrl } from "../lib/imageUtils";

export default function UserProfile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("personal");
  const [isResumeOpen, setIsResumeOpen] = useState(false);

  const { data: profileData, isLoading, refetch } = useQuery({
    queryKey: ["userProfile", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const response = await axios.get("/api/user/profile", {
        headers: { userid: user.id },
      });
      return response.data.success ? response.data.data : null;
    },
    enabled: !!user?.id,
  });

  const tabs = [
    { id: "personal", label: "Personal", icon: User },
    { id: "education", label: "Education", icon: Award },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "certifications", label: "Certificates", icon: Award },
    { id: "skills", label: "Skills", icon: Settings2 },
    { id: "preferences", label: "Preferences", icon: Calendar },
  ];

  const completion = profileData?.profileCompletion ?? 0;
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (completion / 100) * circumference;

  return (
    <>
      <div className="space-y-8 animate-in fade-in duration-500 pb-10">
        {/* Profile Readiness strip — same style as Sessions "Operational Intel" */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.04)] overflow-hidden">
          <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/10">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="w-4 h-4 text-elite-blue" />
              <h2 className="font-elite leading-none">Profile Readiness</h2>
            </div>
            <button
              onClick={() => setIsResumeOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#004fcb] text-white rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-blue-600 transition-all"
            >
              <FileText size={12} /> Resume
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-0 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            {/* Percentage — prominent */}
            <div className="p-5 hover:bg-blue-50/30 transition-colors group cursor-default flex items-center gap-4">
              <div className="relative w-12 h-12 shrink-0">
                <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 44 44">
                  <circle
                    cx="22"
                    cy="22"
                    r={radius}
                    fill="none"
                    stroke="#f1f5f9"
                    strokeWidth="3"
                  />
                  <circle
                    cx="22"
                    cy="22"
                    r={radius}
                    fill="none"
                    stroke="#004fcb"
                    strokeWidth="3"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-elite-black">
                  {completion}%
                </span>
              </div>
              <div>
                <p className="text-[9px] font-black text-slate-400 tracking-tight uppercase">
                  Completion
                </p>
                <p className="text-lg font-black text-elite-black tracking-tight mt-0.5">
                  {completion}% Ready
                </p>
              </div>
            </div>
            <div className="p-5 hover:bg-blue-50/30 transition-colors flex flex-col justify-center">
              <p className="text-[9px] font-black text-slate-400 tracking-tight uppercase">
                Status
              </p>
              <p className="text-[11px] font-bold text-slate-700 mt-0.5">
                {completion >= 80 ? "Strong profile" : completion >= 50 ? "In progress" : "Get started"}
              </p>
            </div>
          </div>
        </div>

        {/* Main content card — same as Sessions "My Simulations" card */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Settings2 className="w-4 h-4 text-elite-blue" />
              <h2 className="font-elite leading-none">Profile Settings</h2>
            </div>
            <p className="text-[10px] text-slate-500 font-medium">
              Manage your identity and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Vertical tab nav — same border/shadow as Sessions */}
            <div className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-slate-100 p-2 bg-slate-50/30">
              <nav className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible py-2 lg:py-4">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        shrink-0 lg:shrink flex items-center gap-2.5 px-3 py-2 rounded-xl text-[11px] font-bold transition-all
                        ${isActive ? "bg-elite-blue text-white shadow-lg shadow-blue-500/20" : "text-slate-500 hover:bg-slate-100 hover:text-elite-blue"}
                      `}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-slate-400"}`} />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Content area — same padding as Sessions table/content */}
            <div className="lg:col-span-9 p-5 lg:p-6 min-h-[400px]">
              {activeTab === "personal" && (
                <PersonalInfoSection profileData={profileData} onUpdate={refetch} />
              )}
              {activeTab === "education" && (
                <EducationSection profileData={profileData} onUpdate={refetch} />
              )}
              {activeTab === "experience" && (
                <ExperienceSection profileData={profileData} onUpdate={refetch} />
              )}
              {activeTab === "certifications" && (
                <CertificationsSection profileData={profileData} onUpdate={refetch} />
              )}
              {activeTab === "skills" && (
                <SkillsSection profileData={profileData} onUpdate={refetch} />
              )}
              {activeTab === "preferences" && (
                <PreferencesSection profileData={profileData} onUpdate={refetch} />
              )}
            </div>
          </div>
        </div>
      </div>

      <ResumePreview isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
    </>
  );
}
