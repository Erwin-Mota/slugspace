'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import SearchBar from '@/components/SearchBar';
import StudyGroupCard from '@/components/StudyGroupCard';
import coursesData from '@/data/ucsc_courses.json';

// TypeScript interfaces
interface Course {
  code: string;
  name: string;
  credits: number;
  level: string;
  description: string;
  prerequisites: string[];
  quarters_offered: string[];
}

interface Department {
  department: string;
  courses: Course[];
}

interface StudyGroupState {
  [courseCode: string]: boolean;
}

export default function StudyGroupsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [studyGroups, setStudyGroups] = useState<StudyGroupState>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load study group data from localStorage on mount
  useEffect(() => {
    const savedGroups = localStorage.getItem('studyGroups');
    if (savedGroups) {
      setStudyGroups(JSON.parse(savedGroups));
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever study groups change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('studyGroups', JSON.stringify(studyGroups));
    }
  }, [studyGroups, isLoading]);

  // Optimized search function with useMemo
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return coursesData as Department[];
    }

    const searchLower = searchTerm.toLowerCase();
    return (coursesData as Department[])
      .map(department => ({
        ...department,
        courses: department.courses.filter(course =>
          course.code.toLowerCase().includes(searchLower) ||
          course.name.toLowerCase().includes(searchLower) ||
          course.description.toLowerCase().includes(searchLower) ||
          department.department.toLowerCase().includes(searchLower)
        )
      }))
      .filter(department => department.courses.length > 0);
  }, [searchTerm]);

  // Toggle study group membership
  const toggleStudyGroup = useCallback((courseCode: string) => {
    setStudyGroups(prev => ({
      ...prev,
      [courseCode]: !prev[courseCode]
    }));
  }, []);

  // Handle search with debouncing built into SearchBar component
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const handleBackToHome = () => {
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading study groups...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-purple-800 text-white">
      {/* Back to Home Link */}
      <button
        onClick={handleBackToHome}
        className="absolute top-8 left-8 text-white hover:text-yellow-300 transition-colors duration-200 flex items-center gap-2 font-semibold z-10"
      >
        <i className="fas fa-arrow-left"></i>
        Back to Home
      </button>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 pt-16">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent animate-fade-in">
            Study Groups
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Join study groups for your classes and connect with fellow students. Search for any class to get started!
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search for a class (e.g., CSE 101, Calculus, Physics...)"
            className="w-full"
          />
        </div>

        {/* Results */}
        <div className="max-w-7xl mx-auto">
          {filteredData.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold mb-2">No classes found</h3>
              <p className="text-lg opacity-75">
                {searchTerm ? `No results for "${searchTerm}"` : 'Start typing to search for classes'}
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {filteredData.map((department) => (
                <div key={department.department} className="bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl">
                  <h2 className="text-2xl font-bold mb-6 text-yellow-300 border-b border-yellow-300/30 pb-2">
                    {department.department}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {department.courses.map((course) => (
                      <StudyGroupCard
                        key={course.code}
                        course={course}
                        isJoined={studyGroups[course.code] || false}
                        onToggle={() => toggleStudyGroup(course.code)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-12 text-center">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 max-w-md mx-auto">
            <h3 className="text-lg font-semibold mb-2">Your Study Groups</h3>
            <p className="text-3xl font-bold text-yellow-300">
              {Object.values(studyGroups).filter(Boolean).length}
            </p>
            <p className="text-sm opacity-75">Groups joined</p>
          </div>
        </div>
      </div>
    </div>
  );
} 