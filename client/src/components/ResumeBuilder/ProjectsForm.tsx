import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { motion } from 'motion/react';
import { ChevronRight, ChevronLeft, Plus, X } from 'lucide-react';

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

interface ProjectFormData {
  id: string;
  projectName: string;
  techStack: string[];
  description: string;
  githubLink?: string;
  liveLink?: string;
  startDate?: string;
  endDate?: string;
}

const emptyProject: ProjectFormData = {
  id: '',
  projectName: '',
  techStack: [],
  description: '',
  githubLink: '',
  liveLink: '',
  startDate: '',
  endDate: '',
};

export function ProjectsForm() {
  const { resumeData, addProject, removeProject, nextStep, prevStep } = useResume();
  const [formData, setFormData] = useState<ProjectFormData>({ ...emptyProject, id: generateId() });
  const [currentTech, setCurrentTech] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const addTech = () => {
    if (!currentTech.trim()) return;
    
    if (formData.techStack.some(t => t.toLowerCase() === currentTech.toLowerCase())) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      techStack: [...prev.techStack, currentTech.trim()],
    }));
    setCurrentTech('');
  };

  const removeTech = (index: number) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.filter((_, i) => i !== index),
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.projectName.trim()) {
      newErrors.projectName = 'Project name is required';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Project description is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAdd = () => {
    if (validateForm()) {
      addProject(formData);
      setFormData({ ...emptyProject, id: generateId() });
      setCurrentTech('');
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
        <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
        <p className="text-sm text-gray-600 mt-1">
          Showcase your best work and side projects
        </p>
      </div>

      <div className="space-y-4">
        {/* Form Inputs */}
        <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name *
            </label>
            <Input
              type="text"
              name="projectName"
              value={formData.projectName}
              onChange={handleChange}
              placeholder="Project Name"
              className={errors.projectName ? 'border-red-500' : ''}
            />
            {errors.projectName && (
              <p className="text-sm text-red-500 mt-1">{errors.projectName}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project, its purpose, and impact"
              rows={3}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm ${
                errors.description ? 'border-red-500' : ''
              }`}
            />
            {errors.description && (
              <p className="text-sm text-red-500 mt-1">{errors.description}</p>
            )}
          </div>

          {/* Tech Stack */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tech Stack
            </label>
            <div className="flex gap-2">
              <Input
                type="text"
                value={currentTech}
                onChange={(e) => setCurrentTech(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTech();
                  }
                }}
                placeholder="React, Node.js, MongoDB... (Press Enter)"
              />
              <Button
                onClick={addTech}
                variant="outline"
                className="whitespace-nowrap"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {/* Tech List */}
            {formData.techStack.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {formData.techStack.map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                  >
                    {tech}
                    <button
                      onClick={() => removeTech(index)}
                      className="hover:bg-blue-200 rounded-full"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date (Optional)
              </label>
              <Input
                type="month"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date (Optional)
              </label>
              <Input
                type="month"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Link (Optional)
            </label>
            <Input
              type="url"
              name="githubLink"
              value={formData.githubLink}
              onChange={handleChange}
              placeholder="https://github.com/..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Live Link (Optional)
            </label>
            <Input
              type="url"
              name="liveLink"
              value={formData.liveLink}
              onChange={handleChange}
              placeholder="https://project-demo.com"
            />
          </div>

          <Button
            onClick={handleAdd}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </Button>
        </div>

        {/* Projects List */}
        {resumeData.projects.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-700">Added Projects</h3>
            {resumeData.projects.map((project) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3 bg-white border border-gray-200 rounded-lg"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{project.projectName}</p>
                    <p className="text-sm text-gray-600 line-clamp-2">{project.description}</p>
                    {project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {project.techStack.map((tech, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded"
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => removeProject(project.id)}
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
