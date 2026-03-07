import React, { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Interview, Category, SubCategory, InterviewQuestion } from '../types';

interface InterviewFormProps {
  interview: Interview | null;
  categories: Category[];
  subCategories: SubCategory[];
  onSave: (interview: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

const InterviewForm: React.FC<InterviewFormProps> = ({
  interview,
  categories,
  subCategories,
  onSave,
  onCancel,
  readOnly = false
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    subCategoryId: '',
    duration: 30,
    difficulty: 'medium' as Interview['difficulty'],
    status: 'draft' as Interview['status'],
    questions: [] as InterviewQuestion[]
  });

  const [availableSubCategories, setAvailableSubCategories] = useState<SubCategory[]>([]);

  useEffect(() => {
    if (interview) {
      setFormData({
        title: interview.title,
        description: interview.description,
        categoryId: interview.categoryId,
        subCategoryId: interview.subCategoryId || '',
        duration: interview.duration,
        difficulty: interview.difficulty,
        status: interview.status,
        questions: interview.questions
      });
    }
  }, [interview]);

  useEffect(() => {
    if (formData.categoryId) {
      const filtered = subCategories.filter(sub => sub.categoryId === formData.categoryId);
      setAvailableSubCategories(filtered);
      
      // Reset subcategory if it doesn't belong to the selected category
      if (formData.subCategoryId && !filtered.find(sub => sub.id === formData.subCategoryId)) {
        setFormData(prev => ({ ...prev, subCategoryId: '' }));
      }
    } else {
      setAvailableSubCategories([]);
      setFormData(prev => ({ ...prev, subCategoryId: '' }));
    }
  }, [formData.categoryId, subCategories]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) : value
    }));
  };

  const handleAddQuestion = () => {
    const newQuestion: InterviewQuestion = {
      id: Date.now().toString(),
      question: '',
      expectedAnswer: '',
      points: 1
    };
    setFormData(prev => ({
      ...prev,
      questions: [...prev.questions, newQuestion]
    }));
  };

  const handleQuestionChange = (index: number, field: keyof InterviewQuestion, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  const handleRemoveQuestion = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questions: prev.questions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!readOnly) {
      onSave(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter interview title"
            required
            disabled={readOnly}
          />
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter interview description"
            required
            disabled={readOnly}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={readOnly}
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sub Category
          </label>
          <select
            name="subCategoryId"
            value={formData.subCategoryId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={readOnly || availableSubCategories.length === 0}
          >
            <option value="">Select a subcategory (optional)</option>
            {availableSubCategories.map(subCategory => (
              <option key={subCategory.id} value={subCategory.id}>
                {subCategory.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Duration (minutes) *
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleInputChange}
            min="5"
            max="300"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={readOnly}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Difficulty *
          </label>
          <select
            name="difficulty"
            value={formData.difficulty}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={readOnly}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
            disabled={readOnly}
          >
            <option value="draft">Draft</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>
        </div>
      </div>

      {/* Questions Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Interview Questions</h3>
          {!readOnly && (
            <button
              type="button"
              onClick={handleAddQuestion}
              className="bg-blue-600 text-white px-3 py-1 rounded-lg text-sm hover:bg-blue-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Question
            </button>
          )}
        </div>

        <div className="space-y-4">
          {formData.questions.map((question, index) => (
            <div key={question.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">Question {index + 1}</h4>
                {!readOnly && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(index)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Text *
                  </label>
                  <textarea
                    value={question.question}
                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the interview question"
                    required
                    disabled={readOnly}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Answer (optional)
                  </label>
                  <textarea
                    value={question.expectedAnswer || ''}
                    onChange={(e) => handleQuestionChange(index, 'expectedAnswer', e.target.value)}
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter the expected answer or key points"
                    disabled={readOnly}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points *
                  </label>
                  <input
                    type="number"
                    value={question.points}
                    onChange={(e) => handleQuestionChange(index, 'points', parseInt(e.target.value, 10))}
                    min="1"
                    max="10"
                    className="w-20 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                    disabled={readOnly}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {formData.questions.length === 0 && (
          <p className="text-gray-500 text-center py-8">
            No questions added yet. Click "Add Question" to get started.
          </p>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          {readOnly ? 'Close' : 'Cancel'}
        </button>
        {!readOnly && (
          <button
            type="submit"
            className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            {interview ? 'Update Interview' : 'Create Interview'}
          </button>
        )}
      </div>
    </form>
  );
};

export default InterviewForm;