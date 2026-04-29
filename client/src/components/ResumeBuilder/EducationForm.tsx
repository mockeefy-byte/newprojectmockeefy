import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { motion } from 'motion/react';
import { ChevronRight, ChevronLeft, Plus, X } from 'lucide-react';

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

interface EducationForm {
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

const emptyEducation: EducationForm = {
  id: '',
  degree: '',
  institute: '',
  fieldOfStudy: '',
  startYear: '',
  endYear: '',
  percentage: '',
  cgpa: '',
  description: '',
};

export function EducationForm() {
  const { resumeData, addEducation, removeEducation, nextStep, prevStep } = useResume();
  const [formData, setFormData] = useState<EducationForm>({ ...emptyEducation, id: generateId() });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.degree.trim()) {
      newErrors.degree = 'Degree is required';
    }
    if (!formData.institute.trim()) {
      newErrors.institute = 'College/University is required';
    }
    if (!formData.fieldOfStudy.trim()) {
      newErrors.fieldOfStudy = 'Field of study is required';
    }
    if (!formData.startYear.trim()) {
      newErrors.startYear = 'Start year is required';
    }
    if (!formData.endYear.trim()) {
      newErrors.endYear = 'End year is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (validateForm()) {
      addEducation(formData);
      setFormData({ ...emptyEducation, id: generateId() });
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
        <h2 className="text-2xl font-bold text-gray-900">Education</h2>
        <p className="text-sm text-gray-600 mt-1">
          Add your educational background and qualifications
        </p>
      </div>

      <div className="space-y-4">
        {/* Form Inputs */}
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Degree *
              </label>
              <Input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="B.Tech, MBA, B.S., etc."
                className={errors.degree ? 'border-red-500' : ''}
              />
              {errors.degree && <p className="text-sm text-red-500 mt-1">{errors.degree}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Field of Study *
              </label>
              <Input
                type="text"
                name="fieldOfStudy"
                value={formData.fieldOfStudy}
                onChange={handleChange}
                placeholder="Computer Science, Engineering, etc."
                className={errors.fieldOfStudy ? 'border-red-500' : ''}
              />
              {errors.fieldOfStudy && (
                <p className="text-sm text-red-500 mt-1">{errors.fieldOfStudy}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              College/University *
            </label>
            <Input
              type="text"
              name="institute"
              value={formData.institute}
              onChange={handleChange}
              placeholder="University Name"
              className={errors.institute ? 'border-red-500' : ''}
            />
            {errors.institute && (
              <p className="text-sm text-red-500 mt-1">{errors.institute}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Year *
              </label>
              <Input
                type="text"
                name="startYear"
                value={formData.startYear}
                onChange={handleChange}
                placeholder="2018"
                className={errors.startYear ? 'border-red-500' : ''}
              />
              {errors.startYear && (
                <p className="text-sm text-red-500 mt-1">{errors.startYear}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Year *
              </label>
              <Input
                type="text"
                name="endYear"
                value={formData.endYear}
                onChange={handleChange}
                placeholder="2022"
                className={errors.endYear ? 'border-red-500' : ''}
              />
              {errors.endYear && (
                <p className="text-sm text-red-500 mt-1">{errors.endYear}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Percentage/CGPA (Optional)
              </label>
              <Input
                type="text"
                name="percentage"
                value={formData.percentage}
                onChange={handleChange}
                placeholder="8.5/10 or 3.8/4.0"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CGPA (Optional)
              </label>
              <Input
                type="text"
                name="cgpa"
                value={formData.cgpa}
                onChange={handleChange}
                placeholder="3.8"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Notable achievements, activities, etc."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>

          <Button
            onClick={handleAdd}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </Button>
        </div>

        {/* Education List */}
        {resumeData.education.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Added Education</h3>
            {resumeData.education.map((edu) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{edu.degree} in {edu.fieldOfStudy}</p>
                    <p className="text-sm text-gray-600">{edu.institute}</p>
                    <p className="text-xs text-gray-500">{edu.startYear} - {edu.endYear}</p>
                    {edu.percentage && (
                      <p className="text-xs text-gray-500">Grade: {edu.percentage}</p>
                    )}
                  </div>
                  <button
                    onClick={() => removeEducation(edu.id)}
                    className="p-1 hover:bg-red-50 rounded-lg transition-colors ml-2"
                  >
                    <X className="w-4 h-4 text-red-500" />
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
