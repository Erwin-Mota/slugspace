'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useSurvey } from '@/lib/SurveyContext';
import QuestionCard from '@/components/QuestionCard';
import OptionButton from '@/components/OptionButton';
import ProgressBar from '@/components/ProgressBar';
import questions from '@/data/questions.json';

interface Option {
  value: string;
  tags: string[];
}

interface Question {
  id: string;
  text: string;
  options: Option[];
}

function getQuestion(n: number): Question | null {
  return questions[n - 1] || null;
}

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const { currentQuestion, addTags, next, prev } = useSurvey();
  
  const questionId = Number(params.id);
  const question = getQuestion(questionId);
  
  const [selectedOptions, setSelectedOptions] = useState<Set<number>>(new Set());
  const [isShaking, setIsShaking] = useState(false);
  
  // Reset selections when question changes
  useEffect(() => {
    setSelectedOptions(new Set());
  }, [questionId]);
  
  // Redirect to result if no question found
  if (!question) {
    router.push('/result');
    return null;
  }
  
  const handleOptionToggle = (index: number) => {
    setSelectedOptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };
  
  const handleNext = () => {
    if (selectedOptions.size === 0) {
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 500);
      // Simple toast
      alert('Pick at least one option!');
      return;
    }
    
    const allSelectedTags = Array.from(selectedOptions).flatMap(index => 
      question.options[index].tags
    );
    
    addTags(allSelectedTags);
    next();
    
    if (questionId >= questions.length) {
      router.push('/result');
    } else {
      router.push(`/question/${questionId + 1}`);
    }
  };
  
  const handleBack = () => {
    if (questionId > 1) {
      router.push(`/question/${questionId - 1}`);
    }
  };
  
  const handleRestart = () => {
    router.push('/question/1');
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-yellow-400 p-4">
      {/* Navigation */}
      <button 
        onClick={handleRestart}
        className="absolute top-4 left-4 text-2xl hover:scale-110 transition-transform"
        title="Restart Survey"
      >
        🐌
      </button>
      
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <ProgressBar 
            current={questionId} 
            total={questions.length} 
            className="mb-4"
          />
          <p className="text-white text-center">
            Question {questionId} of {questions.length}
          </p>
        </div>
        
        <QuestionCard className={isShaking ? 'animate-pulse' : ''}>
          <h1 className="text-2xl font-bold text-gray-800 mb-8 text-center">
            {question.text}
          </h1>
          
          <div className="space-y-4 mb-8">
            {question.options.map((option, index) => (
              <OptionButton
                key={index}
                selected={selectedOptions.has(index)}
                onToggle={() => handleOptionToggle(index)}
              >
                {option.value}
              </OptionButton>
            ))}
          </div>
          
          <div className="flex justify-between">
            {questionId > 1 && (
              <button
                onClick={handleBack}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors ml-auto"
            >
              {questionId >= questions.length ? 'See Results' : 'Next'}
            </button>
          </div>
        </QuestionCard>
      </div>
    </div>
  );
} 