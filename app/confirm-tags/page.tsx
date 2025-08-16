'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConfirmTagsPage() {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const savedTags = localStorage.getItem('selectedTags');
    if (savedTags) {
      setSelectedTags(JSON.parse(savedTags));
    }
    setIsLoading(false);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    
    // Simulate saving process
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Save confirmed tags
    localStorage.setItem('confirmedTags', JSON.stringify(selectedTags));
    localStorage.setItem('userPersonalized', 'true');
    
    setIsSaving(false);
    router.push('/');
  };

  const handleBackToPersonalize = () => {
    router.push('/personalize');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading your selections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-6">
            ✅ Confirm Your Interests
          </h1>
          <p className="text-xl text-gray-100 max-w-2xl mx-auto">
            Review your selected interests below. These will be used to personalize your SlugConnect experience.
          </p>
        </div>

        {/* Selected Tags Display */}
        <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Your Selected Interests ({selectedTags.length})
          </h2>
          
          {selectedTags.length > 0 ? (
            <div className="flex flex-wrap gap-3 justify-center">
              {selectedTags.map((tag, index) => (
                <div
                  key={tag}
                  className="bg-white/20 backdrop-blur text-white px-4 py-2 rounded-xl font-medium border border-white/30 animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {tag}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-300">
              <p className="text-lg mb-4">No interests selected yet.</p>
              <button
                onClick={handleBackToPersonalize}
                className="text-yellow-400 hover:text-yellow-300 underline"
              >
                Go back to select some interests
              </button>
            </div>
          )}
        </div>

        {/* Recommendations Preview */}
        {selectedTags.length > 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl mb-8">
            <h3 className="text-xl font-bold text-white mb-4 text-center">
              🎯 What This Enables
            </h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl mb-2">🎭</div>
                <h4 className="font-semibold text-white mb-2">Club Recommendations</h4>
                <p className="text-gray-200 text-sm">Get personalized club suggestions based on your interests</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">📚</div>
                <h4 className="font-semibold text-white mb-2">Study Group Matching</h4>
                <p className="text-gray-200 text-sm">Find study partners with similar academic interests</p>
              </div>
              <div className="text-center">
                <div className="text-3xl mb-2">🏠</div>
                <h4 className="font-semibold text-white mb-2">College Matching</h4>
                <p className="text-gray-200 text-sm">Enhanced college recommendations that fit your lifestyle</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleBackToPersonalize}
            className="px-8 py-4 bg-white/20 text-white rounded-2xl font-semibold hover:bg-white/30 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <i className="fas fa-arrow-left"></i>
            Back to Personalize
          </button>
          
          <button
            onClick={handleSave}
            disabled={selectedTags.length === 0 || isSaving}
            className={`
              px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform flex items-center justify-center gap-2
              ${selectedTags.length > 0 && !isSaving
                ? 'bg-gradient-to-r from-green-400 to-green-500 text-white hover:from-green-500 hover:to-green-600 hover:scale-105 shadow-lg'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }
            `}
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <i className="fas fa-check"></i>
                Save & Continue
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 