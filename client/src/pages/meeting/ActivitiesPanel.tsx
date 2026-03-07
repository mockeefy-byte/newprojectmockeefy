import { X, Gamepad2, Music, Brain, Trophy, Palette, Dice5 } from 'lucide-react';

interface ActivitiesPanelProps {
  onClose: () => void;
}

export function ActivitiesPanel({ onClose }: ActivitiesPanelProps) {
  const activities = [
    { id: 1, title: 'Trivia', icon: Brain, description: 'Test your knowledge', color: 'from-purple-500 to-pink-600' },
    { id: 2, title: 'Pictionary', icon: Palette, description: 'Draw and guess', color: 'from-blue-500 to-cyan-600' },
    { id: 3, title: 'Music Quiz', icon: Music, description: 'Guess the song', color: 'from-green-500 to-teal-600' },
    { id: 4, title: 'Icebreaker', icon: Dice5, description: 'Fun questions', color: 'from-orange-500 to-red-600' },
    { id: 5, title: 'Team Games', icon: Gamepad2, description: 'Play together', color: 'from-indigo-500 to-purple-600' },
    { id: 6, title: 'Leaderboard', icon: Trophy, description: 'View rankings', color: 'from-yellow-500 to-orange-600' },
  ];

  return (
    <div className="fixed right-0 top-0 bottom-0 w-96 bg-[#202020] shadow-2xl z-50 animate-in slide-in-from-right duration-300 border-l border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
        <div>
          <h2 className="text-white">Activities</h2>
          <p className="text-sm text-gray-400">Start an activity with everyone</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-[#2a2a2a] rounded-full transition-all duration-200 hover:scale-105 active:scale-95"
        >
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Activities Grid */}
      <div className="overflow-y-auto h-[calc(100vh-80px)] px-6 py-4">
        <div className="grid gap-3">
          {activities.map((activity) => (
            <button
              key={activity.id}
              className="group flex items-center gap-4 p-4 bg-[#2a2a2a] hover:bg-[#333333] rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
            >
              <div className={`p-3 bg-gradient-to-br ${activity.color} rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                <activity.icon className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-white">{activity.title}</h3>
                <p className="text-sm text-gray-400">{activity.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
