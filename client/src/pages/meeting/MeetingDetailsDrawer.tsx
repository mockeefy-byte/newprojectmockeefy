import { X, Calendar, Clock, Users, Shield } from 'lucide-react';
import { useState } from 'react';

interface MeetingDetailsDrawerProps {
  onClose: () => void;
}

export function MeetingDetailsDrawer({ onClose }: MeetingDetailsDrawerProps) {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        onClick={handleClose}
        className={`fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          isClosing ? 'animate-out fade-out' : 'animate-in fade-in'
        }`}
      />
      
      {/* Drawer */}
      <div className={`fixed right-6 top-20 w-96 bg-[#202020] shadow-2xl z-50 rounded-2xl border border-gray-700 transition-all duration-300 ${
        isClosing ? 'animate-out slide-out-to-top' : 'animate-in slide-in-from-top'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <h2 className="text-white">Meeting details</h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[#2a2a2a] rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Meeting Info */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Date</p>
                <p className="text-white">Monday, December 8, 2025</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Time</p>
                <p className="text-white">10:30 AM - 11:30 AM</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm text-gray-400">Host</p>
                <p className="text-white">You</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-700" />

          {/* Security Info */}
          <div className="flex items-start gap-3 p-3 bg-[#2a2a2a] rounded-lg">
            <Shield className="w-5 h-5 text-green-500 mt-0.5" />
            <div>
              <p className="text-white text-sm">Secure meeting</p>
              <p className="text-xs text-gray-400 mt-1">
                This meeting is protected with encryption
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}