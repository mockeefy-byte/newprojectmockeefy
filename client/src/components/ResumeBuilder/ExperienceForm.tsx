import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { motion } from 'motion/react';
import { ChevronRight, ChevronLeft, Plus, X, Trash2 } from 'lucide-react';

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

interface ExperienceFormData {
  id: string;
  companyName: string;
  position: string;
  startDate: string;
  endDate: string;
  currentlyWorking: boolean;
  description: string[];
  location?: string;
}

const emptyExperience: ExperienceFormData = {
  id: '',
  companyName: '',
  position: '',
  startDate: '',
  endDate: '',
  currentlyWorking: false,
  description: [],
  location: '',
};

export function ExperienceForm() {
  const { resumeData, addExperience, removeExperience, nextStep, prevStep } = useResume();
  const [formData, setFormData] = useState<ExperienceFormData>({ ...emptyExperience, id: generateId() });
  const [currentBullet, setCurrentBullet] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      currentlyWorking: e.target.checked,
      endDate: e.target.checked ? '' : prev.endDate,
    }));
  };

  const addBulletPoint = () => {
    if (!currentBullet.trim()) return;
    setFormData(prev => ({
      ...prev,
      description: [...prev.description, currentBullet.trim()],
    }));
    setCurrentBullet('');
  };

  const removeBulletPoint = (index: number) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }
    if (!formData.startDate.trim()) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.currentlyWorking && !formData.endDate.trim()) {
      newErrors.endDate = 'End date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (validateForm()) {
      addExperience(formData);
      setFormData({ ...emptyExperience, id: generateId() });
      setCurrentBullet('');
      setErrors({});
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
        <h2 className="text-2xl font-bold text-gray-900">Experience</h2>
        <p className="text-sm text-gray-600 mt-1">
          Highlight your professional experience and achievements
        </p>
      </div>

      <div className="space-y-4">
        {/* Form Inputs */}
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name *
              </label>
              <Input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                placeholder="Company Name"
                className={errors.companyName ? 'border-red-500' : ''}
              />
              {errors.companyName && (
                <p className="text-sm text-red-500 mt-1">{errors.companyName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position/Role *
              </label>
              <Input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleChange}
                placeholder="Job Title"
                className={errors.position ? 'border-red-500' : ''}
              />
              {errors.position && (
                <p className="text-sm text-red-500 mt-1">{errors.position}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location (Optional)
            </label>
            <Input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="San Francisco, CA"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <Input
                type="month"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={errors.startDate ? 'border-red-500' : ''}
              />
              {errors.startDate && (
                <p className="text-sm text-red-500 mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date {formData.currentlyWorking && '(Current)'}
              </label>
              <Input
                type="month"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                disabled={formData.currentlyWorking}
                className={errors.endDate ? 'border-red-500' : ''}
              />
              {errors.endDate && (
                <p className="text-sm text-red-500 mt-1">{errors.endDate}</p>
              )}
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="currentlyWorking"
              checked={formData.currentlyWorking}
              onChange={handleCheckboxChange}
              className="w-4 h-4 rounded border-gray-300"
            />
            <label htmlFor="currentlyWorking" className="ml-2 text-sm text-gray-700">
              I currently work here
            </label>
          </div>

          {/* Bullet Points */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Description / Achievements
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={currentBullet}
                onChange={(e) => setCurrentBullet(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addBulletPoint();
                  }
                }}
                placeholder="Add achievement or responsibility (Press Enter)"
              />
              <Button
                onClick={addBulletPoint}
                variant="outline"
                className="whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Bullets List */}
            <div className="space-y-2">
              {formData.description.map((bullet, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 bg-white rounded border border-gray-200"
                >
                  <span className="text-gray-400 mt-0.5">•</span>
                  <p className="text-sm text-gray-700 flex-1">{bullet}</p>
                  <button
                    onClick={() => removeBulletPoint(index)}
                    className="p-1 hover:bg-red-50 rounded transition-colors"
                  >
                    <X className="w-3 h-3 text-red-500" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={handleAdd}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </Button>
        </div>

        {/* Experience List */}
        {resumeData.experience.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Added Experience</h3>
            {resumeData.experience.map((exp) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{exp.position}</p>
                    <p className="text-sm text-gray-600">{exp.companyName}</p>
                    <p className="text-xs text-gray-500">
                      {exp.startDate} - {exp.currentlyWorking ? 'Present' : exp.endDate}
                    </p>
                    {exp.location && (
                      <p className="text-xs text-gray-500">{exp.location}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeExperience(exp.id)}
                    className="p-1 hover:bg-red-50 rounded-lg transition-colors ml-2"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-between pt-6">
        <Button
          onClick={prevStep}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>
        <Button
          onClick={nextStep}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
