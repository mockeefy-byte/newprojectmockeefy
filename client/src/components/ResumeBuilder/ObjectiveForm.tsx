import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Button } from '../ui/button';
import { motion } from 'motion/react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

export function ObjectiveForm() {
  const { resumeData, updateObjective, nextStep, prevStep } = useResume();
  const [objective, setObjective] = useState(resumeData.objective?.objective || '');

  const placeholders = [
    'Motivated software engineer with 5+ years of experience in full-stack development seeking a challenging role to leverage technical expertise and drive innovation.',
    'Results-driven marketing professional with proven track record in digital marketing, brand development, and team leadership. Seeking to contribute strategic expertise to drive business growth.',
    'Detail-oriented project manager with excellent communication and organizational skills. Looking to lead cross-functional teams on strategic initiatives.',
  ];

  const handleApplySuggestion = (suggestion: string) => {
    setObjective(suggestion);
  };

  const handleNext = () => {
    updateObjective(objective);
    nextStep();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Professional Summary</h2>
        <p className="text-sm text-gray-600 mt-1">
          Write a brief summary or leave it blank (optional)
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Professional Objective / Summary (Optional)
          </label>
          <textarea
            value={objective}
            onChange={(e) => setObjective(e.target.value)}
            placeholder="Write a compelling professional summary about yourself..."
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          />
          <p className="text-xs text-gray-500 mt-2">
            {objective.length} characters
          </p>
        </div>

        {/* Quick Suggestions */}
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-700">Quick Suggestions:</p>
          <div className="space-y-2">
            {placeholders.map((placeholder, index) => (
              <button
                key={index}
                onClick={() => handleApplySuggestion(placeholder)}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                <p className="text-sm text-gray-700 line-clamp-2">{placeholder}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm font-medium text-blue-900 mb-2">Tips for writing a strong summary:</p>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Keep it concise (2-3 sentences)</li>
            <li>Highlight your key skills and achievements</li>
            <li>Make it relevant to the job you're applying for</li>
            <li>Use action keywords and metrics</li>
          </ul>
        </div>
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
          onClick={handleNext}
          className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </motion.div>
  );
}
