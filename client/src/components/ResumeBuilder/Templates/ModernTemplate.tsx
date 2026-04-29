import { useResume } from '../../../context/ResumeContext';
import { Mail, Phone, MapPin, Globe, Github, Linkedin } from 'lucide-react';

export function ModernResumeTemplate() {
  const { resumeData } = useResume();
  const { personalDetails, objective, skills, education, experience, projects, certifications, achievements } =
    resumeData;

  return (
    <div className="bg-white p-10 text-gray-900 font-sans space-y-6">
      {/* Header */}
      <div className="border-b-2 border-blue-600 pb-6">
        <div className="mb-4">
          <h1 className="text-4xl font-bold text-gray-900">{personalDetails.fullName || 'Your Name'}</h1>
        </div>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          {personalDetails.email && (
            <div className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              <span>{personalDetails.email}</span>
            </div>
          )}
          {personalDetails.phone && (
            <div className="flex items-center gap-1">
              <Phone className="w-4 h-4" />
              <span>{personalDetails.phone}</span>
            </div>
          )}
          {personalDetails.location && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{personalDetails.location}</span>
            </div>
          )}
          {personalDetails.portfolio && (
            <div className="flex items-center gap-1">
              <Globe className="w-4 h-4" />
              <a
                href={personalDetails.portfolio}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                Portfolio
              </a>
            </div>
          )}
          {personalDetails.linkedIn && (
            <div className="flex items-center gap-1">
              <Linkedin className="w-4 h-4" />
              <a
                href={personalDetails.linkedIn}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                LinkedIn
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {objective?.objective && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2 border-b-2 border-blue-600 pb-1">
            PROFESSIONAL SUMMARY
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">{objective.objective}</p>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2 border-b-2 border-blue-600 pb-1">
            SKILLS
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.map(skill => (
              <div
                key={skill.id}
                className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full"
              >
                {skill.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">
            EXPERIENCE
          </h2>
          <div className="space-y-4">
            {experience.map(exp => (
              <div key={exp.id} className="border-l-4 border-blue-600 pl-4">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-bold text-gray-900">{exp.position}</h3>
                  <span className="text-xs text-gray-600">
                    {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{exp.companyName}</p>
                {exp.location && <p className="text-xs text-gray-500">{exp.location}</p>}
                {exp.description.length > 0 && (
                  <ul className="mt-2 ml-4 text-xs text-gray-700 space-y-1">
                    {exp.description.map((bullet, idx) => (
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

      {/* Education */}
      {education.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">
            EDUCATION
          </h2>
          <div className="space-y-3">
            {education.map(edu => (
              <div key={edu.id} className="border-l-4 border-blue-600 pl-4">
                <div className="flex justify-between items-baseline">
                  <h3 className="text-sm font-bold text-gray-900">
                    {edu.degree} in {edu.fieldOfStudy}
                  </h3>
                  <span className="text-xs text-gray-600">
                    {edu.startYear} - {edu.endYear}
                  </span>
                </div>
                <p className="text-sm text-gray-600">{edu.institute}</p>
                {edu.percentage && (
                  <p className="text-xs text-gray-500">Grade: {edu.percentage}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 border-b-2 border-blue-600 pb-1">
            PROJECTS
          </h2>
          <div className="space-y-3">
            {projects.map(proj => (
              <div key={proj.id} className="border-l-4 border-blue-600 pl-4">
                <h3 className="text-sm font-bold text-gray-900">{proj.projectName}</h3>
                {proj.techStack.length > 0 && (
                  <p className="text-xs text-gray-600">
                    Tech: {proj.techStack.join(', ')}
                  </p>
                )}
                <p className="text-xs text-gray-700 mt-1">{proj.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2 border-b-2 border-blue-600 pb-1">
            CERTIFICATIONS
          </h2>
          <div className="space-y-2">
            {certifications.map(cert => (
              <div key={cert.id} className="text-xs">
                <p className="font-medium text-gray-900">
                  {cert.certificationName} - {cert.issuingOrganization}
                </p>
                <p className="text-gray-600">{cert.issueDate}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      {achievements.length > 0 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-2 border-b-2 border-blue-600 pb-1">
            ACHIEVEMENTS
          </h2>
          <ul className="text-xs text-gray-700 space-y-1">
            {achievements.map(ach => (
              <li key={ach.id} className="list-disc list-inside">
                <span className="font-medium">{ach.title}</span> - {ach.description}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
