interface OptionButtonProps {
  children: React.ReactNode;
  selected: boolean;
  onToggle: () => void;
  className?: string;
}

export default function OptionButton({ children, selected, onToggle, className = '' }: OptionButtonProps) {
  return (
    <button
      onClick={onToggle}
      className={`
        w-full rounded-lg px-5 py-4 shadow transition-all duration-200
        ${selected 
          ? 'bg-yellow-300 text-slate-900 scale-105' 
          : 'bg-slate-50 hover:bg-slate-100 text-slate-700'
        }
        ${className}
      `}
    >
      {children}
    </button>
  );
} 