import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { ResumeData, TemplateType, PersonalDetails, Skill, Education, Experience, Project, Certification, Achievement } from '../types/resume';

interface ResumeContextType {
  // Data
  resumeData: ResumeData;
  
  // Form navigation
  currentStep: number;
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  
  // Template
  selectedTemplate: TemplateType;
  setSelectedTemplate: (template: TemplateType) => void;
  
  // Personal Details
  updatePersonalDetails: (details: Partial<PersonalDetails>) => void;
  
  // Skills
  addSkill: (skill: Skill) => void;
  updateSkill: (id: string, skill: Partial<Skill>) => void;
  removeSkill: (id: string) => void;
  
  // Education
  addEducation: (education: Education) => void;
  updateEducation: (id: string, education: Partial<Education>) => void;
  removeEducation: (id: string) => void;
  
  // Experience
  addExperience: (experience: Experience) => void;
  updateExperience: (id: string, experience: Partial<Experience>) => void;
  removeExperience: (id: string) => void;
  
  // Projects
  addProject: (project: Project) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  removeProject: (id: string) => void;
  
  // Certifications
  addCertification: (certification: Certification) => void;
  updateCertification: (id: string, certification: Partial<Certification>) => void;
  removeCertification: (id: string) => void;
  
  // Achievements
  addAchievement: (achievement: Achievement) => void;
  updateAchievement: (id: string, achievement: Partial<Achievement>) => void;
  removeAchievement: (id: string) => void;
  
  // Objective
  updateObjective: (objective: string) => void;
  
  // Reset
  resetResume: () => void;
  
  // Save/Load
  saveToLocalStorage: () => void;
  loadFromLocalStorage: () => void;
  loadResumeData: (data: Partial<ResumeData>) => void;
}

const defaultResumeData: ResumeData = {
  personalDetails: {
    fullName: '',
    email: '',
    phone: '',
    location: '',
  },
  objective: undefined,
  skills: [],
  education: [],
  experience: [],
  projects: [],
  certifications: [],
  achievements: [],
};

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

export function ResumeProvider({ children }: { children: React.ReactNode }) {
  const [resumeData, setResumeData] = useState<ResumeData>(defaultResumeData);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');

  // Load from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('resumeData');
    const savedStep = localStorage.getItem('resumeStep');
    const savedTemplate = localStorage.getItem('resumeTemplate');
    
    if (savedData) {
      try {
        setResumeData(JSON.parse(savedData));
      } catch (error) {
        console.error('Failed to load resume data from localStorage:', error);
      }
    }
    
    if (savedStep) {
      setCurrentStep(parseInt(savedStep, 10));
    }
    
    if (savedTemplate) {
      setSelectedTemplate(savedTemplate as TemplateType);
    }
  }, []);

  // Auto-save to localStorage
  useEffect(() => {
    saveToLocalStorage();
  }, [resumeData, currentStep, selectedTemplate]);

  const saveToLocalStorage = useCallback(() => {
    localStorage.setItem('resumeData', JSON.stringify(resumeData));
    localStorage.setItem('resumeStep', currentStep.toString());
    localStorage.setItem('resumeTemplate', selectedTemplate);
  }, [resumeData, currentStep, selectedTemplate]);

  const loadFromLocalStorage = useCallback(() => {
    const savedData = localStorage.getItem('resumeData');
    const savedStep = localStorage.getItem('resumeStep');
    const savedTemplate = localStorage.getItem('resumeTemplate');
    
    if (savedData) {
      try {
        setResumeData(JSON.parse(savedData));
      } catch (error) {
        console.error('Failed to load resume data:', error);
      }
    }
    
    if (savedStep) {
      setCurrentStep(parseInt(savedStep, 10));
    }
    
    if (savedTemplate) {
      setSelectedTemplate(savedTemplate as TemplateType);
    }
  }, []);

  const loadResumeData = useCallback((data: Partial<ResumeData>) => {
    setResumeData(prev => ({
      ...prev,
      ...data,
    }));
  }, []);

  const nextStep = useCallback(() => {
    setCurrentStep(prev => Math.min(prev + 1, 6));
  }, []);

  const prevStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 0));
  }, []);

  const updatePersonalDetails = useCallback((details: Partial<PersonalDetails>) => {
    setResumeData(prev => ({
      ...prev,
      personalDetails: { ...prev.personalDetails, ...details },
    }));
  }, []);

  const updateObjective = useCallback((objective: string) => {
    setResumeData(prev => ({
      ...prev,
      objective: { objective },
    }));
  }, []);

  // Skills
  const addSkill = useCallback((skill: Skill) => {
    setResumeData(prev => ({
      ...prev,
      skills: [...prev.skills, skill],
    }));
  }, []);

  const updateSkill = useCallback((id: string, skill: Partial<Skill>) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.map(s => (s.id === id ? { ...s, ...skill } : s)),
    }));
  }, []);

  const removeSkill = useCallback((id: string) => {
    setResumeData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s.id !== id),
    }));
  }, []);

  // Education
  const addEducation = useCallback((education: Education) => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, education],
    }));
  }, []);

  const updateEducation = useCallback((id: string, education: Partial<Education>) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.map(e => (e.id === id ? { ...e, ...education } : e)),
    }));
  }, []);

  const removeEducation = useCallback((id: string) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter(e => e.id !== id),
    }));
  }, []);

  // Experience
  const addExperience = useCallback((experience: Experience) => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, experience],
    }));
  }, []);

  const updateExperience = useCallback((id: string, experience: Partial<Experience>) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.map(e => (e.id === id ? { ...e, ...experience } : e)),
    }));
  }, []);

  const removeExperience = useCallback((id: string) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter(e => e.id !== id),
    }));
  }, []);

  // Projects
  const addProject = useCallback((project: Project) => {
    setResumeData(prev => ({
      ...prev,
      projects: [...prev.projects, project],
    }));
  }, []);

  const updateProject = useCallback((id: string, project: Partial<Project>) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.map(p => (p.id === id ? { ...p, ...project } : p)),
    }));
  }, []);

  const removeProject = useCallback((id: string) => {
    setResumeData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
    }));
  }, []);

  // Certifications
  const addCertification = useCallback((certification: Certification) => {
    setResumeData(prev => ({
      ...prev,
      certifications: [...prev.certifications, certification],
    }));
  }, []);

  const updateCertification = useCallback((id: string, certification: Partial<Certification>) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.map(c => (c.id === id ? { ...c, ...certification } : c)),
    }));
  }, []);

  const removeCertification = useCallback((id: string) => {
    setResumeData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(c => c.id !== id),
    }));
  }, []);

  // Achievements
  const addAchievement = useCallback((achievement: Achievement) => {
    setResumeData(prev => ({
      ...prev,
      achievements: [...prev.achievements, achievement],
    }));
  }, []);

  const updateAchievement = useCallback((id: string, achievement: Partial<Achievement>) => {
    setResumeData(prev => ({
      ...prev,
      achievements: prev.achievements.map(a => (a.id === id ? { ...a, ...achievement } : a)),
    }));
  }, []);

  const removeAchievement = useCallback((id: string) => {
    setResumeData(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a.id !== id),
    }));
  }, []);

  const resetResume = useCallback(() => {
    setResumeData(defaultResumeData);
    setCurrentStep(0);
    setSelectedTemplate('modern');
    localStorage.removeItem('resumeData');
    localStorage.removeItem('resumeStep');
    localStorage.removeItem('resumeTemplate');
  }, []);

  const value: ResumeContextType = {
    resumeData,
    currentStep,
    setCurrentStep,
    nextStep,
    prevStep,
    selectedTemplate,
    setSelectedTemplate,
    updatePersonalDetails,
    addSkill,
    updateSkill,
    removeSkill,
    addEducation,
    updateEducation,
    removeEducation,
    addExperience,
    updateExperience,
    removeExperience,
    addProject,
    updateProject,
    removeProject,
    addCertification,
    updateCertification,
    removeCertification,
    addAchievement,
    updateAchievement,
    removeAchievement,
    updateObjective,
    resetResume,
    saveToLocalStorage,
    loadFromLocalStorage,
    loadResumeData,
  };

  return (
    <ResumeContext.Provider value={value}>
      {children}
    </ResumeContext.Provider>
  );
}

export function useResume(): ResumeContextType {
  const context = useContext(ResumeContext);
  if (!context) {
    throw new Error('useResume must be used within ResumeProvider');
  }
  return context;
}
