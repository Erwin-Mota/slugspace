'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
  id: number;
  text: string;
  options: string[];
}

const questions: Question[] = [
  {
    id: 1,
    text: "How would you describe your social energy level?",
    options: ["Very outgoing and social", "Moderately social", "Prefer smaller groups", "Mostly introverted"]
  },
  {
    id: 2,
    text: "What's your preferred study environment?",
    options: ["Loud and energetic spaces", "Moderate activity", "Quiet and peaceful", "Complete silence"]
  },
  {
    id: 3,
    text: "What activities interest you most?",
    options: ["Parties and social events", "Academic clubs and study groups", "Arts and creative activities", "Environmental and outdoor activities"]
  },
  {
    id: 4,
    text: "How do you feel about activism and social justice?",
    options: ["Very passionate about it", "Somewhat interested", "Neutral", "Not my main focus"]
  },
  {
    id: 5,
    text: "What's your academic focus?",
    options: ["STEM/Engineering", "Arts and Humanities", "Environmental Studies", "Social Sciences", "Undecided"]
  }
];

const collegeRecommendations = {
  "Very outgoing and social": "Cowell College",
  "Moderately social": "Stevenson College",
  "Prefer smaller groups": "Merrill College",
  "Mostly introverted": "Crown College",
  "Loud and energetic spaces": "Stevenson College",
  "Moderate activity": "Colleges Nine & Ten",
  "Quiet and peaceful": "Merrill College",
  "Complete silence": "Crown College",
  "Parties and social events": "Cowell College",
  "Academic clubs and study groups": "Crown College",
  "Arts and creative activities": "Porter College",
  "Environmental and outdoor activities": "Rachel Carson College",
  "Very passionate about it": "Kresge College",
  "Somewhat interested": "Oakes College",
  "Neutral": "Colleges Nine & Ten",
  "Not my main focus": "Crown College",
  "STEM/Engineering": "Crown College",
  "Arts and Humanities": "Porter College",
  "Environmental Studies": "Rachel Carson College",
  "Social Sciences": "Oakes College",
  "Undecided": "Colleges Nine & Ten"
};

export default function CollegeSurveyPage() {
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showResult, setShowResult] = useState(false);
  const [recommendedColleges, setRecommendedColleges] = useState<string[]>([]);

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion + 1]: answer }));
    
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    } else {
      // Calculate recommendation
      const collegeScores: Record<string, number> = {};
      
      Object.values(answers).forEach(answer => {
        const college = collegeRecommendations[answer as keyof typeof collegeRecommendations];
        if (college) {
          collegeScores[college] = (collegeScores[college] || 0) + 1;
        }
      });
      
      // Add current answer
      const currentCollege = collegeRecommendations[answer as keyof typeof collegeRecommendations];
      if (currentCollege) {
        collegeScores[currentCollege] = (collegeScores[currentCollege] || 0) + 1;
      }
      
      // Find top 2 colleges with highest scores
      const sortedColleges = Object.entries(collegeScores)
        .sort(([,a], [,b]) => b - a) // Sort by score descending
        .slice(0, 2) // Take top 2
        .map(([college]) => college); // Extract college names
      
      setRecommendedColleges(sortedColleges);
      setShowResult(true);
    }
  };

  const handleBackHome = () => {
    router.push('/');
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResult(false);
    setRecommendedColleges([]);
  };

  if (showResult) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-yellow-500 to-blue-800 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 max-w-2xl mx-4 text-center border border-yellow-400/30 shadow-2xl">
          <h1 className="text-4xl font-bold text-white mb-6">🎯 Your College Match!</h1>
          
                  <div className="space-y-4 mb-6">
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-2xl p-6">
            <h2 className="text-2xl font-bold text-blue-900 mb-2">🥇 1st Choice</h2>
            <p className="text-xl font-semibold text-blue-900">{recommendedColleges[0]}</p>
          </div>
          
          {recommendedColleges[1] && (
            <div className="bg-gradient-to-r from-blue-400 to-blue-500 rounded-2xl p-6">
              <h2 className="text-2xl font-bold text-white mb-2">🥈 2nd Choice</h2>
              <p className="text-xl font-semibold text-white">{recommendedColleges[1]}</p>
            </div>
          )}
        </div>
        
        <p className="text-white/90 text-lg mb-8 leading-relaxed">
          Based on your answers, {recommendedColleges[0]} is your top match, with {recommendedColleges[1] || 'another college'} as a great alternative!
        </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRestart}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              🔄 Take Survey Again
            </button>
            <button
              onClick={handleBackHome}
              className="bg-yellow-500 hover:bg-yellow-600 text-blue-900 px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              🏠 Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-yellow-500 to-blue-800">
      {/* Back to Home Button */}
      <button
        onClick={handleBackHome}
        className="absolute top-6 left-6 text-white hover:text-yellow-300 transition-colors duration-200 flex items-center gap-2 font-semibold z-10"
      >
        <i className="fas fa-arrow-left"></i>
        Back
      </button>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-4">🎓 College Match Survey</h1>
          <p className="text-white/80 mb-8">
            Answer a few questions to find your perfect UCSC college match!
          </p>
          
          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-3 mb-8">
            <div 
              className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
          
          {/* Question */}
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-yellow-400/30 shadow-xl">
            <h2 className="text-2xl font-semibold text-white mb-6">
              {questions[currentQuestion].text}
            </h2>
            
            <div className="space-y-4">
              {questions[currentQuestion].options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleAnswer(option)}
                  className="w-full bg-white/20 hover:bg-white/30 text-white p-4 rounded-xl text-left transition-all duration-200 hover:scale-105 border border-white/20 hover:border-yellow-400/50"
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
          
          <p className="text-white/60 mt-4 text-sm">
            Question {currentQuestion + 1} of {questions.length}
          </p>
        </div>
      </div>
    </div>
  );
} 