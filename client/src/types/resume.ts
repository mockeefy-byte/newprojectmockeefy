// Resume Builder Types

export interface PersonalDetails {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedIn?: string;
  portfolio?: string;
}

export interface ResumeObjective {
  objective: string;
}

export interface Skill {
  id: string;
  name: string;
  proficiency?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Education {
  id: string;
  degree: string;
  institute: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
  percentage?: string;
  cgpa?: string;
  description?: string;
}

export interface Experience {
  id: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string[];
  location?: string;
}

export interface Project {
  id: string;
  projectName: string;
  techStack: string[];
  description: string;
  githubLink?: string;
  liveLink?: string;
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  id: string;
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  date?: string;
}

export interface ResumeData {
  personalDetails: PersonalDetails;
  objective?: ResumeObjective;
  skills: Skill[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  achievements: Achievement[];
}

export type TemplateType = 'fresher' | 'experienced' | 'minimal' | 'modern';

export interface ResumeBuilderState {
  data: ResumeData;
  currentStep: number;
  selectedTemplate: TemplateType;
  isDraft: boolean;
}
