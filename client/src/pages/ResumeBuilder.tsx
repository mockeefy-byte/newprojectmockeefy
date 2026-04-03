import { useState, useEffect } from 'react';
import { useResume } from '../context/ResumeContext';
import { PersonalDetailsForm } from '../components/ResumeBuilder/PersonalDetailsForm';
import { ObjectiveForm } from '../components/ResumeBuilder/ObjectiveForm';
import { SkillsForm } from '../components/ResumeBuilder/SkillsForm';
import { EducationForm } from '../components/ResumeBuilder/EducationForm';
import { ExperienceForm } from '../components/ResumeBuilder/ExperienceForm';
import { ProjectsForm } from '../components/ResumeBuilder/ProjectsForm';
import { CertificationsAndAchievementsForm } from '../components/ResumeBuilder/CertificationsAndAchievementsForm';
import { TemplateSelector } from '../components/ResumeBuilder/TemplateSelector';
import { DownloadAndExportStep } from '../components/ResumeBuilder/DownloadAndExportStep';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, Check, Loader2, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import axios from '../lib/axios';

const steps = [
  { id: 0, title: 'Personal Details', description: 'Basic information', icon: '👤' },
  { id: 1, title: 'Objective', description: 'Professional summary', icon: '🎯' },
  { id: 2, title: 'Skills', description: 'Your expertise', icon: '⚡' },
  { id: 3, title: 'Education', description: 'Academic background', icon: '🎓' },
  { id: 4, title: 'Experience', description: 'Work history', icon: '💼' },
  { id: 5, title: 'Projects', description: 'Notable work', icon: '🚀' },
  { id: 6, title: 'Additional Info', description: 'Certifications & achievements', icon: '🏆' },
  { id: 7, title: 'Template', description: 'Choose design', icon: '🎨' },
  { id: 8, title: 'Download', description: 'Save & export', icon: '📄' },
];

export function ResumeBuilderPage() {
  const { user } = useAuth();
  const { currentStep, setCurrentStep, resumeData, loadResumeData, nextStep, prevStep } = useResume();
  const [showPreview, setShowPreview] = useState(window.innerWidth >= 1024);
  const [isLoadingResume, setIsLoadingResume] = useState(true);
  const [showQuickGenerate, setShowQuickGenerate] = useState(false);

  const handleQuickGenerate = () => {
    setCurrentStep(7); // Skip directly to template selection
  };

  const userId = user?.id || user?._id || user?.userId;

  // Fetch user's profile data
  const { data: profileData, isLoading: isLoadingProfile } = useQuery({
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

  // Check if profile data is complete and show quick generate option
  useEffect(() => {
    if (profileData && !isLoadingProfile && resumeData?.personalDetails?.fullName) {
      const hasBasicInfo = profileData.personalInfo?.fullName && profileData.personalInfo?.email;
      const hasSkills = Array.isArray(profileData.skills) ? profileData.skills.length > 0 :
                       typeof profileData.skills === 'string' ? profileData.skills.trim() !== '' : false;

      if (hasBasicInfo && hasSkills) {
        setShowQuickGenerate(true);
      }
    }
  }, [profileData, isLoadingProfile, resumeData]);

  // Load profile data into resume context
  useEffect(() => {
    if (profileData && !isLoadingProfile) {
      // Transform profile data to resume format
      const resumeDataFromProfile = {
        personalDetails: {
          fullName: profileData.personalInfo?.fullName || '',
          email: profileData.personalInfo?.email || '',
          phone: profileData.personalInfo?.phone || '',
          location: profileData.personalInfo?.location || '',
          linkedIn: profileData.personalInfo?.linkedIn || '',
          portfolio: profileData.personalInfo?.portfolio || '',
        },
        objective: profileData.objective ? { objective: profileData.objective } : undefined,
        skills: Array.isArray(profileData.skills)
          ? profileData.skills.map((skill: any, index: number) => ({
              id: `skill_${index}`,
              name: typeof skill === 'string' ? skill : skill.name || '',
              proficiency: skill.proficiency || 'intermediate',
            }))
          : (typeof profileData.skills === 'string'
              ? profileData.skills.split(',').map((skill: string, index: number) => ({
                  id: `skill_${index}`,
                  name: skill.trim(),
                  proficiency: 'intermediate',
                }))
              : []),
        education: Array.isArray(profileData.education)
          ? profileData.education.map((edu: any, index: number) => ({
              id: `edu_${index}`,
              degree: edu.degree || '',
              institute: edu.institute || '',
              fieldOfStudy: edu.fieldOfStudy || '',
              startYear: edu.startYear || '',
              endYear: edu.endYear || '',
              percentage: edu.percentage || '',
              cgpa: edu.cgpa || '',
              description: edu.description || '',
            }))
          : [],
        experience: Array.isArray(profileData.experience)
          ? profileData.experience.map((exp: any, index: number) => ({
              id: `exp_${index}`,
              companyName: exp.companyName || '',
              position: exp.position || '',
              startDate: exp.startDate || '',
              endDate: exp.endDate || '',
              currentlyWorking: exp.currentlyWorking || false,
              description: Array.isArray(exp.description) ? exp.description.map((desc: string) => desc) : [],
              location: exp.location || '',
            }))
          : [],
        projects: Array.isArray(profileData.projects)
          ? profileData.projects.map((proj: any, index: number) => ({
              id: `proj_${index}`,
              projectName: proj.projectName || '',
              techStack: Array.isArray(proj.techStack) ? proj.techStack : [],
              description: proj.description || '',
              githubLink: proj.githubLink || '',
            }))
          : [],
        certifications: Array.isArray(profileData.certifications)
          ? profileData.certifications.map((cert: any, index: number) => ({
              id: `cert_${index}`,
              certificationName: cert.certificationName || '',
              issuingOrganization: cert.issuingOrganization || '',
              issueDate: cert.issueDate || '',
              credentialId: cert.credentialId || '',
              credentialUrl: cert.credentialUrl || '',
            }))
          : [],
        achievements: Array.isArray(profileData.achievements)
          ? profileData.achievements.map((ach: any, index: number) => ({
              id: `ach_${index}`,
              achievementTitle: ach.achievementTitle || '',
              description: ach.description || '',
              date: ach.date || '',
            }))
          : [],
      };

      loadResumeData(resumeDataFromProfile);
      setIsLoadingResume(false);
    }
  }, [profileData, isLoadingProfile, loadResumeData]);

  // Check if profile data is complete
  const isProfileComplete = profileData && (
    profileData.personalInfo?.fullName &&
    profileData.personalInfo?.email &&
    (Array.isArray(profileData.skills) ? profileData.skills.length > 0 :
     typeof profileData.skills === 'string' ? profileData.skills.trim() !== '' : false)
  );

  // Auto-skip to template selection if profile is complete and user hasn't started editing
  useEffect(() => {
    if (isProfileComplete && !isLoadingProfile && currentStep === 0 && resumeData?.personalDetails?.fullName) {
      // Profile data is loaded and complete, offer to skip to template
      const shouldSkip = window.confirm(
        'Your profile data is complete! Would you like to skip to template selection, or review/edit your information first?'
      );
      if (shouldSkip) {
        setCurrentStep(7); // Skip to template selection
      }
    }
  }, [isProfileComplete, isLoadingProfile, currentStep, resumeData]);

  // Handle responsive preview
  useEffect(() => {
    const handleResize = () => {
      setShowPreview(window.innerWidth >= 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <PersonalDetailsForm />;
      case 1:
        return <ObjectiveForm />;
      case 2:
        return <SkillsForm />;
      case 3:
        return <EducationForm />;
      case 4:
        return <ExperienceForm />;
      case 5:
        return <ProjectsForm />;
      case 6:
        return <CertificationsAndAchievementsForm />;
      case 7:
        return <TemplateSelector />;
      case 8:
        return <DownloadAndExportStep />;
      default:
        return <PersonalDetailsForm />;
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  if (isLoadingResume || isLoadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Loading Your Profile</h2>
          <p className="text-gray-600 mb-6">We're preparing your resume with your existing information...</p>
          <div className="flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  // Show quick generate option if profile is complete
  if (showQuickGenerate && currentStep === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Profile is Ready!</h1>
          <p className="text-lg text-gray-600 mb-8">
            We found your complete profile information. You can generate a professional resume instantly or customize it further.
          </p>

          <div className="space-y-4">
            <button
              onClick={handleQuickGenerate}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-2xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl"
            >
              <Sparkles className="w-6 h-6" />
              Generate Resume from Profile
            </button>

            <button
              onClick={() => setShowQuickGenerate(false)}
              className="w-full px-8 py-4 bg-white text-gray-700 rounded-2xl border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all duration-200 font-semibold text-lg"
            >
              Customize & Edit Details
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>What we'll use:</strong> Your personal details, skills, education, experience, projects, and achievements from your profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Modern Header */}
      <div className="bg-white/80 backdrop-blur-lg border-b border-gray-200/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo & Title */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Resume Builder</h1>
                <p className="text-sm text-gray-500">Step {currentStep + 1} of {steps.length}</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="hidden md:flex items-center gap-4 flex-1 max-w-md mx-8">
              <div className="flex-1 bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">{Math.round(progressPercentage)}%</span>
            </div>

            {/* Quick Generate Button */}
            {showQuickGenerate && currentStep < 7 && (
              <button
                onClick={handleQuickGenerate}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                Quick Generate
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Step Indicator - Mobile */}
        <div className="lg:hidden mb-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">{currentStep + 1} / {steps.length}</span>
            </div>

            <button
              onClick={nextStep}
              disabled={currentStep === steps.length - 1}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Progress */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">{steps[currentStep].icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900">{steps[currentStep].title}</h3>
                <p className="text-sm text-gray-600">{steps[currentStep].description}</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <motion.div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercentage}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 sticky top-24">

              {/* Step Navigation */}
              <div className="space-y-3 mb-6">
                {steps.map((step, index) => {
                  const isCompleted = index < currentStep;
                  const isCurrent = index === currentStep;

                  return (
                    <button
                      key={step.id}
                      onClick={() => setCurrentStep(index)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 ${
                        isCurrent
                          ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                          : isCompleted
                            ? 'bg-green-50 border border-green-200 hover:bg-green-100'
                            : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                        isCompleted
                          ? 'bg-green-500 text-white'
                          : isCurrent
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                      }`}>
                        {isCompleted ? <Check className="w-4 h-4" /> : step.icon}
                      </div>
                      <div className="flex-1 text-left">
                        <div className={`text-sm font-medium ${isCurrent ? 'text-blue-900' : isCompleted ? 'text-green-900' : 'text-gray-700'}`}>
                          {step.title}
                        </div>
                        <div className="text-xs text-gray-500">{step.description}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Navigation Buttons */}
              <div className="space-y-3">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>

                <button
                  onClick={nextStep}
                  disabled={currentStep === steps.length - 1}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={`lg:col-span-6 ${showPreview ? 'lg:col-span-6' : 'lg:col-span-9'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 lg:p-8"
              >
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{steps[currentStep].icon}</span>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{steps[currentStep].title}</h2>
                      <p className="text-gray-600">{steps[currentStep].description}</p>
                    </div>
                  </div>
                </div>

                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Preview Pane */}
          {showPreview && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200/50 p-6 sticky top-24">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="lg:hidden text-gray-400 hover:text-gray-600"
                  >
                    ✕
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center mx-auto mb-3">
                      <span className="text-2xl">📄</span>
                    </div>
                    <p className="text-sm">Resume preview will appear here</p>
                    <p className="text-xs text-gray-400 mt-1">Fill out the form to see your resume</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
