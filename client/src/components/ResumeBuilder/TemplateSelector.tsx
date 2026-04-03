import { useResume } from '../../context/ResumeContext';
import { TemplateType } from '../../types/resume';
import { ModernResumeTemplate } from './Templates/ModernTemplate';
import { FresherTemplate } from './Templates/FresherTemplate';
import { ExperiencedTemplate } from './Templates/ExperiencedTemplate';
import { MinimalATSTemplate } from './Templates/MinimalATSTemplate';
import { motion } from 'motion/react';
import { ChevronRight, Download, Printer } from 'lucide-react';
import { Button } from '../ui/button';

export function TemplateSelector() {
  const { selectedTemplate, setSelectedTemplate, nextStep } = useResume();

  const templates: Array<{
    id: TemplateType;
    name: string;
    description: string;
  }> = [
    {
      id: 'modern',
      name: 'Modern',
      description: 'Clean, contemporary design with color highlights. Great for most industries.',
    },
    {
      id: 'fresher',
      name: 'Fresher',
      description: 'Perfect for first-time job seekers. Emphasizes education and skills.',
    },
    {
      id: 'experienced',
      name: 'Experienced',
      description: 'Professional layout focused on career progression. Ideal for senior roles.',
    },
    {
      id: 'minimal',
      name: 'Minimal ATS',
      description: 'Text-only, ATS-friendly format. Optimized for applicant tracking systems.',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Choose Your Template</h2>
        <p className="text-sm text-gray-600 mt-1">
          Select a template that best matches your professional style
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map(template => (
          <motion.div
            key={template.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setSelectedTemplate(template.id)}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              selectedTemplate === template.id
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-blue-300'
            }`}
          >
            <h3 className="font-semibold text-gray-900">{template.name}</h3>
            <p className="text-sm text-gray-600 mt-1">{template.description}</p>
            {selectedTemplate === template.id && (
              <div className="mt-3 inline-block px-3 py-1 bg-blue-600 text-white text-xs rounded-full">
                Selected
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="flex justify-end pt-6">
        <Button
          onClick={nextStep}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          Continue to Download
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

export function PreviewPane() {
  const { selectedTemplate } = useResume();

  return (
    <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
      <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex justify-between items-center">
        <h3 className="font-semibold text-gray-900">Preview ({selectedTemplate})</h3>
      </div>
      <div className="overflow-auto p-4" style={{ height: 'calc(100vh - 300px)' }}>
        <div className="bg-white rounded shadow">
          {selectedTemplate === 'modern' && <ModernResumeTemplate />}
          {selectedTemplate === 'fresher' && <FresherTemplate />}
          {selectedTemplate === 'experienced' && <ExperiencedTemplate />}
          {selectedTemplate === 'minimal' && <MinimalATSTemplate />}
        </div>
      </div>
    </div>
  );
}
