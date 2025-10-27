'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import SearchBar from '@/components/SearchBar';
import ClubCard from '@/components/ClubCard';

// TypeScript interfaces
interface Club {
  id: string;
  name: string;
  description: string;
  category: string;
  meetingTime?: string;
  meetingLocation?: string;
  contactEmail?: string;
  website?: string;
  instagram?: string;
  discord?: string;
  imageUrl?: string;
  memberCount: number;
  popularityScore: number;
  createdAt: string;
  updatedAt: string;
}

interface ClubsResponse {
  clubs: Club[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

interface ClubsByCategory {
  [category: string]: Club[];
}

export default function ClubsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [allClubs, setAllClubs] = useState<Club[]>([]);
  const [filteredClubs, setFilteredClubs] = useState<Club[]>([]);
  const [joinedClubs, setJoinedClubs] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch clubs from JSON file - only once on mount
  const fetchClubs = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/data/ucsc_clubs.json');
      if (!response.ok) {
        throw new Error('Failed to fetch clubs');
      }
      
      const data = await response.json();
      
      // Transform to Club format
      const transformedClubs: Club[] = data.map((club: any, index: number) => ({
        id: `club-${index}`,
        name: club.name,
        description: club.description,
        category: club.category,
        contactEmail: club.email,
        instagram: club.instagram,
        memberCount: Math.floor(Math.random() * 100),
        popularityScore: Math.random() * 100,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));
      
      setAllClubs(transformedClubs);
      setFilteredClubs(transformedClubs);
    } catch (err) {
      console.error('Error fetching clubs:', err);
      setError('Failed to load clubs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Filter clubs when search term or category changes
  useEffect(() => {
    let filtered = [...allClubs];
    
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(club => club.category === selectedCategory);
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(club => 
        club.name.toLowerCase().includes(search) ||
        club.description.toLowerCase().includes(search) ||
        club.category.toLowerCase().includes(search)
      );
    }
    
    setFilteredClubs(filtered);
  }, [searchTerm, selectedCategory, allClubs]);

  // Load user data and fetch clubs
  useEffect(() => {
    const loadUserData = async () => {
      // Load joined clubs from localStorage for now
      const savedJoinedClubs = localStorage.getItem('joinedClubs');
      if (savedJoinedClubs) {
        setJoinedClubs(new Set(JSON.parse(savedJoinedClubs)));
      }
      
      // If user is logged in, fetch their actual club memberships
      if (session?.user?.id) {
        try {
          const response = await fetch('/api/v1/user');
          if (response.ok) {
            const userData = await response.json();
            const userJoinedClubs = new Set(
              userData.clubMemberships?.map((membership: any) => membership.club.id) || []
            );
            setJoinedClubs(userJoinedClubs);
          }
        } catch (err) {
          console.error('Error fetching user data:', err);
        }
      }
      
      if (allClubs.length === 0) {
        await fetchClubs();
      }
    };
    
    loadUserData();
  }, [fetchClubs, session, allClubs.length]);

  // Save joined clubs to localStorage
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('joinedClubs', JSON.stringify(Array.from(joinedClubs)));
    }
  }, [joinedClubs, isLoading]);

  // Group clubs by category
  const clubsByCategory: ClubsByCategory = useMemo(() => {
    return filteredClubs.reduce((acc, club) => {
      if (!acc[club.category]) {
        acc[club.category] = [];
      }
      acc[club.category].push(club);
      return acc;
    }, {} as ClubsByCategory);
  }, [filteredClubs]);

  // Get all categories
  const categories = useMemo(() => {
    return ['all', ...Object.keys(clubsByCategory).sort()];
  }, [clubsByCategory]);

  // Toggle club membership
  const toggleClubMembership = useCallback(async (clubId: string) => {
    try {
      const isCurrentlyJoined = joinedClubs.has(clubId);
      
      if (isCurrentlyJoined) {
        // Leave club
        const response = await fetch(`/api/v1/clubs/${clubId}/members`, {
          method: 'DELETE',
        });
        
        if (response.ok) {
          setJoinedClubs(prev => {
            const newSet = new Set(prev);
            newSet.delete(clubId);
            return newSet;
          });
        } else {
          throw new Error('Failed to leave club');
        }
      } else {
        // Join club
        const response = await fetch(`/api/v1/clubs/${clubId}/members`, {
          method: 'POST',
        });
        
        if (response.ok) {
          setJoinedClubs(prev => new Set([...prev, clubId]));
        } else {
          throw new Error('Failed to join club');
        }
      }
    } catch (err) {
      console.error('Error toggling club membership:', err);
      // You could show a toast notification here
    }
  }, [joinedClubs]);

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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Error Loading Clubs</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={fetchClubs}
            className="bg-yellow-400 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-500 transition-colors"
          >
            Try Again
          </button>
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
              {allClubs.length} clubs available
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

        {/* Authentication Notice */}
        {!session && (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 max-w-2xl mx-auto mb-12 text-center">
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-white mb-3">Sign in to Join Clubs</h3>
            <p className="text-gray-200 mb-4">
              Create an account or sign in to join clubs and track your memberships!
            </p>
            <button
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:from-yellow-500 hover:to-yellow-600 transition-all"
            >
              Sign In
            </button>
          </div>
        )}

        {/* All Clubs by Category */}
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-8 text-center">
            {searchTerm ? `Search Results` : selectedCategory === 'all' ? 'All Clubs' : `${selectedCategory} Clubs`}
          </h2>
          
          {Object.keys(clubsByCategory).length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold mb-2">No clubs found</h3>
              <p className="text-lg text-gray-300">
                {searchTerm ? `No results for "${searchTerm}"` : 'No clubs in this category'}
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {Object.entries(clubsByCategory)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([category, categoryClubs]) => (
                  <div key={category} className="bg-white/5 backdrop-blur-lg rounded-3xl p-8 border border-white/10 shadow-2xl">
                    <h3 className="text-2xl font-bold text-yellow-300 mb-6 border-b border-yellow-300/30 pb-2">
                      {category} ({categoryClubs.length})
                    </h3>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {categoryClubs.map((club) => (
                        <ClubCard
                          key={club.id}
                          club={club}
                          isJoined={joinedClubs.has(club.id)}
                          onToggle={() => toggleClubMembership(club.id)}
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
