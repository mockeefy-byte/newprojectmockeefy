import { X, ChevronDown, Monitor } from 'lucide-react';
import { useState } from 'react';

interface ScreenShareModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

export function ScreenShareModal({ onClose, onConfirm }: ScreenShareModalProps) {
  const [selectedOption, setSelectedOption] = useState('Share your display');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const dropdownOptions = ['Share your display', 'Share your window'];

  const screenOptions = [
    { id: 1, title: 'Entire Screen', type: 'screen' },
    { id: 2, title: 'Window 1', type: 'window' },
    { id: 3, title: 'Window 2', type: 'window' },
    { id: 4, title: 'Chrome Tab', type: 'tab' },
    { id: 5, title: 'Application', type: 'window' },
    { id: 6, title: 'Browser', type: 'window' },
  ];

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-200 ${
      isClosing ? 'animate-out fade-out' : 'animate-in fade-in'
    }`}>
      <div className={`bg-[#202020] rounded-lg shadow-2xl w-full max-w-3xl mx-4 transition-all duration-200 ${
        isClosing ? 'animate-out zoom-out-95' : 'animate-in zoom-in-95'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-700">
          <h2 className="text-white text-lg">Capture with Video call</h2>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-[#2a2a2a] rounded transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Dropdown */}
          <div className="mb-4">
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded border border-gray-600 transition-colors"
              >
                <span className="text-sm">{selectedOption}</span>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#2a2a2a] border border-gray-600 rounded shadow-lg z-10">
                  {dropdownOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setSelectedOption(option);
                        setIsDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#333333] transition-colors"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail Grid */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            {screenOptions.map((option) => (
              <button
                key={option.id}
                onClick={handleClose}
                className="group relative flex flex-col items-center gap-2 p-4 bg-[#2a2a2a] hover:bg-[#333333] rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] border-2 border-transparent hover:border-blue-500"
              >
                {/* Thumbnail placeholder */}
                <div className="w-full aspect-video bg-gradient-to-br from-gray-700 to-gray-800 rounded flex items-center justify-center">
                  <Monitor className="w-8 h-8 text-gray-500" />
                </div>
                {/* Label */}
                <span className="text-xs text-gray-300 text-center">{option.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-5 py-2 bg-[#2a2a2a] hover:bg-[#333333] text-white rounded transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              handleClose();
            }}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all duration-200 hover:scale-105 active:scale-95 text-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}