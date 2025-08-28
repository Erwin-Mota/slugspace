'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import TagSelector from '@/components/TagSelector';
import InterestCategory from '@/components/InterestCategory';

// TypeScript interfaces
interface InterestTag {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  tags: InterestTag[];
}

export default function PersonalizePage() {
  const router = useRouter();
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('academics');

  // Comprehensive interest categories
  const categories: CategoryData[] = [
    {
      id: 'academics',
      name: 'Academic Interests',
      icon: '🎓',
      description: 'Your academic passions and study areas',
      color: 'from-blue-500 to-indigo-600',
      tags: [
        { id: 'computer-science', name: 'Computer Science', icon: '💻', color: 'bg-blue-100 text-blue-800' },
        { id: 'mathematics', name: 'Mathematics', icon: '🔢', color: 'bg-purple-100 text-purple-800' },
        { id: 'engineering', name: 'Engineering', icon: '⚙️', color: 'bg-gray-100 text-gray-800' },
        { id: 'physics', name: 'Physics', icon: '⚛️', color: 'bg-cyan-100 text-cyan-800' },
        { id: 'chemistry', name: 'Chemistry', icon: '🧪', color: 'bg-green-100 text-green-800' },
        { id: 'biology', name: 'Biology', icon: '🧬', color: 'bg-emerald-100 text-emerald-800' },
        { id: 'psychology', name: 'Psychology', icon: '🧠', color: 'bg-pink-100 text-pink-800' },
        { id: 'economics', name: 'Economics', icon: '📈', color: 'bg-orange-100 text-orange-800' },
        { id: 'business', name: 'Business', icon: '💼', color: 'bg-amber-100 text-amber-800' },
        { id: 'literature', name: 'Literature', icon: '📚', color: 'bg-red-100 text-red-800' },
        { id: 'history', name: 'History', icon: '🏛️', color: 'bg-yellow-100 text-yellow-800' },
        { id: 'philosophy', name: 'Philosophy', icon: '🤔', color: 'bg-indigo-100 text-indigo-800' },
        { id: 'art', name: 'Art', icon: '🎨', color: 'bg-rose-100 text-rose-800' },
        { id: 'music', name: 'Music', icon: '🎵', color: 'bg-violet-100 text-violet-800' },
        { id: 'environmental-science', name: 'Environmental Science', icon: '🌱', color: 'bg-green-100 text-green-800' },
        { id: 'political-science', name: 'Political Science', icon: '🏛️', color: 'bg-blue-100 text-blue-800' }
      ]
    },
    {
      id: 'hobbies',
      name: 'Hobbies & Interests',
      icon: '🎨',
      description: 'Activities you enjoy in your free time',
      color: 'from-purple-500 to-pink-600',
      tags: [
        { id: 'photography', name: 'Photography', icon: '📸', color: 'bg-gray-100 text-gray-800' },
        { id: 'cooking', name: 'Cooking', icon: '👨‍🍳', color: 'bg-orange-100 text-orange-800' },
        { id: 'gaming', name: 'Gaming', icon: '🎮', color: 'bg-blue-100 text-blue-800' },
        { id: 'reading', name: 'Reading', icon: '📖', color: 'bg-yellow-100 text-yellow-800' },
        { id: 'writing', name: 'Writing', icon: '✍️', color: 'bg-indigo-100 text-indigo-800' },
        { id: 'drawing', name: 'Drawing', icon: '🎨', color: 'bg-pink-100 text-pink-800' },
        { id: 'music-production', name: 'Music Production', icon: '🎧', color: 'bg-purple-100 text-purple-800' },
        { id: 'gardening', name: 'Gardening', icon: '🌻', color: 'bg-green-100 text-green-800' },
        { id: 'crafting', name: 'Crafting', icon: '🧵', color: 'bg-rose-100 text-rose-800' },
        { id: 'coding', name: 'Coding Projects', icon: '⌨️', color: 'bg-cyan-100 text-cyan-800' },
        { id: 'anime', name: 'Anime/Manga', icon: '🎌', color: 'bg-red-100 text-red-800' },
        { id: 'board-games', name: 'Board Games', icon: '🎲', color: 'bg-amber-100 text-amber-800' }
      ]
    },
    {
      id: 'sports',
      name: 'Sports & Fitness',
      icon: '⚽',
      description: 'Physical activities and sports you participate in',
      color: 'from-green-500 to-emerald-600',
      tags: [
        { id: 'soccer', name: 'Soccer', icon: '⚽', color: 'bg-green-100 text-green-800' },
        { id: 'basketball', name: 'Basketball', icon: '🏀', color: 'bg-orange-100 text-orange-800' },
        { id: 'tennis', name: 'Tennis', icon: '🎾', color: 'bg-yellow-100 text-yellow-800' },
        { id: 'swimming', name: 'Swimming', icon: '🏊‍♂️', color: 'bg-blue-100 text-blue-800' },
        { id: 'running', name: 'Running', icon: '🏃‍♂️', color: 'bg-red-100 text-red-800' },
        { id: 'cycling', name: 'Cycling', icon: '🚴‍♂️', color: 'bg-cyan-100 text-cyan-800' },
        { id: 'weightlifting', name: 'Weightlifting', icon: '🏋️‍♂️', color: 'bg-gray-100 text-gray-800' },
        { id: 'yoga', name: 'Yoga', icon: '🧘‍♀️', color: 'bg-purple-100 text-purple-800' },
        { id: 'rock-climbing', name: 'Rock Climbing', icon: '🧗‍♂️', color: 'bg-stone-100 text-stone-800' },
        { id: 'surfing', name: 'Surfing', icon: '🏄‍♂️', color: 'bg-teal-100 text-teal-800' },
        { id: 'martial-arts', name: 'Martial Arts', icon: '🥋', color: 'bg-red-100 text-red-800' },
        { id: 'volleyball', name: 'Volleyball', icon: '🏐', color: 'bg-orange-100 text-orange-800' },
        { id: 'ultimate-frisbee', name: 'Ultimate Frisbee', icon: '🥏', color: 'bg-blue-100 text-blue-800' },
        { id: 'esports', name: 'Esports', icon: '🎯', color: 'bg-violet-100 text-violet-800' }
      ]
    },
    {
      id: 'lifestyle',
      name: 'Lifestyle & Values',
      icon: '🌟',
      description: 'Your personal values and lifestyle preferences',
      color: 'from-amber-500 to-orange-600',
      tags: [
        { id: 'sustainability', name: 'Sustainability', icon: '♻️', color: 'bg-green-100 text-green-800' },
        { id: 'social-justice', name: 'Social Justice', icon: '✊', color: 'bg-red-100 text-red-800' },
        { id: 'volunteering', name: 'Volunteering', icon: '🤝', color: 'bg-blue-100 text-blue-800' },
        { id: 'meditation', name: 'Meditation', icon: '🧘', color: 'bg-purple-100 text-purple-800' },
        { id: 'travel', name: 'Travel', icon: '✈️', color: 'bg-cyan-100 text-cyan-800' },
        { id: 'entrepreneurship', name: 'Entrepreneurship', icon: '🚀', color: 'bg-orange-100 text-orange-800' },
        { id: 'networking', name: 'Networking', icon: '🤝', color: 'bg-indigo-100 text-indigo-800' },
        { id: 'leadership', name: 'Leadership', icon: '👑', color: 'bg-yellow-100 text-yellow-800' },
        { id: 'minimalism', name: 'Minimalism', icon: '📱', color: 'bg-gray-100 text-gray-800' },
        { id: 'cultural-exchange', name: 'Cultural Exchange', icon: '🌍', color: 'bg-emerald-100 text-emerald-800' }
      ]
    },
    {
      id: 'career',
      name: 'Career Goals',
      icon: '💼',
      description: 'Your professional aspirations and career interests',
      color: 'from-slate-500 to-gray-600',
      tags: [
        { id: 'research', name: 'Research', icon: '🔬', color: 'bg-cyan-100 text-cyan-800' },
        { id: 'startups', name: 'Startups', icon: '🚀', color: 'bg-orange-100 text-orange-800' },
        { id: 'tech-industry', name: 'Tech Industry', icon: '💻', color: 'bg-blue-100 text-blue-800' },
        { id: 'healthcare', name: 'Healthcare', icon: '🏥', color: 'bg-red-100 text-red-800' },
        { id: 'education', name: 'Education', icon: '🎓', color: 'bg-green-100 text-green-800' },
        { id: 'finance', name: 'Finance', icon: '💰', color: 'bg-yellow-100 text-yellow-800' },
        { id: 'consulting', name: 'Consulting', icon: '📊', color: 'bg-purple-100 text-purple-800' },
        { id: 'non-profit', name: 'Non-Profit', icon: '❤️', color: 'bg-pink-100 text-pink-800' },
        { id: 'government', name: 'Government', icon: '🏛️', color: 'bg-indigo-100 text-indigo-800' },
        { id: 'media', name: 'Media & Entertainment', icon: '🎬', color: 'bg-rose-100 text-rose-800' }
      ]
    }
  ];

  // Load selected tags from localStorage
  useEffect(() => {
    const savedTags = localStorage.getItem('selectedTags');
    if (savedTags) {
      setSelectedTags(new Set(JSON.parse(savedTags)));
    }
    setIsLoading(false);
  }, []);

  // Save tags whenever selection changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('selectedTags', JSON.stringify(Array.from(selectedTags)));
    }
  }, [selectedTags, isLoading]);

  const handleTagToggle = useCallback((tagId: string) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tagId)) {
        newSet.delete(tagId);
      } else {
        newSet.add(tagId);
      }
      return newSet;
    });
  }, []);

  const handleContinue = () => {
    router.push('/confirm-tags');
  };

  const handleBackHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading personalization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-800">
      {/* Header */}
      <div className="relative">
        <button
          onClick={handleBackHome}
          className="absolute top-8 left-8 text-white hover:text-yellow-300 transition-colors duration-200 flex items-center gap-2 font-semibold z-10"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Home
        </button>
        
        <div className="text-center pt-20 pb-12 px-4">
          <h1 className="text-5xl font-bold text-white mb-6 opacity-0 animate-fade-in">
            ⚙️ Personalize Your Experience
          </h1>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
            Tell us about your interests, hobbies, and goals. We&apos;ll use this to recommend the perfect clubs, 
            study groups, and opportunities just for you!
          </p>
          <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-4 max-w-md mx-auto">
            <p className="text-white font-semibold">
              {selectedTags.size} interests selected
            </p>
            <p className="text-gray-200 text-sm">
              Select at least 3 for better recommendations
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        {/* Category Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setActiveCategory(category.id)}
              className={`
                px-6 py-3 rounded-2xl font-semibold transition-all duration-300 flex items-center gap-2
                ${activeCategory === category.id
                  ? 'bg-white text-gray-800 shadow-lg scale-105'
                  : 'bg-white/20 text-white hover:bg-white/30'
                }
              `}
            >
              <span className="text-xl">{category.icon}</span>
              <span>{category.name}</span>
            </button>
          ))}
        </div>

        {/* Active Category */}
        {categories.map((category) => (
          activeCategory === category.id && (
            <InterestCategory
              key={category.id}
              category={category}
              selectedTags={selectedTags}
              onTagToggle={handleTagToggle}
            />
          )
        ))}

        {/* Continue Button */}
        <div className="text-center mt-16">
          <button
            onClick={handleContinue}
            disabled={selectedTags.size === 0}
            className={`
              px-12 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform
              ${selectedTags.size > 0
                ? 'bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 hover:from-yellow-500 hover:to-yellow-600 hover:scale-105 shadow-lg'
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }
            `}
          >
            Continue to Confirmation
            {selectedTags.size > 0 && (
              <span className="ml-2">({selectedTags.size} selected)</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
} 