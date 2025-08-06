interface QuestionCardProps {
  children: React.ReactNode;
  className?: string;
}

export default function QuestionCard({ children, className = '' }: QuestionCardProps) {
  return (
    <div className={`max-w-xl mx-auto p-8 bg-white rounded-xl shadow-lg border-2 border-yellow-400 ${className}`}>
      {children}
    </div>
  );
} 