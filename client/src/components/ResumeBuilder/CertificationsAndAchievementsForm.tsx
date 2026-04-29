import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { motion } from 'motion/react';
import { ChevronRight, Download, Plus, X } from 'lucide-react';

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

interface CertificationFormData {
  id: string;
  certificationName: string;
  issuingOrganization: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

interface AchievementFormData {
  id: string;
  title: string;
  description: string;
  date?: string;
}

const emptyCertification: CertificationFormData = {
  id: '',
  certificationName: '',
  issuingOrganization: '',
  issueDate: '',
  expiryDate: '',
  credentialUrl: '',
};

const emptyAchievement: AchievementFormData = {
  id: '',
  title: '',
  description: '',
  date: '',
};

export function CertificationsAndAchievementsForm() {
  const {
    resumeData,
    addCertification,
    removeCertification,
    addAchievement,
    removeAchievement,
    nextStep,
  } = useResume();

  const [certFormData, setCertFormData] = useState<CertificationFormData>({
    ...emptyCertification,
    id: generateId(),
  });
  const [achievementFormData, setAchievementFormData] = useState<AchievementFormData>({
    ...emptyAchievement,
    id: generateId(),
  });
  const [certErrors, setCertErrors] = useState<Record<string, string>>({});
  const [achievementErrors, setAchievementErrors] = useState<Record<string, string>>({});

  // Certifications Handlers
  const handleCertChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCertFormData(prev => ({ ...prev, [name]: value }));
    if (certErrors[name]) {
      setCertErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateCertForm = () => {
    const newErrors: Record<string, string> = {};

    if (!certFormData.certificationName.trim()) {
      newErrors.certificationName = 'Certification name is required';
    }
    if (!certFormData.issuingOrganization.trim()) {
      newErrors.issuingOrganization = 'Organization is required';
    }
    if (!certFormData.issueDate.trim()) {
      newErrors.issueDate = 'Issue date is required';
    }

    setCertErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddCertification = () => {
    if (validateCertForm()) {
      addCertification(certFormData);
      setCertFormData({ ...emptyCertification, id: generateId() });
      setCertErrors({});
    }
  };

  // Achievements Handlers
  const handleAchievementChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setAchievementFormData(prev => ({ ...prev, [name]: value }));
    if (achievementErrors[name]) {
      setAchievementErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateAchievementForm = () => {
    const newErrors: Record<string, string> = {};

    if (!achievementFormData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    if (!achievementFormData.description.trim()) {
      newErrors.description = 'Description is required';
    }

    setAchievementErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddAchievement = () => {
    if (validateAchievementForm()) {
      addAchievement(achievementFormData);
      setAchievementFormData({ ...emptyAchievement, id: generateId() });
      setAchievementErrors({});
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Additional Information</h2>
        <p className="text-sm text-gray-600 mt-1">
          Add certifications and achievements (optional)
        </p>
      </div>

      <div className="space-y-8">
        {/* Certifications Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Certifications</h3>

          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Certification Name
              </label>
              <Input
                type="text"
                name="certificationName"
                value={certFormData.certificationName}
                onChange={handleCertChange}
                placeholder="AWS Solutions Architect, Google Cloud Certified..."
                className={certErrors.certificationName ? 'border-red-500' : ''}
              />
              {certErrors.certificationName && (
                <p className="text-sm text-red-500 mt-1">{certErrors.certificationName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Issuing Organization
              </label>
              <Input
                type="text"
                name="issuingOrganization"
                value={certFormData.issuingOrganization}
                onChange={handleCertChange}
                placeholder="AWS, Google, Coursera..."
                className={certErrors.issuingOrganization ? 'border-red-500' : ''}
              />
              {certErrors.issuingOrganization && (
                <p className="text-sm text-red-500 mt-1">{certErrors.issuingOrganization}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Issue Date
                </label>
                <Input
                  type="month"
                  name="issueDate"
                  value={certFormData.issueDate}
                  onChange={handleCertChange}
                  className={certErrors.issueDate ? 'border-red-500' : ''}
                />
                {certErrors.issueDate && (
                  <p className="text-sm text-red-500 mt-1">{certErrors.issueDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Expiry Date (Optional)
                </label>
                <Input
                  type="month"
                  name="expiryDate"
                  value={certFormData.expiryDate}
                  onChange={handleCertChange}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Credential URL (Optional)
              </label>
              <Input
                type="url"
                name="credentialUrl"
                value={certFormData.credentialUrl}
                onChange={handleCertChange}
                placeholder="https://credential-link.com"
              />
            </div>

            <Button
              onClick={handleAddCertification}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Certification
            </Button>
          </div>

          {/* Certifications List */}
          {resumeData.certifications.length > 0 && (
            <div className="space-y-2">
              {resumeData.certifications.map((cert) => (
                <motion.div
                  key={cert.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-white border border-gray-200 rounded-lg flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{cert.certificationName}</p>
                    <p className="text-sm text-gray-600">{cert.issuingOrganization}</p>
                    <p className="text-xs text-gray-500">{cert.issueDate}</p>
                  </div>
                  <button
                    onClick={() => removeCertification(cert.id)}
                    className="p-1 hover:bg-red-50 rounded-lg transition-colors ml-2"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Achievements Section */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Achievements</h3>

          <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Achievement Title
              </label>
              <Input
                type="text"
                name="title"
                value={achievementFormData.title}
                onChange={handleAchievementChange}
                placeholder="Award, Recognition, Milestone..."
                className={achievementErrors.title ? 'border-red-500' : ''}
              />
              {achievementErrors.title && (
                <p className="text-sm text-red-500 mt-1">{achievementErrors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={achievementFormData.description}
                onChange={handleAchievementChange}
                placeholder="Brief description of the achievement"
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                  achievementErrors.description ? 'border-red-500' : ''
                }`}
              />
              {achievementErrors.description && (
                <p className="text-sm text-red-500 mt-1">{achievementErrors.description}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date (Optional)
              </label>
              <Input
                type="month"
                name="date"
                value={achievementFormData.date}
                onChange={handleAchievementChange}
              />
            </div>

            <Button
              onClick={handleAddAchievement}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Achievement
            </Button>
          </div>

          {/* Achievements List */}
          {resumeData.achievements.length > 0 && (
            <div className="space-y-2">
              {resumeData.achievements.map((achievement) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 bg-white border border-gray-200 rounded-lg flex justify-between items-start"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{achievement.title}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {achievement.description}
                    </p>
                    {achievement.date && (
                      <p className="text-xs text-gray-500">{achievement.date}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeAchievement(achievement.id)}
                    className="p-1 hover:bg-red-50 rounded-lg transition-colors ml-2"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end pt-6">
        <Button
          onClick={nextStep}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          Continue to Templates
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
