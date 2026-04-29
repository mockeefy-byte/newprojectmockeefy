import React, { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { HR } from '../types';

interface HRFormProps {
  hr: HR | null;
  onSave: (hr: Omit<HR, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  readOnly?: boolean;
}

const HRForm: React.FC<HRFormProps> = ({ hr, onSave, onCancel, readOnly = false }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    experience: 0,
    specialization: [] as string[],
    status: 'active' as HR['status'],
    joinDate: ''
  });

  const [newSpecialization, setNewSpecialization] = useState('');

  useEffect(() => {
    if (hr) {
      setFormData({
        name: hr.name,
        email: hr.email,
        phone: hr.phone,
        department: hr.department,
        position: hr.position,
        experience: hr.experience,
        specialization: hr.specialization,
        status: hr.status,
        joinDate: hr.joinDate
      });
    }
  }, [hr]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseInt(value, 10) || 0 : value
    }));
  };

  const handleAddSpecialization = () => {
    if (newSpecialization.trim() && !formData.specialization.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specialization: [...prev.specialization, newSpecialization.trim()]
      }));
      setNewSpecialization('');
    }
  };

  const handleRemoveSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specialization: prev.specialization.filter((_, i) => i !== index)
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Enter phone number"
            required
            disabled={readOnly}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Department *
          </label>
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            placeholder="Enter department"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            required
            disabled={readOnly}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Join Date *
          </label>
          <input
            type="date"
            name="joinDate"
            value={formData.joinDate}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            required
            disabled={readOnly}
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Specializations */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Specializations
        </label>
        
        {!readOnly && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSpecialization}
              onChange={(e) => setNewSpecialization(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              placeholder="Add specialization"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSpecialization())}
            />
            <button
              type="button"
              onClick={handleAddSpecialization}
              className="bg-pink-600 text-white px-3 py-2 rounded-lg hover:bg-pink-700 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          {formData.specialization.map((spec, index) => (
            <span key={index} className="inline-flex items-center px-3 py-1 bg-pink-100 text-pink-800 text-sm rounded-full">
              {spec}
              {!readOnly && (
                <button
                  type="button"
                  onClick={() => handleRemoveSpecialization(index)}
                  className="ml-2 text-pink-600 hover:text-pink-800"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </span>
          ))}
        </div>

        {formData.specialization.length === 0 && (
          <p className="text-gray-500 text-sm">No specializations added yet.</p>
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
            className="px-6 py-2 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-lg hover:from-pink-700 hover:to-rose-700 transition-all"
          >
            {hr ? 'Update HR Personnel' : 'Add HR Personnel'}
          </button>
        )}
      </div>
    </form>
  );
};

export default HRForm;