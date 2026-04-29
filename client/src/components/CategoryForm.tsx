import React, { useState, useEffect } from 'react';
import { Category, SubCategory } from '../types';

interface CategoryFormProps {
  type: 'category' | 'subcategory';
  category?: Category | null;
  subCategory?: SubCategory | null;
  categories: Category[];
  parentCategoryId?: string;
  onSaveCategory: (category: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onSaveSubCategory: (subCategory: Omit<SubCategory, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

const CategoryForm: React.FC<CategoryFormProps> = ({
  type,
  category,
  subCategory,
  categories,
  parentCategoryId,
  onSaveCategory,
  onSaveSubCategory,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    categoryId: parentCategoryId || ''
  });

  useEffect(() => {
    if (type === 'category' && category) {
      setFormData({
        name: category.name,
        description: category.description,
        categoryId: ''
      });
    } else if (type === 'subcategory' && subCategory) {
      setFormData({
        name: subCategory.name,
        description: subCategory.description,
        categoryId: subCategory.categoryId
      });
    } else if (type === 'subcategory' && parentCategoryId) {
      setFormData(prev => ({ ...prev, categoryId: parentCategoryId }));
    }
  }, [type, category, subCategory, parentCategoryId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (type === 'category') {
      onSaveCategory({
        name: formData.name,
        description: formData.description
      });
    } else {
      onSaveSubCategory({
        name: formData.name,
        description: formData.description,
        categoryId: formData.categoryId
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {type === 'category' ? 'Category' : 'Subcategory'} Name *
        </label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={`Enter ${type} name`}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={`Enter ${type} description`}
          required
        />
      </div>

      {type === 'subcategory' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Parent Category *
          </label>
          <select
            name="categoryId"
            value={formData.categoryId}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select a parent category</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
        >
          {category || subCategory ? `Update ${type}` : `Create ${type}`}
        </button>
      </div>
    </form>
  );
};

export default CategoryForm;