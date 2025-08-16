'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import ClubCard from '@/components/ClubCard';
import clubsData from '@/data/ucsc_clubs.json';

// TypeScript interfaces
interface Club {
  category: string;
  name: string;
  description: string;
  email: string;
  instagram: string | null;
}

interface ClubsByCategory {
  [category: string]: Club[];
}

export default function ClubsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [userTags, setUserTags] = useState<string[]>([]);
  const [joinedClubs, setJoinedClubs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load user data
  useEffect(() => {
    const confirmedTags = localStorage.getItem('confirmedTags');
    const savedJoinedClubs = localStorage.getItem('joinedClubs');
    
    if (confirmedTags) {
      setUserTags(JSON.parse(confirmedTags));
    }
    
    if (savedJoinedClubs) {
      setJoinedClubs(new Set(JSON.parse(savedJoinedClubs)));
    }
    
    setIsLoading(false);
  }, []);

  // Save joined clubs to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('joinedClubs', JSON.stringify(Array.from(joinedClubs)));
    }
  }, [joinedClubs, isLoading]);

  // Group clubs by category
  const clubsByCategory: ClubsByCategory = useMemo(() => {
    return (clubsData as Club[]).reduce((acc, club) => {
      if (!acc[club.category]) {
        acc[club.category] = [];
      }
      acc[club.category].push(club);
      return acc;
    }, {} as ClubsByCategory);
  }, []);

  // Get all categories
  const categories = useMemo(() => {
    return ['all', ...Object.keys(clubsByCategory).sort()];
  }, [clubsByCategory]);

  // Smart club recommendations based on user tags
  const recommendedClubs = useMemo(() => {
    if (userTags.length === 0) return [];
    
    const recommendations = (clubsData as Club[]).filter(club => {
      const clubText = `${club.name} ${club.description}`.toLowerCase();
      return userTags.some(tag => 
        clubText.includes(tag.toLowerCase().replace('-', ' '))
      );
    });
    
    return recommendations.slice(0, 6); // Top 6 recommendations
  }, [userTags]);

  // Filter clubs based on search and category
  const filteredClubs = useMemo(() => {
    let filtered = clubsData as Club[];
    
    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(club => club.category === selectedCategory);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(club =>
        club.name.toLowerCase().includes(searchLower) ||
        club.description.toLowerCase().includes(searchLower) ||
        club.category.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  }, [searchTerm, selectedCategory]);

  // Group filtered clubs by category
  const filteredClubsByCategory = useMemo(() => {
    return filteredClubs.reduce((acc, club) => {
      if (!acc[club.category]) {
        acc[club.category] = [];
      }
      acc[club.category].push(club);
      return acc;
    }, {} as ClubsByCategory);
  }, [filteredClubs]);

  // Toggle club membership
  const toggleClubMembership = useCallback((clubName: string) => {
    setJoinedClubs(prev => {
      const newSet = new Set(prev);
      if (newSet.has(clubName)) {
        newSet.delete(clubName);
      } else {
        newSet.add(clubName);
      }
      return newSet;
    });
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleBackHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading clubs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black text-white">
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
          <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            🎭 Campus Clubs
          </h1>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
            Discover and join clubs that match your interests. From academics to hobbies, find your community at UCSC.
          </p>
          
          <div className="mt-6 bg-white/10 backdrop-blur-lg rounded-2xl p-4 max-w-md mx-auto">
            <p className="text-white font-semibold">
              {joinedClubs.size} clubs joined
            </p>
            <p className="text-gray-200 text-sm">
              {filteredClubs.length} clubs available
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        {/* Search and Filters */}
        <div className="max-w-4xl mx-auto mb-12">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search clubs by name, description, or category..."
            className="mb-6"
          />
          
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`
                  px-4 py-2 rounded-xl font-medium transition-all duration-300
                  ${selectedCategory === category
                    ? 'bg-yellow-400 text-gray-800 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                  }
                `}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Personalized Recommendations */}
        {recommendedClubs.length > 0 && userTags.length > 0 && (
          <div className="mb-16">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-white mb-4">
                🎯 Recommended for You
              </h2>
              <p className="text-gray-300">
                Based on your interests: {userTags.slice(0, 3).join(', ')}
                {userTags.length > 3 && ` +${userTags.length - 3} more`}
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto mb-8">
              {recommendedClubs.map((club) => (
                <ClubCard
                  key={club.name}
                  club={club}
                  isJoined={joinedClubs.has(club.name)}
                  onToggle={() => toggleClubMembership(club.name)}
                  isRecommended={true}
                />
              ))}
            </div>
            
            <div className="text-center">
              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent mb-4"></div>
              <p className="text-gray-400">Showing personalized recommendations</p>
            </div>
          </div>
        )}

        {/* User Tags Display */}
        {userTags.length > 0 && (
          <div className="text-center mb-12">
            <h3 className="text-xl font-semibold text-white mb-4">Your Interests</h3>
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
              {userTags.map((tag) => (
                <span 
                  key={tag}
                  className="bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium border border-yellow-400/30"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* No personalization message */}
        {userTags.length === 0 && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto mb-12 text-center">
            <div className="text-4xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold text-white mb-3">Get Personalized Recommendations</h3>
            <p className="text-gray-200 mb-4">
              Complete your personalization to see clubs tailored to your interests!
            </p>
            <button
              onClick={() => router.push('/personalize')}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all"
            >
              Personalize Now
            </button>
          </div>
        )}

        {/* All Clubs by Category */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            {searchTerm ? `Search Results` : selectedCategory === 'all' ? 'All Clubs' : `${selectedCategory} Clubs`}
          </h2>
          
          {Object.keys(filteredClubsByCategory).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold mb-2">No clubs found</h3>
              <p className="text-lg text-gray-300">
                {searchTerm ? `No results for "${searchTerm}"` : 'No clubs in this category'}
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(filteredClubsByCategory)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([category, clubs]) => (
                  <div key={category} className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl">
                    <h3 className="text-2xl font-bold text-yellow-300 mb-6 border-b border-yellow-300/30 pb-2">
                      {category} ({clubs.length})
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {clubs.map((club) => (
                        <ClubCard
                          key={club.name}
                          club={club}
                          isJoined={joinedClubs.has(club.name)}
                          onToggle={() => toggleClubMembership(club.name)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 