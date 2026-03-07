import React, { useState, useEffect } from 'react';
import { Plus, Search, CreditCard as Edit, Trash2, Eye, GraduationCap, Phone, Mail, Building, Star } from 'lucide-react';
import { Expert } from '../types';
import { dataService } from '../services/dataService';
import ExpertForm from './ExpertForm';
import Modal from './Modal';
import Toast from './Toast';
import { Toast as ToastType } from '../types';

const ExpertsManager: React.FC = () => {
  const [experts, setExperts] = useState<Expert[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [toast, setToast] = useState<ToastType | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setExperts(dataService.getExperts());
  };

  const filteredExperts = experts.filter(expert =>
    expert.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expert.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expert.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expert.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expert.expertise.some(exp => exp.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCreateExpert = () => {
    setSelectedExpert(null);
    setModalType('create');
    setIsModalOpen(true);
  };

  const handleEditExpert = (expert: Expert) => {
    setSelectedExpert(expert);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleViewExpert = (expert: Expert) => {
    setSelectedExpert(expert);
    setModalType('view');
    setIsModalOpen(true);
  };

  const handleDeleteExpert = (expert: Expert) => {
    if (window.confirm(`Are you sure you want to delete ${expert.name}?`)) {
      const success = dataService.deleteExpert(expert.id);
      if (success) {
        loadData();
        showToast('Expert deleted successfully', 'success');
      } else {
        showToast('Failed to delete expert', 'error');
      }
    }
  };

  const handleSaveExpert = (expertData: Omit<Expert, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (modalType === 'edit' && selectedExpert) {
        dataService.updateExpert(selectedExpert.id, expertData);
        showToast('Expert updated successfully', 'success');
      } else {
        dataService.createExpert(expertData);
        showToast('Expert created successfully', 'success');
      }
      loadData();
      setIsModalOpen(false);
    } catch (error) {
      showToast('Failed to save expert', 'error');
    }
  };

  const showToast = (message: string, type: ToastType['type']) => {
    setToast({
      id: Date.now().toString(),
      type,
      message
    });
  };

  const getStatusColor = (status: Expert['status']) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getAvailabilityColor = (availability: Expert['availability']) => {
    switch (availability) {
      case 'available': return 'bg-green-100 text-green-800';
      case 'busy': return 'bg-yellow-100 text-yellow-800';
      case 'unavailable': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Experts Management</h1>
          <p className="text-gray-600 mt-1">Manage subject matter experts and interviewers</p>
        </div>
        <button
          onClick={handleCreateExpert}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-cyan-700 hover:to-blue-700 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-all flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Expert
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search experts..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
        />
      </div>

      {/* Experts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExperts.map((expert) => (
          <div key={expert.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-cyan-100 rounded-full flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-cyan-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{expert.name}</h3>
                    <p className="text-sm text-gray-600">{expert.position}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleViewExpert(expert)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditExpert(expert)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteExpert(expert)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="w-4 h-4 mr-2" />
                  {expert.company}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {expert.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {expert.phone}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {renderStars(expert.rating)}
                    <span className="ml-2 text-sm text-gray-600">({expert.rating}/5)</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    ${expert.hourlyRate}/hr
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">
                    {expert.experience} years • {expert.totalInterviews} interviews
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(expert.status)}`}>
                    {expert.status}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getAvailabilityColor(expert.availability)}`}>
                    {expert.availability}
                  </span>
                </div>
                
                {expert.expertise.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {expert.expertise.slice(0, 3).map((exp, index) => (
                        <span key={index} className="px-2 py-1 bg-cyan-50 text-cyan-700 text-xs rounded-full">
                          {exp}
                        </span>
                      ))}
                      {expert.expertise.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{expert.expertise.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredExperts.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <GraduationCap className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No experts found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first expert'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreateExpert}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:from-cyan-700 hover:to-blue-700 transition-all"
            >
              Add Your First Expert
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === 'create' ? 'Add Expert' :
          modalType === 'edit' ? 'Edit Expert' :
          'Expert Details'
        }
      >
        <ExpertForm
          expert={selectedExpert}
          onSave={handleSaveExpert}
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

export default ExpertsManager;