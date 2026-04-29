import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { Expert } from '../types';

interface ExpertFormProps {
  expert: Expert | null;
  onSave: (expert: Omit<Expert, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

const ExpertForm: React.FC<ExpertFormProps> = ({ expert, onSave, onCancel, readOnly = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    expertise: [] as string[],
    experience: 0,
    company: '',
    position: '',
    bio: '',
    rating: 5,
    totalInterviews: 0,
    status: 'active' as Expert['status'],
    availability: 'available' as Expert['availability'],
    hourlyRate: 0
  });

  const [newExpertise, setNewExpertise] = useState('');

  useEffect(() => {
    if (expert) {
      setFormData({
        name: expert.name,
        email: expert.email,
        phone: expert.phone,
        expertise: expert.expertise,
        experience: expert.experience,
        company: expert.company,
        position: expert.position,
        bio: expert.bio,
        rating: expert.rating,
        totalInterviews: expert.totalInterviews,
        status: expert.status,
        availability: expert.availability,
        hourlyRate: expert.hourlyRate
      });
    }
  }, [expert]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleAddExpertise = () => {
    if (newExpertise.trim() && !formData.expertise.includes(newExpertise.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()]
      }));
      setNewExpertise('');
    }
  };

  const handleRemoveExpertise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name *
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Enter full name"
            required
            disabled={readOnly}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email Address *
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Enter email address"
            required
            disabled={readOnly}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Enter phone number"
            required
            disabled={readOnly}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Company *
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Enter company name"
            required
            disabled={readOnly}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Position *
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            placeholder="Enter position"
            required
            disabled={readOnly}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Experience (Years) *
          </label>
          <input
            type="number"
            name="experience"
            value={formData.experience}
            onChange={handleInputChange}
            min="0"
            max="50"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            required
            disabled={readOnly}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating (1-5) *
          </label>
          <input
            type="number"
            name="rating"
            value={formData.rating}
            onChange={handleInputChange}
            min="1"
            max="5"
            step="0.1"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            required
            disabled={readOnly}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Interviews Conducted
          </label>
          <input
            type="number"
            name="totalInterviews"
            value={formData.totalInterviews}
            onChange={handleInputChange}
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            disabled={readOnly}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hourly Rate ($) *
          </label>
          <input
            type="number"
            name="hourlyRate"
            value={formData.hourlyRate}
            onChange={handleInputChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            required
            disabled={readOnly}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Status *
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            required
            disabled={readOnly}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Availability *
          </label>
          <select
            name="availability"
            value={formData.availability}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
            required
            disabled={readOnly}
          >
            <option value="available">Available</option>
            <option value="busy">Busy</option>
            <option value="unavailable">Unavailable</option>
          </select>
        </div>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Bio
        </label>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
          placeholder="Enter expert's bio and background"
          disabled={readOnly}
        />
      </div>

      {/* Expertise */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Areas of Expertise
        </label>
        
        {!readOnly && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newExpertise}
              onChange={(e) => setNewExpertise(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
              placeholder="Add area of expertise"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddExpertise())}
            />
            <button
              type="button"
              onClick={handleAddExpertise}
              className="bg-cyan-600 text-white px-3 py-2 rounded-lg hover:bg-cyan-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {formData.expertise.map((exp, index) => (
            <span key={index} className="inline-flex items-center px-3 py-1 bg-cyan-100 text-cyan-800 text-sm rounded-full">
              {exp}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveExpertise(index)}
                  className="ml-2 text-cyan-600 hover:text-cyan-800"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>

        {formData.expertise.length === 0 && (
          <p className="text-gray-500 text-sm">No expertise areas added yet.</p>
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
            className="px-6 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-700 hover:to-blue-700 transition-all"
          >
            {expert ? 'Update Expert' : 'Add Expert'}
          </button>
        )}
      </div>
    </form>
  );
};

export default ExpertForm;