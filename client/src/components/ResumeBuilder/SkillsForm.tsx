import { useState } from 'react';
import { useResume } from '../../context/ResumeContext';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { motion } from 'motion/react';
import { ChevronRight, ChevronLeft, Plus, X } from 'lucide-react';

function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export function SkillsForm() {
  const { resumeData, addSkill, updateSkill, removeSkill, nextStep, prevStep } = useResume();
  const [newSkill, setNewSkill] = useState('');
  const [proficiency, setProficiency] = useState<'beginner' | 'intermediate' | 'advanced' | 'expert'>('intermediate');
  const [errors, setErrors] = useState<string>('');

  const handleAddSkill = () => {
    if (!newSkill.trim()) {
      setErrors('Skill cannot be empty');
      return;
    }

    if (resumeData.skills.some(s => s.name.toLowerCase() === newSkill.toLowerCase())) {
      setErrors('Skill already exists');
      return;
    }

    addSkill({
      id: generateId(),
      name: newSkill,
      proficiency,
    });

    setNewSkill('');
    setProficiency('intermediate');
    setErrors('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddSkill();
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
        <h2 className="text-2xl font-bold text-gray-900">Skills</h2>
        <p className="text-sm text-gray-600 mt-1">
          Add your professional skills and expertise
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Add Skill
          </label>
          <div className="flex gap-2 flex-col xs:flex-row">
            <Input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., React, Python, Project Management"
              className="flex-1"
            />
            <select
              value={proficiency}
              onChange={(e) => setProficiency(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
              <option value="expert">Expert</option>
            </select>
            <Button
              onClick={handleAddSkill}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4" />
              Add
            </Button>
          </div>
          {errors && <p className="text-sm text-red-500">{errors}</p>}
        </div>

        {/* Skills List */}
        <div className="space-y-3">
          {resumeData.skills.length > 0 ? (
            <div className="space-y-2">
              {resumeData.skills.map((skill) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{skill.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{skill.proficiency}</p>
                  </div>
                  <button
                    onClick={() => removeSkill(skill.id)}
                    className="p-1 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove skill"
                  >
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="p-6 border-2 border-dashed border-gray-300 rounded-lg text-center">
              <p className="text-gray-500 text-sm">No skills added yet</p>
            </div>
          )}
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
