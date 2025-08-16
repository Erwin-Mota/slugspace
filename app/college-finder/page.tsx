'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Helper function to map college names to image filenames
const getCollegeImageName = (collegeName: string): string => {
  const nameMap: Record<string, string> = {
    'Cowell College': 'cowell',
    'Stevenson College': 'stevenson',
    'Crown College': 'crown',
    'Merrill College': 'merrill',
    'Porter College': 'porter',
    'Kresge College': 'kresge',
    'Oakes College': 'oakes',
    'Rachel Carson College': 'rachelcarson',
    'Colleges Nine & Ten': 'collegenine',
    'John R. Lewis College': 'johnrlewis'
  };
  return nameMap[collegeName] || collegeName.toLowerCase().replace(/[^a-z0-9]/g, '');
};

// Helper function to get fun facts about each college
const getCollegeFunFact = (collegeName: string): string => {
  const facts: Record<string, string> = {
    'Cowell College': '🎉 Known for its vibrant social life and the famous "Cowell Coffee House"',
    'Stevenson College': '⚡ Home to the most spirited college traditions and events',
    'Crown College': '🤖 Birthplace of many successful tech entrepreneurs and engineers',
    'Merrill College': '🌲 Surrounded by beautiful redwood forests for peaceful study',
    'Porter College': '🎨 Features student-created murals and art installations everywhere',
    'Kresge College': '✊ Historic center of student activism and social movements',
    'Oakes College': '🌍 Celebrates diversity with multicultural programming year-round',
    'Rachel Carson College': '🌱 First college focused on environmental sustainability',
    'Colleges Nine & Ten': '🏗️ Newest facilities with modern apartments and dining',
    'John R. Lewis College': '📚 Named after the civil rights icon, emphasizing social justice'
  };
  return facts[collegeName] || '✨ A unique community with its own special character';
};

// Helper function to get vibe tags for each college
const getCollegeVibes = (collegeName: string): string[] => {
  const vibes: Record<string, string[]> = {
    'Cowell College': ['Social', 'Friendly', 'Central'],
    'Stevenson College': ['Energetic', 'Party', 'Outgoing'],
    'Crown College': ['STEM', 'Academic', 'Tech-Focused'],
    'Merrill College': ['Quiet', 'Nature', 'Peaceful'],
    'Porter College': ['Artsy', 'Creative', 'Expressive'],
    'Kresge College': ['Activist', 'Progressive', 'Community'],
    'Oakes College': ['Diverse', 'Inclusive', 'Cultural'],
    'Rachel Carson College': ['Environmental', 'Outdoorsy', 'Green'],
    'Colleges Nine & Ten': ['Modern', 'International', 'Connected'],
    'John R. Lewis College': ['Justice-Focused', 'Engaged', 'Purposeful']
  };
  return vibes[collegeName] || ['Unique', 'Community-Minded'];
};

export default function CollegeFinderPage() {
  const router = useRouter();
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [colleges, setColleges] = useState<any[]>([]);

  // Load college data for the carousel
  useEffect(() => {
    fetch('/data/ucsc_college_stereotypes.json')
      .then(response => response.json())
      .then(data => setColleges(data))
      .catch(error => console.error('Error loading colleges:', error));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) return;
    
    setIsSubmitting(true);
    
    // Simulate processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsSubmitting(false);
    
    // Redirect to the React college survey for better matching
    router.push('/question/1');
  };

  const handleBackHome = () => {
    router.push('/');
  };

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
        {/* Simple Header */}
        <div className="text-center mb-8 pt-12">
          <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
            🏠 UCSC Colleges
          </h1>
          <p className="text-lg text-white/90">
            Explore your future home • Each college has its own unique community
          </p>
        </div>

        {/* UCSC Colleges Sliding Carousel */}
        <div className="max-w-7xl mx-auto">
          {colleges.length > 0 && (
            <div className="bg-blue-900/40 backdrop-blur-lg rounded-2xl p-6 border border-yellow-400/30 shadow-xl overflow-hidden">
              <div className="relative">
                <div className="college-carousel flex animate-slide space-x-6">
                  {/* Duplicate the array to create seamless loop */}
                  {[...colleges, ...colleges].map((college, index) => (
                    <div 
                      key={`${college.name}-${index}`}
                      className="college-card flex-shrink-0 w-64 bg-white/15 backdrop-blur rounded-2xl p-4 text-center hover:bg-white/25 transition-all duration-300 transform hover:scale-105 shadow-lg border border-yellow-400/20"
                    >
                      {/* College Image */}
                      <div className="w-24 h-24 mx-auto mb-3 rounded-xl overflow-hidden shadow-lg">
                        <img 
                          src={`/colleges/${getCollegeImageName(college.name)}.jpg`}
                          alt={college.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<div class="w-full h-full bg-gradient-to-br from-yellow-400 to-blue-600 flex items-center justify-center text-2xl font-bold text-white rounded-xl">${college.name.charAt(0)}</div>`;
                            }
                          }}
                        />
                      </div>
                      
                      {/* College Name */}
                      <h4 className="font-bold text-white mb-2 text-lg leading-tight">
                        {college.name}
                      </h4>
                      
                      {/* College Vibe Tags */}
                      <div className="flex flex-wrap gap-1 mb-3 justify-center">
                        {getCollegeVibes(college.name).slice(0, 2).map((vibe, vibeIndex) => (
                          <span 
                            key={vibeIndex}
                            className="bg-yellow-400/20 text-yellow-300 px-2 py-1 rounded-full text-xs font-medium border border-yellow-400/40"
                          >
                            {vibe}
                          </span>
                        ))}
                      </div>
                      
                      {/* College Description */}
                      <p className="text-gray-200 text-sm leading-relaxed">
                        {college.stereotype}
                      </p>
                    </div>
                  ))}
                </div>
                
                {/* Gradient Overlays for visual effect */}
                <div className="absolute left-0 top-0 w-24 h-full bg-gradient-to-r from-blue-900 to-transparent pointer-events-none"></div>
                <div className="absolute right-0 top-0 w-24 h-full bg-gradient-to-l from-blue-800 to-transparent pointer-events-none"></div>
              </div>
            </div>
          )}
        </div>

        {/* Single Interactive Button */}
        <div className="text-center mt-8">
          <button
            onClick={() => router.push('/question/1')}
            className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 px-8 py-4 rounded-2xl font-bold text-xl hover:from-yellow-500 hover:to-yellow-600 transition-all transform hover:scale-105 shadow-xl border-2 border-yellow-300"
          >
            🎯 Find My Perfect College Match
          </button>
          <p className="text-white/80 mt-3 text-sm">
            Take our interactive survey to discover your ideal UCSC college
          </p>
        </div>
      </div>
    </div>
  );
} 