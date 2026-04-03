import { useResume } from '../../../context/ResumeContext';

export function MinimalATSTemplate() {
  const { resumeData } = useResume();
  const { personalDetails, objective, skills, education, experience, projects, certifications } =
    resumeData;

  return (
    <div className="bg-white p-10 text-gray-900 font-mono text-xs leading-loose space-y-4">
      {/* Header - ATS Friendly */}
      <div className="text-center border-b-2 border-black pb-3">
        <div className="font-bold text-base">{personalDetails.fullName || 'YOUR NAME'}</div>
        <div>
          {[
            personalDetails.email,
            personalDetails.phone,
            personalDetails.location,
          ]
            .filter(Boolean)
            .join(' | ')}
        </div>
      </div>

      {/* Professional Summary */}
      {objective?.objective && (
        <div>
          <div className="font-bold border-b border-black pb-1">PROFESSIONAL SUMMARY</div>
          <div className="mt-2">{objective.objective}</div>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div>
          <div className="font-bold border-b border-black pb-1">PROFESSIONAL EXPERIENCE</div>
          <div className="mt-2 space-y-3">
            {experience.map(exp => (
              <div key={exp.id}>
                <div>
                  <span className="font-bold">{exp.position}</span>
                  <span> | {exp.companyName}</span>
                </div>
                <div>
                  {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}
                </div>
                {exp.description.length > 0 && (
                  <div className="mt-1">
                    {exp.description.map((bullet, idx) => (
                      <div key={idx}>• {bullet}</div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div>
          <div className="font-bold border-b border-black pb-1">EDUCATION</div>
          <div className="mt-2 space-y-2">
            {education.map(edu => (
              <div key={edu.id}>
                <div>
                  <span className="font-bold">
                    {edu.degree} in {edu.fieldOfStudy}
                  </span>
                </div>
                <div>{edu.institute}</div>
                <div>
                  {edu.startYear} - {edu.endYear}
                  {edu.percentage && ` | Grade: ${edu.percentage}`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div>
          <div className="font-bold border-b border-black pb-1">SKILLS</div>
          <div className="mt-2">
            {skills.map((skill, idx) => (
              <span key={skill.id}>
                {skill.name}
                {idx < skills.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div>
          <div className="font-bold border-b border-black pb-1">PROJECTS</div>
          <div className="mt-2 space-y-2">
            {projects.map(proj => (
              <div key={proj.id}>
                <div className="font-bold">{proj.projectName}</div>
                {proj.techStack.length > 0 && (
                  <div>Technologies: {proj.techStack.join(', ')}</div>
                )}
                <div>{proj.description}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div>
          <div className="font-bold border-b border-black pb-1">CERTIFICATIONS</div>
          <div className="mt-2 space-y-1">
            {certifications.map(cert => (
              <div key={cert.id}>
                {cert.certificationName} - {cert.issuingOrganization} ({cert.issueDate})
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
