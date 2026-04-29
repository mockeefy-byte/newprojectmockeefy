import { LucideIcon } from 'lucide-react';

interface ControlButtonProps {
  icon: LucideIcon;
  active: boolean;
  onClick: () => void;
  label: string;
}

export function ControlButton({ icon: Icon, active, onClick, label }: ControlButtonProps) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`
        p-4 rounded-full transition-all duration-200
        ${active 
          ? 'bg-[#2a2a2a] hover:bg-[#333333] text-white' 
          : 'bg-red-600/90 hover:bg-red-700 text-white'
        }
        hover:scale-105 active:scale-95
        shadow-md hover:shadow-lg
      `}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
}
