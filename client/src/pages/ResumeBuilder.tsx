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
  const [isLoadingResume, setIsLoadingResume] = useState(true);



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

  useEffect(() => {
    if (isProfileComplete && currentStep === 0) {
      setCurrentStep(7);
    }
  }, [isProfileComplete, currentStep, setCurrentStep]);





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
  if (isProfileComplete && currentStep === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8">
            <Sparkles className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">Your Profile is Ready!</h1>
          <p className="text-lg text-gray-600 mb-8">
            We found your complete profile information. You can generate a professional resume instantly or customize it further.
          </p>

          <div className="space-y-4">
            <button
              onClick={() => setCurrentStep(7)}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg"
            >
              <Sparkles className="w-6 h-6" />
              Generate Resume from Profile
            </button>

            <button
              onClick={() => setCurrentStep(1)}
              className="w-full px-8 py-4 bg-white text-gray-700 rounded-lg border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors font-semibold text-lg"
            >
              Customize & Edit Details
            </button>
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>What we'll use:</strong> Your personal details, skills, education, experience, projects, and achievements from your profile.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen overflow-hidden">
        
        {/* LEFT SIDEBAR */}
        <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200">
          {/* Profile Section */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                {user?.name?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-bold text-gray-900 truncate">{user?.name || 'User'}</h3>
                <p className="text-xs text-gray-500 truncate">Professional</p>
              </div>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {steps.map((step, index) => {
              const isActive = currentStep === index;
              const isCompleted = index < currentStep;
              
              return (
                <button
                  key={step.id}
                  onClick={() => setCurrentStep(index)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : isCompleted
                        ? 'text-green-700 hover:bg-gray-50'
                        : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="text-base">{step.icon}</span>
                  <span>{step.title}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{steps[currentStep].title}</h1>
                <p className="text-sm text-gray-500 mt-1">{steps[currentStep].description}</p>
              </div>
              <div className="flex items-center gap-3">
                {currentStep > 0 && (
                  <button
                    onClick={prevStep}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>
                )}
                {currentStep < steps.length - 1 && (
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-2 px-4 py-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            <div className="max-w-6xl mx-auto px-6 py-8">
              {isLoadingResume || isLoadingProfile ? (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your profile...</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Previous Items - Left Column */}
                  <div className="lg:col-span-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                      Previous {steps[currentStep].title}
                    </h3>
                    <div className="space-y-4">
                      {/* Timeline items will be rendered here based on currentStep */}
                      {currentStep === 4 && resumeData?.experience?.map((exp: any) => (
                        <div key={exp.id} className="pb-4 border-b border-gray-200">
                          <div className="w-3 h-3 bg-blue-600 rounded-full mb-3"></div>
                          <h4 className="font-bold text-gray-900 text-sm">{exp.position}</h4>
                          <p className="text-sm text-gray-600">{exp.companyName}</p>
                          <p className="text-xs text-gray-500 mt-1">{exp.startDate} — {exp.endDate}</p>
                        </div>
                      ))}
                      {currentStep === 3 && resumeData?.education?.map((edu: any) => (
                        <div key={edu.id} className="pb-4 border-b border-gray-200">
                          <div className="w-3 h-3 bg-blue-600 rounded-full mb-3"></div>
                          <h4 className="font-bold text-gray-900 text-sm">{edu.degree}</h4>
                          <p className="text-sm text-gray-600">{edu.institute}</p>
                          <p className="text-xs text-gray-500 mt-1">{edu.startYear} — {edu.endYear}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Add Form - Right Columns */}
                  <div className="lg:col-span-2">
                    <div className="bg-white rounded-xl border border-gray-200 p-8">
                      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <span className="text-blue-600 text-xl">+</span>
                        Add {steps[currentStep].title}
                      </h3>
                      
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={currentStep}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.2 }}
                        >
                          {renderStepContent()}
                        </motion.div>
                      </AnimatePresence>

                      {/* Action Buttons */}
                      <div className="flex gap-4 mt-8 pt-6 border-t border-gray-200">
                        <button className="flex-1 px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium">
                          Discard
                        </button>
                        <button
                          onClick={nextStep}
                          className="flex-1 px-6 py-3 text-white bg-green-500 rounded-lg hover:bg-green-600 transition-colors font-medium flex items-center justify-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Save {steps[currentStep].title}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
