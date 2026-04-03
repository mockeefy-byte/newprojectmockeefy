import { useState } from "react";
import {
  User,
  Calendar,
  Briefcase,
  Award,
  Settings2,
  FileText,
  AlertTriangle,
  TrendingUp,
  Star,
  CheckCircle,
  Zap,
  Target,
  BookOpen,
  Users,
  Trophy,
  Sparkles
} from "lucide-react";
import axios from "../lib/axios";
import { useAuth } from "../context/AuthContext";
import PersonalInfoSection from "../components/profile/PersonalInfoSection";
import EducationSection from "../components/profile/EducationSection";
import ExperienceSection from "../components/profile/ExperienceSection";
import CertificationsSection from "../components/profile/CertificationsSection";
import SkillsSection from "../components/profile/SkillsSection";
import PreferencesSection from "../components/profile/PreferencesSection";
import ResumeManagementSection from "../components/profile/ResumeManagementSection";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export default function UserProfile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const userId = user?.id || user?._id || user?.userId;
  const [activeTab, setActiveTab] = useState("overview");

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
    { id: "overview", label: "Overview", icon: TrendingUp, color: "text-purple-600", bgColor: "bg-purple-50", borderColor: "border-purple-200" },
    { id: "personal", label: "Personal", icon: User, color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200" },
    { id: "education", label: "Education", icon: BookOpen, color: "text-green-600", bgColor: "bg-green-50", borderColor: "border-green-200" },
    { id: "experience", label: "Experience", icon: Briefcase, color: "text-orange-600", bgColor: "bg-orange-50", borderColor: "border-orange-200" },
    { id: "certifications", label: "Certificates", icon: Trophy, color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" },
    { id: "skills", label: "Skills", icon: Zap, color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200" },
    { id: "resumes", label: "Resumes", icon: FileText, color: "text-indigo-600", bgColor: "bg-indigo-50", borderColor: "border-indigo-200" },
    { id: "preferences", label: "Preferences", icon: Target, color: "text-pink-600", bgColor: "bg-pink-50", borderColor: "border-pink-200" },
  ];

  const completion = profileData?.profileCompletion ?? 0;
  const warnings: string[] = profileData?.profileWarnings || [];
  const completionLabel = isLoading ? "..." : `${completion}%`;

  const getCompletionStatus = () => {
    if (completion >= 90) return { status: "Excellent", color: "text-emerald-600", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", icon: Star };
    if (completion >= 75) return { status: "Great", color: "text-blue-600", bgColor: "bg-blue-50", borderColor: "border-blue-200", icon: CheckCircle };
    if (completion >= 50) return { status: "Good", color: "text-yellow-600", bgColor: "bg-yellow-50", borderColor: "border-yellow-200", icon: TrendingUp };
    return { status: "Needs Work", color: "text-red-600", bgColor: "bg-red-50", borderColor: "border-red-200", icon: AlertTriangle };
  };

  const completionStatus = getCompletionStatus();
  const StatusIcon = completionStatus.icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* MODERN HERO SECTION */}
        <div className="relative overflow-hidden bg-white rounded-3xl shadow-xl border border-slate-200/60 mb-8">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 via-purple-600/5 to-indigo-600/5"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -translate-y-48 translate-x-48"></div>

          <div className="relative p-8 lg:p-12">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12">

              {/* PROFILE AVATAR & INFO */}
              <div className="flex flex-col sm:flex-row items-center lg:items-start gap-6 flex-shrink-0">
                <div className="relative">
                  <div className="w-24 h-24 lg:w-32 lg:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <User className="w-12 h-12 lg:w-16 lg:h-16 text-white" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div className="text-center lg:text-left">
                  <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 mb-2">
                    Welcome back, {profileData?.personalInfo?.fullName || user?.name || 'User'}!
                  </h1>
                  <p className="text-slate-600 text-lg mb-4">Let's build something amazing together</p>

                  {/* STATUS BADGE */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${completionStatus.bgColor} ${completionStatus.borderColor} border`}>
                    <StatusIcon className={`w-4 h-4 ${completionStatus.color}`} />
                    <span className={`text-sm font-semibold ${completionStatus.color}`}>
                      {completionStatus.status} Profile
                    </span>
                  </div>
                </div>
              </div>

              {/* COMPLETION METRICS */}
              <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-6">

                {/* PROGRESS CIRCLE */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm">
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-4">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="45" fill="none" stroke="#e2e8f0" strokeWidth="8" />
                        <circle
                          cx="50" cy="50" r="45" fill="none" stroke="url(#progress-gradient)" strokeWidth="8"
                          strokeDasharray={283} strokeDashoffset={isLoading ? 283 : 283 - (completion / 100) * 283}
                          strokeLinecap="round" className="transition-all duration-1000 ease-out"
                        />
                        <defs>
                          <linearGradient id="progress-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" />
                            <stop offset="100%" stopColor="#8b5cf6" />
                          </linearGradient>
                        </defs>
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold text-slate-800">{completionLabel.replace('%', '')}</span>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">%</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-900 mb-1">Profile Completion</h3>
                    <p className="text-xs text-slate-600">Keep going!</p>
                  </div>
                </div>

                {/* QUICK STATS */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">Experience</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800 mb-1">
                    {profileData?.experience?.length || 0}
                  </p>
                  <p className="text-xs text-slate-600">Positions added</p>
                </div>

                <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-900">Skills</span>
                  </div>
                  <p className="text-2xl font-bold text-slate-800 mb-1">
                    {profileData?.skills?.length || 0}
                  </p>
                  <p className="text-xs text-slate-600">Skills listed</p>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 lg:flex-col xl:flex-row">
                <button
                  onClick={() => navigate('/resume-builder')}
                  className="group relative flex items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  <span>Build Resume</span>
                </button>

                <button
                  onClick={() => setActiveTab('overview')}
                  className="flex items-center justify-center gap-3 px-6 py-3 bg-white/80 backdrop-blur-sm text-slate-700 rounded-xl font-semibold border border-slate-200 hover:bg-white hover:shadow-md transition-all duration-300"
                >
                  <TrendingUp className="w-5 h-5" />
                  <span>View Overview</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* WARNINGS SECTION */}
        {warnings.length > 0 && !isLoading && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 rounded-2xl p-6 border border-amber-200/50 shadow-sm mb-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex gap-4 items-start">
              <div className="p-3 bg-amber-100 text-amber-600 rounded-xl shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-amber-900 mb-3">Complete Your Profile</h3>
                <p className="text-amber-800 mb-4">Add these details to boost your profile score and get better opportunities:</p>
                <div className="flex flex-wrap gap-2">
                  {warnings.map((warning, index) => (
                    <span key={index} className="text-sm font-semibold text-amber-800 bg-white/80 px-4 py-2 rounded-lg border border-amber-200 shadow-sm">
                      {warning}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MODERN NAVIGATION & CONTENT */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

          {/* ENHANCED SIDEBAR NAVIGATION */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 sticky top-8 overflow-hidden">
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Settings2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900">Profile Settings</h3>
                    <p className="text-xs text-slate-500 uppercase tracking-wider">Navigation</p>
                  </div>
                </div>
              </div>

              <nav className="p-4 space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        w-full group flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all duration-300
                        ${isActive
                          ? `${tab.bgColor} ${tab.borderColor} border ${tab.color} shadow-sm`
                          : 'text-slate-600 hover:bg-slate-50 border border-transparent hover:border-slate-200'
                        }
                      `}
                    >
                      <div className={`p-2 rounded-lg transition-all duration-300 ${
                        isActive
                          ? `bg-white shadow-sm ${tab.color}`
                          : 'bg-slate-100 text-slate-400 group-hover:bg-white group-hover:text-slate-600'
                      }`}>
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <span className={`text-sm font-semibold ${isActive ? tab.color : 'text-slate-700'}`}>
                          {tab.label}
                        </span>
                        {isActive && (
                          <div className="w-full h-0.5 bg-current rounded-full mt-1 opacity-60"></div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* MAIN CONTENT AREA */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60 min-h-[600px] overflow-hidden">
              {isLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center p-12">
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Loading Your Profile</h3>
                  <p className="text-slate-600 text-center max-w-md">
                    We're gathering all your information to show you the best possible experience...
                  </p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 p-8 lg:p-10">
                  {activeTab === "overview" && (
                    <div className="space-y-8">
                      <div className="text-center lg:text-left">
                        <h2 className="text-3xl font-bold text-slate-900 mb-3">Profile Overview</h2>
                        <p className="text-lg text-slate-600">Here's a quick summary of your professional profile</p>
                      </div>

                      {/* QUICK ACTIONS GRID */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200/50 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                          <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <FileText className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-2">Resume Builder</h3>
                          <p className="text-slate-600 mb-4">Create professional resumes with multiple templates</p>
                          <button
                            onClick={() => navigate('/resume-builder')}
                            className="text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                          >
                            Get Started →
                          </button>
                        </div>

                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200/50 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                          <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-2">Find Sessions</h3>
                          <p className="text-slate-600 mb-4">Book mock interviews with industry experts</p>
                          <button className="text-green-600 font-semibold hover:text-green-700 transition-colors">
                            Explore →
                          </button>
                        </div>

                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200/50 hover:shadow-lg transition-all duration-300 group cursor-pointer">
                          <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <Trophy className="w-6 h-6 text-white" />
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 mb-2">Achievements</h3>
                          <p className="text-slate-600 mb-4">Track your progress and unlock badges</p>
                          <button className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
                            View →
                          </button>
                        </div>
                      </div>

                      {/* PROFILE STATS */}
                      <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl p-8">
                        <h3 className="text-2xl font-bold text-slate-900 mb-6 text-center">Your Profile Stats</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-blue-600 mb-2">{profileData?.experience?.length || 0}</div>
                            <div className="text-sm text-slate-600 uppercase tracking-wider">Experiences</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-green-600 mb-2">{profileData?.education?.length || 0}</div>
                            <div className="text-sm text-slate-600 uppercase tracking-wider">Education</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-purple-600 mb-2">{profileData?.skills?.length || 0}</div>
                            <div className="text-sm text-slate-600 uppercase tracking-wider">Skills</div>
                          </div>
                          <div className="text-center">
                            <div className="text-3xl font-bold text-orange-600 mb-2">{profileData?.certifications?.length || 0}</div>
                            <div className="text-sm text-slate-600 uppercase tracking-wider">Certificates</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "personal" && <PersonalInfoSection profileData={profileData} onUpdate={refetch} />}
                  {activeTab === "education" && <EducationSection profileData={profileData} onUpdate={refetch} />}
                  {activeTab === "experience" && <ExperienceSection profileData={profileData} onUpdate={refetch} />}
                  {activeTab === "certifications" && <CertificationsSection profileData={profileData} onUpdate={refetch} />}
                  {activeTab === "skills" && <SkillsSection profileData={profileData} onUpdate={refetch} />}
                  {activeTab === "resumes" && <ResumeManagementSection profileData={profileData} onUpdate={refetch} />}
                  {activeTab === "preferences" && <PreferencesSection profileData={profileData} onUpdate={refetch} />}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
