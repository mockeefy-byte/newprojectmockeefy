# Resume Builder - Complete Documentation

## Overview

The Resume Builder is a modern, professional web application that helps users create, design, and export high-quality resumes. It features multi-step form completion, real-time preview, and multiple professional templates.

## Features

### ✨ Core Features
- **Multi-Step Form**: 9-step process for complete resume building
- **Real-Time Preview**: Live preview of resume as you fill the form (desktop view)
- **Multiple Templates**: 4 professional templates including ATS-optimized design
- **Auto-Save**: Automatic saving to localStorage
- **PDF Export**: Download resumes as PDF files
- **Print Support**: Direct printing capability
- **Data Persistence**: Save and load resume data as JSON files
- **Share Link**: Generate shareable links for your resume

### 📋 Resume Sections
1. **Personal Details** - Name, email, phone, location, social profiles
2. **Professional Summary** - Career objective with suggestions
3. **Skills** - Add skills with proficiency levels
4. **Education** - Multiple degrees with details
5. **Experience** - Work history with bullet points
6. **Projects** - Portfolio projects with tech stack
7. **Certifications & Achievements** - Professional credentials
8. **Template Selection** - Choose from 4 designs
9. **Download & Export** - Multiple export options

### 🎨 Available Templates
1. **Modern Template** - Contemporary design with color highlights
2. **Fresher Template** - Ideal for students and first-time job seekers
3. **Experienced Template** - Two-column layout emphasizing career growth
4. **Minimal ATS Template** - Text-only, optimized for applicant tracking systems

## Installation

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Setup Steps

1. **Install HTML2PDF Dependency**
   ```bash
   cd client
   npm install html2pdf.js
   ```

2. **Verify Installation**
   ```bash
   npm list html2pdf.js
   ```

## File Structure

```
src/
├── components/
│   └── ResumeBuilder/
│       ├── PersonalDetailsForm.tsx
│       ├── ObjectiveForm.tsx
│       ├── SkillsForm.tsx
│       ├── EducationForm.tsx
│       ├── ExperienceForm.tsx
│       ├── ProjectsForm.tsx
│       ├── CertificationsAndAchievementsForm.tsx
│       ├── TemplateSelector.tsx
│       ├── DownloadAndExportStep.tsx
│       └── Templates/
│           ├── ModernTemplate.tsx
│           ├── FresherTemplate.tsx
│           ├── ExperiencedTemplate.tsx
│           └── MinimalATSTemplate.tsx
├── context/
│   └── ResumeContext.tsx
├── pages/
│   └── ResumeBuilder.tsx
├── types/
│   └── resume.ts
└── utils/
    └── pdfDownload.ts
```

## Usage

### Accessing the Resume Builder
- **Route**: `/resume-builder`
- **Auth Required**: Yes (protected route)
- **Allowed Users**: Candidates, Users, Experts

### How to Use

1. **Start Building**
   - Navigate to `/resume-builder`
   - Fill out personal details (all required fields)
   - Click "Next" to proceed

2. **Complete Each Section**
   - Follow the step-by-step flow
   - All steps are accessible via the step indicator at the top
   - Progress is saved automatically

3. **Preview in Real-Time**
   - Desktop: See live preview on the right side
   - Mobile: Toggle preview visibility with "Show/Hide Preview" button

4. **Choose Template**
   - Step 8 allows template selection
   - Preview updates immediately

5. **Export Resume**
   - Step 9 provides export options:
     - **Download PDF**: Save as PDF file
     - **Print**: Open print dialog
     - **Save Data**: Export as JSON for future editing
     - **Share Link**: Generate shareable URL

## Component APIs

### ResumeContext Hook

```typescript
const {
  // Data
  resumeData,
  
  // Navigation
  currentStep,
  setCurrentStep,
  nextStep,
  prevStep,
  
  // Template
  selectedTemplate,
  setSelectedTemplate,
  
  // Data Updates
  updatePersonalDetails,
  addSkill, updateSkill, removeSkill,
  addEducation, updateEducation, removeEducation,
  addExperience, updateExperience, removeExperience,
  addProject, updateProject, removeProject,
  addCertification, updateCertification, removeCertification,
  addAchievement, updateAchievement, removeAchievement,
  updateObjective,
  
  // Persistence
  resetResume,
  saveToLocalStorage,
  loadFromLocalStorage,
} = useResume();
```

### Resume Data Structure

```typescript
interface ResumeData {
  personalDetails: PersonalDetails;
  objective?: ResumeObjective;
  skills: Skill[];
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  achievements: Achievement[];
}
```

## Styling

### Color Palette
- **Primary**: #2563EB (Blue)
- **Background**: #FFFFFF / #F9FAFB
- **Text**: #111827 (Dark Gray)
- **Secondary**: #4B5563 (Gray)
- **Border**: #E5E7EB (Light Gray)

### Technologies Used
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion (motion/react)
- **UI Components**: Radix UI + Custom components
- **Icons**: Lucide React
- **PDF Generation**: HTML2PDF.js
- **State Management**: React Context API

## Features in Detail

### Auto-Save
- Data is automatically saved to localStorage
- Persists across browser sessions
- Auto-save on every state change

### Form Validation
- Required fields validation
- Email format validation
- Error messages displayed inline
- Prevents submission with invalid data

### Responsive Design
- Mobile-first approach
- Tablet optimized
- Desktop with split-screen preview
- Touch-friendly buttons and inputs

### ATS-Friendly Output
- Minimal ATS template removes formatting
- Plain text, no images or graphics
- Compatible with applicant tracking systems
- Proper semantic HTML structure

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Performance Considerations

1. **Large Resumes**: PDF generation may take a few seconds for complex resumes
2. **Storage Limits**: localStorage has ~5MB limit
3. **Export Size**: PDFs are typically 500KB-1MB

## Known Limitations

1. PDF generation requires JavaScript enabled
2. Print quality depends on user's printer settings
3. Some fonts may render differently in PDF
4. localStorage limited to 5MB per domain

## Future Enhancements

- [ ] Template customization (colors, fonts)
- [ ] Spell check and grammar suggestions
- [ ] Multiple resume versions
- [ ] Cover letter builder
- [ ] Template marketplace
- [ ] Cloud sync and backup
- [ ] Collaborative editing
- [ ] Import from LinkedIn
- [ ] DOCX export format

## Troubleshooting

### PDF Download Not Working
- Check if browser has JavaScript enabled
- Clear browser cache
- Try a different browser
- Check console for error messages

### Data Not Saving
- Check browser localStorage is enabled
- Verify sufficient storage space
- Check browser's privacy/incognito settings

### Preview Not Updating
- Refresh the page
- Clear browser cache
- Check if browser supports CSS Grid

## Support & Feedback

For issues or feature requests, please contact support or open an issue in the repository.

## License

Part of Mockeefy Application - All Rights Reserved

## Contact Information

- **Email**: support@mockeefy.com
- **Website**: https://mockeefy.com

---

**Last Updated**: April 3, 2026
**Version**: 1.0.0
