import { useState } from "react";
import { User, Phone, MapPin, Calendar, Briefcase, Award, Settings2, FileText } from "lucide-react";
import axios from '../lib/axios';
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/DashboardLayout";
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
                headers: { userid: user.id }
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
        { id: "preferences", label: "Preferences", icon: Calendar }
    ];

    return (
        <DashboardLayout>
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header Information */}
                <div className="flex items-center justify-between px-1">
                    <div>
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">Profile Settings</h1>
                        <p className="text-xs text-gray-500">Manage your identity and preferences</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] uppercase font-black text-gray-400 tracking-wider leading-none">Status</p>
                            <p className="text-xs font-black text-blue-600 mt-0.5">{profileData?.profileCompletion || 0}% Ready</p>
                        </div>
                        <button
                            onClick={() => setIsResumeOpen(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-[10px] font-black uppercase tracking-tight hover:bg-blue-600 transistion-all"
                        >
                            <FileText size={12} /> Resume
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Vertical Tab Nav */}
                    <div className="lg:col-span-3 space-y-2">
                        <div className="bg-white rounded-xl border border-gray-200 p-2 shadow-sm">
                            <nav className="space-y-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    const isActive = activeTab === tab.id;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id)}
                                            className={`
                                                w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[11px] font-bold transition-all
                                                ${isActive
                                                    ? "bg-blue-50 text-blue-600"
                                                    : "text-gray-500 hover:bg-gray-50"
                                                }
                                            `}
                                        >
                                            <Icon className={`w-3.5 h-3.5 ${isActive ? "text-blue-600" : "text-gray-400"}`} />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-sm text-center">
                            <p className="text-[10px] font-bold text-gray-400 mb-2 uppercase tracking-widest">Public Link</p>
                            <button className="w-full py-1 text-[10px] font-bold border border-dashed border-gray-200 rounded text-gray-400 hover:text-blue-600 hover:border-blue-100 transition-all">
                                view.io/user/{user?.id?.slice(-5)}
                            </button>
                        </div>
                    </div>

                    {/* Main Settings Card */}
                    <div className="lg:col-span-9">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 min-h-[400px]">
                            {activeTab === "personal" && <PersonalInfoSection profileData={profileData} onUpdate={refetch} />}
                            {activeTab === "education" && <EducationSection profileData={profileData} onUpdate={refetch} />}
                            {activeTab === "experience" && <ExperienceSection profileData={profileData} onUpdate={refetch} />}
                            {activeTab === "certifications" && <CertificationsSection profileData={profileData} onUpdate={refetch} />}
                            {activeTab === "skills" && <SkillsSection profileData={profileData} onUpdate={refetch} />}
                            {activeTab === "preferences" && <PreferencesSection profileData={profileData} onUpdate={refetch} />}
                        </div>
                    </div>
                </div>
            </div>

            <ResumePreview isOpen={isResumeOpen} onClose={() => setIsResumeOpen(false)} />
        </DashboardLayout>
    );
}
