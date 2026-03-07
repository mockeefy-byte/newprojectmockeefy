import { Settings, Maximize, Volume2, HelpCircle } from 'lucide-react';
import { useState } from 'react';

interface MoreOptionsSheetProps {
  onClose: () => void;
}

export function MoreOptionsSheet({ onClose }: MoreOptionsSheetProps) {
  const [isClosing, setIsClosing] = useState(false);
  
  const options = [
    { id: 1, title: 'Settings', icon: Settings, description: 'Audio and video settings' },
    { id: 2, title: 'Full screen', icon: Maximize, description: 'Enter full screen mode' },
    { id: 3, title: 'Audio settings', icon: Volume2, description: 'Speaker and microphone' },
    { id: 4, title: 'Help & feedback', icon: HelpCircle, description: 'Get help or send feedback' },
  ];

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
      
      {/* Bottom Sheet */}
      <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ${
        isClosing ? 'animate-out slide-out-to-bottom' : 'animate-in slide-in-from-bottom'
      }`}>
        <div className="bg-[#202020] rounded-t-3xl shadow-2xl max-w-2xl mx-auto border-t border-gray-700">
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-12 h-1 bg-gray-600 rounded-full" />
          </div>

          {/* Header */}
          <div className="px-6 py-3">
            <h2 className="text-white">More options</h2>
          </div>

          {/* Options */}
          <div className="px-6 pb-6">
            <div className="grid gap-2">
              {options.map((option) => (
                <button
                  key={option.id}
                  onClick={onClose}
                  className="flex items-center gap-4 p-3 hover:bg-[#2a2a2a] rounded-xl transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
                >
                  <div className="p-2 bg-[#2a2a2a] rounded-lg">
                    <option.icon className="w-5 h-5 text-gray-300" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-white text-sm">{option.title}</p>
                    <p className="text-xs text-gray-400">{option.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}