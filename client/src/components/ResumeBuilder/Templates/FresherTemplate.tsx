import { useResume } from '../../../context/ResumeContext';
import { Mail, Phone, MapPin, Globe, Linkedin } from 'lucide-react';

export function FresherTemplate() {
  const { resumeData } = useResume();
  const { personalDetails, objective, skills, education, experience, projects, certifications } =
    resumeData;

  return (
    <div className="bg-white p-10 text-gray-900 font-sans space-y-5">
      {/* Header */}
      <div className="text-center border-b-2 border-gray-300 pb-5">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{personalDetails.fullName || 'Your Name'}</h1>
        <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-600">
          {personalDetails.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-3 h-3" />
              <span>{personalDetails.email}</span>
            </div>
          )}
          {personalDetails.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-3 h-3" />
              <span>{personalDetails.phone}</span>
            </div>
          )}
          {personalDetails.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span>{personalDetails.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {objective?.objective && (
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
            About
          </h2>
          <p className="text-xs text-gray-700 leading-relaxed">{objective.objective}</p>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
            Education
          </h2>
          <div className="space-y-2">
            {education.map(edu => (
              <div key={edu.id}>
                <div className="flex justify-between">
                  <h3 className="text-xs font-bold text-gray-900">
                    {edu.degree} in {edu.fieldOfStudy}
                  </h3>
                  <span className="text-xs text-gray-600">
                    {edu.startYear} - {edu.endYear}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{edu.institute}</p>
                {edu.percentage && <p className="text-xs text-gray-500">Grade: {edu.percentage}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <div key={skill.id} className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded">
                {skill.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
            Projects
          </h2>
          <div className="space-y-2">
            {projects.map(proj => (
              <div key={proj.id}>
                <h3 className="text-xs font-bold text-gray-900">{proj.projectName}</h3>
                {proj.techStack.length > 0 && (
                  <p className="text-xs text-gray-600">
                    {proj.techStack.join(' • ')}
                  </p>
                )}
                <p className="text-xs text-gray-700 mt-1">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience (if any) */}
      {experience.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
            Experience
          </h2>
          <div className="space-y-2">
            {experience.map(exp => (
              <div key={exp.id}>
                <div className="flex justify-between">
                  <h3 className="text-xs font-bold text-gray-900">{exp.position}</h3>
                  <span className="text-xs text-gray-600">
                    {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}
                  </span>
                </div>
                <p className="text-xs text-gray-600">{exp.companyName}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div>
          <h2 className="text-sm font-bold text-gray-900 mb-2 uppercase tracking-wide">
            Certifications
          </h2>
          <div className="space-y-1">
            {certifications.map(cert => (
              <p key={cert.id} className="text-xs text-gray-700">
                {cert.certificationName} • {cert.issuingOrganization}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
