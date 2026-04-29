import React, { useState, useEffect } from 'react';
import { Plus, Search, CreditCard as Edit, Trash2, Eye } from 'lucide-react';
import { Interview, Category, SubCategory } from '../types';
import { dataService } from '../services/dataService';
import InterviewForm from './InterviewForm';
import Modal from './Modal';
import Toast from './Toast';
import { Toast as ToastType } from '../types';

const InterviewsManager: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInterview, setSelectedInterview] = useState<Interview | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [toast, setToast] = useState<ToastType | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setInterviews(dataService.getInterviews());
    setCategories(dataService.getCategories());
    setSubCategories(dataService.getSubCategories());
  };

  const filteredInterviews = interviews.filter(interview =>
    interview.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interview.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateInterview = () => {
    setSelectedInterview(null);
    setModalType('create');
    setIsModalOpen(true);
  };

  const handleEditInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleViewInterview = (interview: Interview) => {
    setSelectedInterview(interview);
    setModalType('view');
    setIsModalOpen(true);
  };

  const handleDeleteInterview = (interview: Interview) => {
    if (window.confirm('Are you sure you want to delete this interview?')) {
      const success = dataService.deleteInterview(interview.id);
      if (success) {
        loadData();
        showToast('Interview deleted successfully', 'success');
      } else {
        showToast('Failed to delete interview', 'error');
      }
    }
  };

  const handleSaveInterview = (interviewData: Omit<Interview, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (modalType === 'edit' && selectedInterview) {
        dataService.updateInterview(selectedInterview.id, interviewData);
        showToast('Interview updated successfully', 'success');
      } else {
        dataService.createInterview(interviewData);
        showToast('Interview created successfully', 'success');
      }
      loadData();
      setIsModalOpen(false);
    } catch (error) {
      showToast('Failed to save interview', 'error');
    }
  };

  const showToast = (message: string, type: ToastType['type']) => {
    setToast({
      id: Date.now().toString(),
      type,
      message
    });
  };

  const getCategoryName = (categoryId: string) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'Unknown';
  };

  const getSubCategoryName = (subCategoryId?: string) => {
    if (!subCategoryId) return '';
    const subCategory = subCategories.find(sc => sc.id === subCategoryId);
    return subCategory ? subCategory.name : '';
  };

  const getDifficultyColor = (difficulty: Interview['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: Interview['status']) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interview Management</h1>
          <p className="text-gray-600 mt-1">Create and manage mock interviews</p>
        </div>
        <button
          onClick={handleCreateInterview}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Interview
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search interviews..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Interviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInterviews.map((interview) => (
          <div key={interview.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{interview.title}</h3>
                <div className="flex space-x-1 ml-2">
                  <button
                    onClick={() => handleViewInterview(interview)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditInterview(interview)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteInterview(interview)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{interview.description}</p>

              <div className="space-y-2 mb-4">
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Category:</span> {getCategoryName(interview.categoryId)}
                </div>
                {interview.subCategoryId && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Subcategory:</span> {getSubCategoryName(interview.subCategoryId)}
                  </div>
                )}
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Duration:</span> {interview.duration} minutes
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">Questions:</span> {interview.questions.length}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(interview.difficulty)}`}>
                    {interview.difficulty}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(interview.status)}`}>
                    {interview.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredInterviews.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No interviews found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first interview'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreateInterview}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              Create Your First Interview
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === 'create' ? 'Create Interview' :
          modalType === 'edit' ? 'Edit Interview' :
          'Interview Details'
        }
      >
        <InterviewForm
          interview={selectedInterview}
          categories={categories}
          subCategories={subCategories}
          onSave={handleSaveInterview}
          onCancel={() => setIsModalOpen(false)}
          readOnly={modalType === 'view'}
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

export default InterviewsManager;