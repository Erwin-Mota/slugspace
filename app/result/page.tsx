'use client';

import { useRouter } from 'next/navigation';
import { useSurvey } from '@/lib/SurveyContext';
import { recommend } from '@/utils/recommend';
import QuestionCard from '@/components/QuestionCard';
import colleges from '@/data/colleges.json';

interface College {
  id: string;
  name: string;
  tags: string[];
  sources?: string[];
}

const collegeThemes: Record<string, string> = {
  cowell: "The social hub with a laid-back vibe",
  stevenson: "Where extroverts thrive and parties never stop",
  crown: "STEM central with a nerdy, focused atmosphere",
  merrill: "Quiet nature lovers find their zen here",
  porter: "Artsy creatives and free spirits unite",
  kresge: "Activists and artists making change together",
  oakes: "Social justice warriors building community",
  rachel_carson: "Environmentalists and outdoor enthusiasts",
  college_nine_ten: "International STEM community with social flair and coding culture",
  john_r_lewis: "Activist leaders creating positive change"
};

export default function ResultPage() {
  const router = useRouter();
  const { tags, reset } = useSurvey();
  const matches = recommend(Array.from(tags));
  
  const handleStartOver = () => {
    reset();
    router.push('/question/1');
  };
  
  const handleBackToHome = () => {
    router.push('/');
  };
  
  const getMatchingTags = (collegeTags: string[]) => {
    return collegeTags.filter(tag => tags.has(tag));
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-yellow-400 p-4">
      <div className="max-w-4xl mx-auto">
        <QuestionCard>
          <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">
            Your UCSC College Match
          </h1>
          
          {matches.length > 0 && (
            <div className="space-y-6">
              {/* Top Match */}
              <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <span className="text-3xl mr-3">🥇</span>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {matches[0].name}
                  </h2>
                </div>
                <p className="text-gray-700 mb-4 font-medium">
                  {collegeThemes[matches[0].id] || "A perfect match for your personality!"}
                </p>
                <p className="text-gray-600 mb-4">
                  Score: {matches[0].score} matching traits
                </p>
                
                <details className="bg-white p-4 rounded-lg">
                  <summary className="font-semibold text-gray-800 cursor-pointer">
                    Why you matched
                  </summary>
                  <div className="mt-3">
                    <p className="text-gray-600 mb-2">Matched tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {getMatchingTags(matches[0].tags).map(tag => (
                        <span 
                          key={tag}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </details>
              </div>
              
              {/* Second Place (if within 1 point) */}
              {matches.length > 1 && matches[1].score >= matches[0].score - 1 && (
                <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-6 rounded-lg">
                  <div className="flex items-center mb-4">
                    <span className="text-3xl mr-3">🥈</span>
                    <h3 className="text-xl font-bold text-gray-800">
                      {matches[1].name}
                    </h3>
                  </div>
                  <p className="text-gray-700 mb-4 font-medium">
                    {collegeThemes[matches[1].id] || "Another great option for you!"}
                  </p>
                  <p className="text-gray-600 mb-4">
                    Score: {matches[1].score} matching traits
                  </p>
                  
                  <details className="bg-white p-4 rounded-lg">
                    <summary className="font-semibold text-gray-800 cursor-pointer">
                      Why you matched
                    </summary>
                    <div className="mt-3">
                      <p className="text-gray-600 mb-2">Matched tags:</p>
                      <div className="flex flex-wrap gap-2">
                        {getMatchingTags(matches[1].tags).map(tag => (
                          <span 
                            key={tag}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </details>
                </div>
              )}
            </div>
          )}
          
          <div className="mt-8 text-center space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={handleBackToHome}
                className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 font-bold py-3 px-6 rounded-lg transition-all duration-200 hover:from-yellow-500 hover:to-yellow-600 flex items-center justify-center gap-2"
              >
                <i className="fas fa-home"></i>
                Back to Home
              </button>
            <button
              onClick={handleStartOver}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
                <i className="fas fa-redo"></i>
              Start Over
            </button>
            </div>
            <p className="text-gray-600 text-sm">
              Explore more features on the home page or retake the survey
            </p>
          </div>
        </QuestionCard>
      </div>
    </div>
  );
} 