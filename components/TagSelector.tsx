'use client';

interface TagSelectorProps {
  tag: string;
  isSelected: boolean;
  onToggle: () => void;
  icon?: string;
  color?: string;
}

export default function TagSelector({ tag, isSelected, onToggle, icon, color }: TagSelectorProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        px-4 py-2 rounded-xl font-medium transition-all duration-200 transform
        ${isSelected 
          ? 'bg-yellow-400 text-gray-800 scale-105 shadow-lg' 
          : 'bg-white/20 text-white hover:bg-white/30 hover:scale-102'
        }
      `}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {tag}
    </button>
  );
} 