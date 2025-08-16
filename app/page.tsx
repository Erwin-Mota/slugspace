'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 to-yellow-400 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl font-bold mb-4">SlugConnect</h1>
          <p className="text-xl">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="bg-gradient-to-r from-gray-800 to-gray-900 text-white p-4 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">🐌</span>
            <span className="text-xl font-bold text-white">SlugConnect</span>
          </div>
          <div className="flex items-center space-x-6">
            <button 
              onClick={() => router.push('/login')}
              className="bg-white/10 backdrop-blur-sm text-white px-4 py-2 rounded-lg font-medium text-sm border border-white/20 hover:bg-white/20 hover:border-white/30 transition-all duration-200"
            >
              <span className="flex items-center gap-1.5">
                <span className="text-sm">🔐</span>
                Login
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 min-h-screen">
        <div className="container mx-auto px-4 py-16">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-6xl font-bold text-white mb-6 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
              Find your campus community
            </h1>
            <p className="text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
              Discover activities, join study groups, connect with clubs, and find your perfect college match at UCSC. 
              Your campus community awaits!
            </p>
          </div>

          {/* Feature Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {/* 1st Box: Personalization */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-xl flex flex-col">
              <div className="text-4xl mb-4">⚙️</div>
              <h3 className="text-xl font-bold text-white mb-3">Personalize</h3>
              <p className="text-gray-200 mb-6 text-sm flex-grow">
                Enhanced personalization with categorized interests, visual progress, and smart recommendations.
              </p>
              <button 
                onClick={() => router.push('/personalize')}
                className="w-full bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 py-2 px-4 rounded-lg font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all flex items-center justify-center gap-2 mt-auto"
              >
                <span>Get Started</span>
              </button>
            </div>

            {/* 2nd Box: Study Groups */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-xl flex flex-col">
              <div className="text-4xl mb-4">📚</div>
              <h3 className="text-xl font-bold text-white mb-3">Study Groups</h3>
              <p className="text-gray-200 mb-6 text-sm flex-grow">
                Join study groups for your classes with our new React-powered interface. Search through 1000+ UCSC courses!
              </p>
              <button 
                onClick={() => router.push('/study-groups')}
                className="w-full bg-gradient-to-r from-green-400 to-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-green-500 hover:to-green-600 transition-all flex items-center justify-center gap-2 mt-auto"
              >
                <span>Browse Groups</span>
              </button>
            </div>

            {/* 3rd Box: Campus Clubs */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-xl flex flex-col">
              <div className="text-4xl mb-4">🎭</div>
              <h3 className="text-xl font-bold text-white mb-3">Campus Clubs</h3>
              <p className="text-gray-200 mb-6 text-sm flex-grow">
                Discover and join clubs that match your interests. Smart recommendations based on your profile!
              </p>
              <button 
                onClick={() => router.push('/clubs')}
                className="w-full bg-gradient-to-r from-purple-400 to-purple-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-purple-500 hover:to-purple-600 transition-all flex items-center justify-center gap-2 mt-auto"
              >
                <span>Explore Clubs</span>
              </button>
            </div>

            {/* 4th Box: College Finder */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 shadow-xl flex flex-col">
              <div className="text-4xl mb-4">🏠</div>
              <h3 className="text-xl font-bold text-white mb-3">College Finder</h3>
              <p className="text-gray-200 mb-6 text-sm flex-grow">
                Explore UCSC's 10 unique colleges with our beautiful sliding panel, then take the survey to find your perfect match!
              </p>
              <button 
                onClick={() => router.push('/college-finder')}
                className="w-full bg-gradient-to-r from-blue-400 to-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:from-blue-500 hover:to-blue-600 transition-all flex items-center justify-center gap-2 mt-auto"
              >
                <span>Find My College</span>
              </button>
            </div>
          </div>

          {/* Additional Features */}
          <div className="mt-16 text-center">
            <h2 className="text-3xl font-bold text-white mb-8">More Features</h2>
            <div className="flex flex-wrap justify-center gap-4">
              <button 
                onClick={() => alert('Events feature coming soon! 🎉')}
                className="bg-white/10 backdrop-blur-lg px-6 py-3 rounded-lg border border-white/20 text-white hover:bg-white/20 transition-all"
              >
                🎉 Events
              </button>
            </div>
          </div>

          {/* Tech Stack Info */}
          <div className="mt-16 bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4 text-center">🚀 Powered by Modern Tech</h3>
            <div className="grid md:grid-cols-2 gap-6 text-gray-200">
              <div>
                <h4 className="font-semibold text-yellow-300 mb-2">Performance Features:</h4>
                <ul className="text-sm space-y-1">
                  <li>⚡ Lightning-fast React with TypeScript</li>
                  <li>🎯 Interactive college matching survey</li>
                  <li>💾 Smart data persistence</li>
                  <li>📱 Fully responsive design</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-yellow-300 mb-2">Smart Features:</h4>
                <ul className="text-sm space-y-1">
                  <li>🧠 AI-powered recommendations</li>
                  <li>🎭 Personalized club matching</li>
                  <li>📚 Advanced study group search</li>
                  <li>⚙️ Comprehensive interest profiling</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 