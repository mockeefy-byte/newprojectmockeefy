import React, { useState, useEffect } from 'react';
import { Plus, CreditCard as Edit, Trash2, FolderTree, Tag } from 'lucide-react';
import { Category, SubCategory } from '../types';
import { dataService } from '../services/dataService';
import CategoryForm from './CategoryForm';
import Modal from './Modal';
import Toast from './Toast';
import { Toast as ToastType } from '../types';

const CategoriesManager: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<SubCategory | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'category' | 'subcategory'>('category');
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [toast, setToast] = useState<ToastType | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setCategories(dataService.getCategories());
    setSubCategories(dataService.getSubCategories());
  };

  const showToast = (message: string, type: ToastType['type']) => {
    setToast({
      id: Date.now().toString(),
      type,
      message
    });
  };

  // Category handlers
  const handleCreateCategory = () => {
    setSelectedCategory(null);
    setModalType('category');
    setFormMode('create');
    setIsModalOpen(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setModalType('category');
    setFormMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteCategory = (category: Category) => {
    if (window.confirm(`Are you sure you want to delete "${category.name}"? This will also delete all its subcategories.`)) {
      const success = dataService.deleteCategory(category.id);
      if (success) {
        loadData();
        showToast('Category deleted successfully', 'success');
      } else {
        showToast('Failed to delete category', 'error');
      }
    }
  };

  const handleSaveCategory = (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (formMode === 'edit' && selectedCategory) {
        dataService.updateCategory(selectedCategory.id, categoryData);
        showToast('Category updated successfully', 'success');
      } else {
        dataService.createCategory(categoryData);
        showToast('Category created successfully', 'success');
      }
      loadData();
      setIsModalOpen(false);
    } catch (error) {
      showToast('Failed to save category', 'error');
    }
  };

  // SubCategory handlers
  const handleCreateSubCategory = (parentCategoryId?: string) => {
    setSelectedSubCategory(null);
    setSelectedCategory(parentCategoryId ? categories.find(c => c.id === parentCategoryId) || null : null);
    setModalType('subcategory');
    setFormMode('create');
    setIsModalOpen(true);
  };

  const handleEditSubCategory = (subCategory: SubCategory) => {
    setSelectedSubCategory(subCategory);
    setSelectedCategory(categories.find(c => c.id === subCategory.categoryId) || null);
    setModalType('subcategory');
    setFormMode('edit');
    setIsModalOpen(true);
  };

  const handleDeleteSubCategory = (subCategory: SubCategory) => {
    if (window.confirm(`Are you sure you want to delete "${subCategory.name}"?`)) {
      const success = dataService.deleteSubCategory(subCategory.id);
      if (success) {
        loadData();
        showToast('Subcategory deleted successfully', 'success');
      } else {
        showToast('Failed to delete subcategory', 'error');
      }
    }
  };

  const handleSaveSubCategory = (subCategoryData: Omit<SubCategory, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (formMode === 'edit' && selectedSubCategory) {
        dataService.updateSubCategory(selectedSubCategory.id, subCategoryData);
        showToast('Subcategory updated successfully', 'success');
      } else {
        dataService.createSubCategory(subCategoryData);
        showToast('Subcategory created successfully', 'success');
      }
      loadData();
      setIsModalOpen(false);
    } catch (error) {
      showToast('Failed to save subcategory', 'error');
    }
  };

  const getSubCategoriesByCategory = (categoryId: string) => {
    return subCategories.filter(sub => sub.categoryId === categoryId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600 mt-1">Organize your interviews with categories and subcategories</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => handleCreateSubCategory()}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors flex items-center"
          >
            <Tag className="w-4 h-4 mr-2" />
            Add Subcategory
          </button>
          <button
            onClick={handleCreateCategory}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </button>
        </div>
      </div>

      {/* Categories List */}
      <div className="space-y-6">
        {categories.map((category) => {
          const categorySubCategories = getSubCategoriesByCategory(category.id);
          
          return (
            <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-200">
              {/* Category Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FolderTree className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-gray-600 text-sm">{category.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {categorySubCategories.length} subcategories
                  </span>
                  <button
                    onClick={() => handleCreateSubCategory(category.id)}
                    className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Add subcategory"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditCategory(category)}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    title="Edit category"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteCategory(category)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Subcategories */}
              {categorySubCategories.length > 0 ? (
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categorySubCategories.map((subCategory) => (
                      <div key={subCategory.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center mb-2">
                              <Tag className="w-4 h-4 text-emerald-600 mr-2" />
                              <h4 className="font-medium text-gray-900">{subCategory.name}</h4>
                            </div>
                            <p className="text-sm text-gray-600">{subCategory.description}</p>
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <button
                              onClick={() => handleEditSubCategory(subCategory)}
                              className="p-1 text-gray-400 hover:text-indigo-600 rounded transition-colors"
                            >
                              <Edit className="w-3 h-3" />
                            </button>
                            <button
                              onClick={() => handleDeleteSubCategory(subCategory)}
                              className="p-1 text-gray-400 hover:text-red-600 rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Tag className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-gray-500 mb-3">No subcategories yet</p>
                  <button
                    onClick={() => handleCreateSubCategory(category.id)}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Create the first subcategory
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FolderTree className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-600 mb-4">Create your first category to organize interviews</p>
          <button
            onClick={handleCreateCategory}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
          >
            Create Your First Category
          </button>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === 'category' 
            ? (formMode === 'create' ? 'Create Category' : 'Edit Category')
            : (formMode === 'create' ? 'Create Subcategory' : 'Edit Subcategory')
        }
      >
        <CategoryForm
          type={modalType}
          category={modalType === 'category' ? selectedCategory : null}
          subCategory={modalType === 'subcategory' ? selectedSubCategory : null}
          categories={categories}
          parentCategoryId={selectedCategory?.id}
          onSaveCategory={handleSaveCategory}
          onSaveSubCategory={handleSaveSubCategory}
          onCancel={() => setIsModalOpen(false)}
        />
      </Modal>

      {toast && (
        <Toast
          toast={toast}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default CategoriesManager;