import { useResume } from '../../../context/ResumeContext';
import { Mail, Phone, MapPin } from 'lucide-react';

export function ExperiencedTemplate() {
  const { resumeData } = useResume();
  const { personalDetails, objective, skills, education, experience, projects, certifications } =
    resumeData;

  return (
    <div className="bg-white p-10 text-gray-900 font-sans">
      <div className="grid grid-cols-3 gap-8">
        {/* Right Column - Main Content */}
        <div className="col-span-2 space-y-6">
          {/* Header */}
          <div className="border-b-2 border-gray-300 pb-4">
            <h1 className="text-3xl font-bold text-gray-900">{personalDetails.fullName || 'Your Name'}</h1>
            <p className="text-sm text-gray-600 mt-1">Professional Profile</p>
          </div>

          {/* Professional Summary */}
          {objective?.objective && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">PROFESSIONAL SUMMARY</h2>
              <p className="text-sm text-gray-700 leading-relaxed">{objective.objective}</p>
            </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-4">PROFESSIONAL EXPERIENCE</h2>
              <div className="space-y-5">
                {experience.map(exp => (
                  <div key={exp.id}>
                    <div className="flex justify-between items-baseline">
                      <h3 className="text-sm font-bold text-gray-900">{exp.position}</h3>
                      <span className="text-xs text-gray-600">
                        {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-gray-600">{exp.companyName}</p>
                    {exp.location && <p className="text-xs text-gray-500">{exp.location}</p>}
                    {exp.description.length > 0 && (
                      <ul className="mt-2 ml-4 text-xs text-gray-700 space-y-1">
                        {exp.description.slice(0, 4).map((bullet, idx) => (
                          <li key={idx} className="list-disc">
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">PROJECTS</h2>
              <div className="space-y-3">
                {projects.map(proj => (
                  <div key={proj.id}>
                    <h3 className="text-sm font-bold text-gray-900">{proj.projectName}</h3>
                    {proj.techStack.length > 0 && (
                      <p className="text-xs text-gray-600">Tech Stack: {proj.techStack.join(', ')}</p>
                    )}
                    <p className="text-xs text-gray-700 mt-1">{proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-3">EDUCATION</h2>
              <div className="space-y-2">
                {education.map(edu => (
                  <div key={edu.id}>
                    <h3 className="text-sm font-bold text-gray-900">
                      {edu.degree} in {edu.fieldOfStudy}
                    </h3>
                    <p className="text-sm text-gray-600">{edu.institute}</p>
                    <p className="text-xs text-gray-600">
                      {edu.startYear} - {edu.endYear}
                      {edu.percentage && ` • Grade: ${edu.percentage}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-2">CERTIFICATIONS</h2>
              <div className="text-xs text-gray-700 space-y-1">
                {certifications.map(cert => (
                  <p key={cert.id}>{cert.certificationName} • {cert.issuingOrganization}</p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Left Column - Sidebar */}
        <div className="col-span-1 border-l-2 border-gray-300 pl-6 space-y-6">
          {/* Contact */}
          <div>
            <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase">CONTACT</h3>
            <div className="space-y-2 text-xs text-gray-700">
              {personalDetails.email && (
                <div className="flex items-start gap-2">
                  <Mail className="w-3 h-3 mt-0.5" />
                  <span>{personalDetails.email}</span>
                </div>
              )}
              {personalDetails.phone && (
                <div className="flex items-start gap-2">
                  <Phone className="w-3 h-3 mt-0.5" />
                  <span>{personalDetails.phone}</span>
                </div>
              )}
              {personalDetails.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-3 h-3 mt-0.5" />
                  <span>{personalDetails.location}</span>
                </div>
              )}
            </div>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-gray-900 mb-2 uppercase">SKILLS</h3>
              <div className="flex flex-wrap gap-2">
                {skills.map(skill => (
                  <span
                    key={skill.id}
                    className="inline-block text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded"
                  >
                    {skill.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
