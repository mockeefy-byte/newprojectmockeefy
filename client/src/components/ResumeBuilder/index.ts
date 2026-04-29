// Export all Resume Builder components and utilities

// Forms
export { PersonalDetailsForm } from './PersonalDetailsForm';
export { ObjectiveForm } from './ObjectiveForm';
export { SkillsForm } from './SkillsForm';
export { EducationForm } from './EducationForm';
export { ExperienceForm } from './ExperienceForm';
export { ProjectsForm } from './ProjectsForm';
export { CertificationsAndAchievementsForm } from './CertificationsAndAchievementsForm';

// Templates
export { ModernResumeTemplate } from './Templates/ModernTemplate';
export { FresherTemplate } from './Templates/FresherTemplate';
export { ExperiencedTemplate } from './Templates/ExperiencedTemplate';
export { MinimalATSTemplate } from './Templates/MinimalATSTemplate';

// Selector and Download
export { TemplateSelector, PreviewPane } from './TemplateSelector';
export { DownloadAndExportStep } from './DownloadAndExportStep';

// Main Page
export { ResumeBuilderPage } from '../../pages/ResumeBuilder';

// Context and Types
export { useResume, ResumeProvider } from '../../context/ResumeContext';
export type { ResumeData, TemplateType, PersonalDetails, Skill, Education, Experience, Project, Certification, Achievement } from '../../types/resume';

// Utilities
export { downloadResumePDF, printResume } from '../../utils/pdfDownload';
