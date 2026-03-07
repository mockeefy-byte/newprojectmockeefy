import React, { useState, useEffect } from 'react';
import { Plus, Search, CreditCard as Edit, Trash2, Eye, UserCheck, Phone, Mail, Building } from 'lucide-react';
import { HR } from '../types';
import { dataService } from '../services/dataService';
import HRForm from './HRForm';
import Modal from './Modal';
import Toast from './Toast';
import { Toast as ToastType } from '../types';

const HRManager: React.FC = () => {
  const [hrs, setHRs] = useState<HR[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedHR, setSelectedHR] = useState<HR | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'create' | 'edit' | 'view'>('create');
  const [toast, setToast] = useState<ToastType | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setHRs(dataService.getHRs());
  };

  const filteredHRs = hrs.filter(hr =>
    hr.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hr.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hr.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hr.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateHR = () => {
    setSelectedHR(null);
    setModalType('create');
    setIsModalOpen(true);
  };

  const handleEditHR = (hr: HR) => {
    setSelectedHR(hr);
    setModalType('edit');
    setIsModalOpen(true);
  };

  const handleViewHR = (hr: HR) => {
    setSelectedHR(hr);
    setModalType('view');
    setIsModalOpen(true);
  };

  const handleDeleteHR = (hr: HR) => {
    if (window.confirm(`Are you sure you want to delete ${hr.name}?`)) {
      const success = dataService.deleteHR(hr.id);
      if (success) {
        loadData();
        showToast('HR deleted successfully', 'success');
      } else {
        showToast('Failed to delete HR', 'error');
      }
    }
  };

  const handleSaveHR = (hrData: Omit<HR, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      if (modalType === 'edit' && selectedHR) {
        dataService.updateHR(selectedHR.id, hrData);
        showToast('HR updated successfully', 'success');
      } else {
        dataService.createHR(hrData);
        showToast('HR created successfully', 'success');
      }
      loadData();
      setIsModalOpen(false);
    } catch (error) {
      showToast('Failed to save HR', 'error');
    }
  };

  const showToast = (message: string, type: ToastType['type']) => {
    setToast({
      id: Date.now().toString(),
      type,
      message
    });
  };

  const getStatusColor = (status: HR['status']) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">HR Management</h1>
          <p className="text-gray-600 mt-1">Manage HR personnel and their information</p>
        </div>
        <button
          onClick={handleCreateHR}
          className="mt-4 sm:mt-0 bg-gradient-to-r from-pink-600 to-rose-600 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-700 hover:to-rose-700 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 transition-all flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add HR Personnel
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search HR personnel..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
        />
      </div>

      {/* HR Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHRs.map((hr) => (
          <div key={hr.id} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center">
                    <UserCheck className="w-6 h-6 text-pink-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-lg font-semibold text-gray-900">{hr.name}</h3>
                    <p className="text-sm text-gray-600">{hr.position}</p>
                  </div>
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => handleViewHR(hr)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEditHR(hr)}
                    className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteHR(hr)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center text-sm text-gray-600">
                  <Building className="w-4 h-4 mr-2" />
                  {hr.department}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {hr.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {hr.phone}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">
                    {hr.experience} years experience
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(hr.status)}`}>
                    {hr.status}
                  </span>
                </div>

                {hr.specialization.length > 0 && (
                  <div className="mt-3">
                    <div className="flex flex-wrap gap-1">
                      {hr.specialization.slice(0, 3).map((spec, index) => (
                        <span key={index} className="px-2 py-1 bg-pink-50 text-pink-700 text-xs rounded-full">
                          {spec}
                        </span>
                      ))}
                      {hr.specialization.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{hr.specialization.length - 3} more
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

      {filteredHRs.length === 0 && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserCheck className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No HR personnel found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm ? 'Try adjusting your search terms' : 'Get started by adding your first HR personnel'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreateHR}
              className="bg-gradient-to-r from-pink-600 to-rose-600 text-white px-6 py-3 rounded-lg font-medium hover:from-pink-700 hover:to-rose-700 transition-all"
            >
              Add Your First HR Personnel
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === 'create' ? 'Add HR Personnel' :
            modalType === 'edit' ? 'Edit HR Personnel' :
              'HR Personnel Details'
        }
      >
        <HRForm
          hr={selectedHR}
          onSave={handleSaveHR}
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

export default HRManager;