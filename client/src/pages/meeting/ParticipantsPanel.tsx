import { X, Mic, MicOff, Video, VideoOff, MoreVertical, Crown } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Participant {
  id: number;
  name: string;
  micEnabled?: boolean;
  cameraEnabled?: boolean;
}

interface ParticipantsPanelProps {
  participants: Participant[];
  onClose: () => void;
}

export function ParticipantsPanel({ participants, onClose }: ParticipantsPanelProps) {
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
        className={`fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-200 ${
          isClosing ? 'animate-out fade-out' : 'animate-in fade-in'
        }`}
      />
      
      {/* Panel */}
      <div className={`fixed right-0 top-0 bottom-0 w-96 bg-[#202020] shadow-2xl z-50 border-l border-gray-700 transition-transform duration-300 ${
        isClosing ? 'animate-out slide-out-to-right' : 'animate-in slide-in-from-right'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div>
            <h2 className="text-white">Participants</h2>
            <p className="text-sm text-gray-400">{participants.length} in call</p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[#2a2a2a] rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Participants List */}
        <div className="overflow-y-auto h-[calc(100vh-80px)]">
          <div className="px-6 py-4">
            {participants.map((participant, index) => (
              <div
                key={participant.id}
                className="flex items-center justify-between py-3 hover:bg-[#2a2a2a] px-3 rounded-lg transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-sm">
                      {participant.name.charAt(0)}
                    </span>
                  </div>
                  
                  {/* Name */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-sm">{participant.name}</span>
                      {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2">
                  {participant.micEnabled === false ? (
                    <div className="p-1.5 bg-red-600 rounded-full">
                      <MicOff className="w-3.5 h-3.5 text-white" />
                    </div>
                  ) : (
                    <div className="p-1.5">
                      <Mic className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  )}
                  
                  {participant.cameraEnabled === false ? (
                    <div className="p-1.5 bg-gray-600 rounded-full">
                      <VideoOff className="w-3.5 h-3.5 text-white" />
                    </div>
                  ) : (
                    <div className="p-1.5">
                      <Video className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                  )}

                  <button className="p-1.5 hover:bg-[#333333] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200">
                    <MoreVertical className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}