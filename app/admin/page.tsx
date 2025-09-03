'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalClubs: number;
    totalCourses: number;
    totalColleges: number;
    totalClubMemberships: number;
    totalStudyGroupMemberships: number;
  };
  recentUsers: Array<{
    id: string;
    name: string;
    email: string;
    createdAt: string;
  }>;
  popularClubs: Array<{
    id: string;
    name: string;
    memberCount: number;
    category: string;
  }>;
  popularCourses: Array<{
    id: string;
    code: string;
    name: string;
    studentCount: number;
  }>;
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/login');
      return;
    }
    
    if (session.user?.role !== 'admin') {
      router.push('/');
      return;
    }
    
    fetchAnalytics();
  }, [session, status, router]);

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetch('/api/v1/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }
      
      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setIsLoading(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-900 to-black flex items-center justify-center">
        <div className="text-center text-white">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Error Loading Dashboard</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={fetchAnalytics}
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
          onClick={() => router.push('/')}
          className="absolute top-8 left-8 text-white hover:text-yellow-300 transition-colors duration-200 flex items-center gap-2 font-semibold z-10"
        >
          <i className="fas fa-arrow-left"></i>
          Back to Home
        </button>
        
        <div className="text-center pt-20 pb-12 px-4">
          <h1 className="text-5xl font-bold text-white mb-6 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            📊 Admin Dashboard
          </h1>
          <p className="text-xl text-gray-100 max-w-3xl mx-auto leading-relaxed">
            Monitor platform activity, user engagement, and system performance.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-20">
        {analytics && (
          <>
            {/* Overview Stats */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-3xl mb-2">👥</div>
                <h3 className="text-xl font-bold text-white mb-2">Total Users</h3>
                <p className="text-3xl font-bold text-yellow-400">{analytics.overview.totalUsers}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-3xl mb-2">🎭</div>
                <h3 className="text-xl font-bold text-white mb-2">Total Clubs</h3>
                <p className="text-3xl font-bold text-yellow-400">{analytics.overview.totalClubs}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-3xl mb-2">📚</div>
                <h3 className="text-xl font-bold text-white mb-2">Total Courses</h3>
                <p className="text-3xl font-bold text-yellow-400">{analytics.overview.totalCourses}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-3xl mb-2">🏛️</div>
                <h3 className="text-xl font-bold text-white mb-2">Total Colleges</h3>
                <p className="text-3xl font-bold text-yellow-400">{analytics.overview.totalColleges}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-3xl mb-2">🤝</div>
                <h3 className="text-xl font-bold text-white mb-2">Club Memberships</h3>
                <p className="text-3xl font-bold text-yellow-400">{analytics.overview.totalClubMemberships}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
                <div className="text-3xl mb-2">👨‍🎓</div>
                <h3 className="text-xl font-bold text-white mb-2">Study Groups</h3>
                <p className="text-3xl font-bold text-yellow-400">{analytics.overview.totalStudyGroupMemberships}</p>
              </div>
            </div>

            {/* Popular Clubs */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">🔥 Popular Clubs</h2>
              <div className="space-y-4">
                {analytics.popularClubs.map((club, index) => (
                  <div key={club.id} className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-yellow-400">#{index + 1}</span>
                      <div>
                        <h3 className="font-semibold text-white">{club.name}</h3>
                        <p className="text-gray-300 text-sm">{club.category}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold">{club.memberCount} members</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Popular Courses */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">📈 Popular Courses</h2>
              <div className="space-y-4">
                {analytics.popularCourses.map((course, index) => (
                  <div key={course.id} className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold text-yellow-400">#{index + 1}</span>
                      <div>
                        <h3 className="font-semibold text-white">{course.code} - {course.name}</h3>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold">{course.studentCount} students</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Users */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h2 className="text-2xl font-bold text-white mb-6">👤 Recent Users</h2>
              <div className="space-y-4">
                {analytics.recentUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between bg-white/5 rounded-lg p-4">
                    <div>
                      <h3 className="font-semibold text-white">{user.name || 'Anonymous'}</h3>
                      <p className="text-gray-300 text-sm">{user.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
