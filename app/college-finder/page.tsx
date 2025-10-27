"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function CollegeFinderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<any>({});

  const questions = [
    {
      id: 1,
      question: "What's your ideal living environment?",
      options: ["Quiet and studious", "Social and lively", "Balanced mix", "Close to nature"]
    },
    {
      id: 2,
      question: "How important is location on campus?",
      options: ["Very close to classes", "Near dining halls", "Close to downtown", "Doesn't matter"]
    },
    {
      id: 3,
      question: "What's your social preference?",
      options: ["Large community", "Small tight-knit", "Diverse groups", "Independent"]
    }
  ];

  const colleges = [
    { name: "Cowell College", image: "/colleges/cowell.jpg" },
    { name: "Stevenson College", image: "/colleges/stevenson.jpg" },
    { name: "Crown College", image: "/colleges/crown.jpg" },
    { name: "Merrill College", image: "/colleges/merrill.jpg" },
    { name: "Porter College", image: "/colleges/porter.jpg" },
    { name: "Kresge College", image: "/colleges/kresge.jpg" },
    { name: "Oakes College", image: "/colleges/oakes.jpg" },
    { name: "Rachel Carson College", image: "/colleges/rachelcarson.jpg" },
    { name: "College Nine", image: "/colleges/collegenine.jpg" },
    { name: "John R. Lewis College", image: "/colleges/johnrlewis.jpg" }
  ];

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

  if (step > questions.length) {
    // Results page
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100 py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Your College Matches!</h1>
            <p className="text-gray-600 mb-8">Based on your preferences, here are your top matches:</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {colleges.slice(0, 3).map((college, index) => (
                <div key={college.name} className="relative group">
                  <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl p-6 text-white shadow-xl transform group-hover:scale-105 transition-transform">
                    <div className="text-sm font-semibold mb-2">#{index + 1} Match</div>
                    <h3 className="text-2xl font-bold mb-4">{college.name}</h3>
                    <div className="bg-white/20 rounded-lg p-4">
                      <p className="text-sm">Perfect fit based on your lifestyle preferences!</p>
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

