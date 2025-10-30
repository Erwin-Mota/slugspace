"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";

interface College {
  id: string;
  name: string;
  tags: string[];
  sources?: string[];
}

// Map quiz answers to college tags
const answerToTags: Record<string, string[]> = {
  // Question 1: Living environment
  "Quiet and studious": ["nerdy", "introvert", "stem"],
  "Social and lively": ["social", "party", "extrovert"],
  "Balanced mix": ["chill", "social"],
  "Close to nature": ["nature", "outdoors"],
  
  // Question 2: Social atmosphere
  "Large community": ["social", "extrovert"],
  "Small tight-knit": ["introvert", "chill"],
  "Diverse groups": ["social_justice", "activism", "social"],
  "Independent": ["introvert", "chill"],
  
  // Question 3: Academic focus
  "STEM focused": ["stem", "nerdy"],
  "Arts and creativity": ["artsy", "creative"],
  "Social justice": ["activism", "social_justice"],
  "General studies": ["chill", "social"],
  
  // Question 4: Activity level
  "Very active": ["party", "social", "extrovert"],
  "Moderate": ["chill", "social"],
  "Quiet/Relaxed": ["introvert", "chill"],
  "Depends on mood": ["chill"],
};

const questions = [
  {
    id: 1,
    question: "What's your ideal living environment?",
    options: ["Quiet and studious", "Social and lively", "Balanced mix", "Close to nature"]
  },
  {
    id: 2,
    question: "What kind of social atmosphere do you prefer?",
    options: ["Large community", "Small tight-knit", "Diverse groups", "Independent"]
  },
  {
    id: 3,
    question: "What's your academic focus?",
    options: ["STEM focused", "Arts and creativity", "Social justice", "General studies"]
  },
  {
    id: 4,
    question: "How active do you want your college community to be?",
    options: ["Very active", "Moderate", "Quiet/Relaxed", "Depends on mood"]
  }
];

export default function CollegeFinderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [colleges, setColleges] = useState<College[]>([]);

  // Load colleges data
  useEffect(() => {
    fetch('/data/colleges.json')
      .then(res => res.json())
      .then(data => setColleges(data))
      .catch(err => console.error('Error loading colleges:', err));
  }, []);

  // Calculate college match scores based on answers
  const collegeMatches = useMemo(() => {
    if (Object.keys(answers).length === 0) return [];

    // Collect all tags from user answers
    const userTags = new Set<string>();
    Object.values(answers).forEach(answer => {
      const tags = answerToTags[answer] || [];
      tags.forEach(tag => userTags.add(tag));
    });

    // Score each college based on tag matches
    const scored = colleges.map(college => {
      let score = 0;
      let exactMatches = 0;
      const collegeTags = new Set(college.tags.map(t => t.toLowerCase()));
      
      // Count exact matching tags (higher weight)
      userTags.forEach(userTag => {
        const userTagLower = userTag.toLowerCase();
        if (collegeTags.has(userTagLower)) {
          score += 10; // Strong exact match
          exactMatches++;
        }
      });
      
      // Partial matches (e.g., "social" matches "social_justice")
      // Only count if we haven't already matched exactly
      userTags.forEach(userTag => {
        const userTagLower = userTag.toLowerCase();
        if (!collegeTags.has(userTagLower)) {
          college.tags.forEach(collegeTag => {
            const collegeTagLower = collegeTag.toLowerCase();
            if (collegeTagLower.includes(userTagLower) || 
                userTagLower.includes(collegeTagLower)) {
              score += 3; // Partial match (lower than exact)
            }
          });
        }
      });

      // Calculate match percentage based on how many user tags matched
      const totalPossibleScore = userTags.size * 10; // Max score per tag
      const matchPercentage = totalPossibleScore > 0 
        ? Math.min(100, Math.round((score / totalPossibleScore) * 100))
        : 0;

      return {
        ...college,
        score,
        exactMatches,
        matchPercentage
      };
    });

    // Sort by score (highest first) and filter out 0 scores
    return scored
      .filter(c => c.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6); // Top 6 matches
  }, [answers, colleges]);

  const handleAnswer = (questionId: number, answer: string) => {
    setAnswers({ ...answers, [questionId]: answer });
    if (step < questions.length) {
      setStep(step + 1);
    } else {
      // Show results
      setStep(questions.length + 1);
    }
  };

  const resetQuiz = () => {
    setStep(1);
    setAnswers({});
  };

  // Get college image path
  const getCollegeImage = (collegeId: string) => {
    const imageMap: Record<string, string> = {
      'cowell': '/colleges/cowell.jpg',
      'stevenson': '/colleges/stevenson.jpg',
      'crown': '/colleges/crown.jpg',
      'merrill': '/colleges/merrill.jpg',
      'porter': '/colleges/porter.jpg',
      'kresge': '/colleges/kresge.jpg',
      'oakes': '/colleges/oakes.jpg',
      'rachel_carson': '/colleges/rachelcarson.jpg',
      'college_nine_ten': '/colleges/collegenine.jpg',
      'john_r_lewis': '/colleges/johnrlewis.jpg'
    };
    return imageMap[collegeId] || '/colleges/cowell.jpg';
  };

  if (step > questions.length) {
    // Results page
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your College Matches!</h1>
            <p className="text-gray-600 mb-8">Based on your preferences, here are your top matches:</p>
            
            {collegeMatches.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600 mb-4">
                  We couldn't find perfect matches. Try adjusting your preferences!
                </p>
                <button
                  onClick={resetQuiz}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Retake Quiz
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {collegeMatches.map((college, index) => (
                    <div key={college.id} className="relative group">
                      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-xl transform group-hover:scale-105 transition-transform">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm font-semibold">#{index + 1} Match</div>
                          <div className="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">
                            {college.matchPercentage}% Match
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-4">{college.name}</h3>
                        <div className="bg-white/20 rounded-lg p-4 mb-3">
                          <p className="text-xs font-semibold mb-2">Tags:</p>
                          <div className="flex flex-wrap gap-1">
                            {college.tags.slice(0, 4).map(tag => (
                              <span key={tag} className="bg-white/30 px-2 py-1 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-sm opacity-90">
                          Score: {college.score} points
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex gap-4">
                  <button
                    onClick={resetQuiz}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Retake Quiz
                  </button>
                  <button
                    onClick={() => router.push("/")}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Back to Home
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[step - 1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 flex items-center justify-center py-12 px-4">
      <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-600">
              Question {step} of {questions.length}
            </span>
            <span className="text-sm font-medium text-blue-600">
              {Math.round((step / questions.length) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / questions.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Question */}
        <h2 className="text-3xl font-bold text-gray-900 mb-8">
          {currentQuestion.question}
        </h2>

        {/* Options */}
        <div className="space-y-4">
          {currentQuestion.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(currentQuestion.id, option)}
              className="w-full text-left px-6 py-4 bg-gray-50 hover:bg-blue-50 border-2 border-gray-200 hover:border-blue-500 rounded-xl transition-all text-lg font-medium text-gray-700 hover:text-blue-700"
            >
              {option}
            </button>
          ))}
        </div>

        {/* Back button */}
        {step > 1 && (
          <button
            onClick={() => setStep(step - 1)}
            className="mt-6 text-gray-600 hover:text-gray-900"
          >
            ← Back
          </button>
        )}
      </div>
    </div>
  );
}

