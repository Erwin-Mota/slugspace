"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { FaGraduationCap, FaUsers, FaHeart, FaArrowRight, FaHome, FaSpinner, FaSignOutAlt, FaChartBar, FaDatabase } from "react-icons/fa";

export default function HomePage() {
  const { data: session } = useSession();
  const [isSigningOut, setIsSigningOut] = useState(false);

  // 🚀 Handle instant sign out
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut({ 
        callbackUrl: "/",
        redirect: false
      });
      window.location.href = "/";
    } catch (error) {
      console.error("Sign out error:", error);
      setIsSigningOut(false);
    }
  };

  // 🚀 Show sign out loading only
  if (isSigningOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-yellow-600 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="text-6xl text-yellow-400 mx-auto mb-4 animate-spin" />
          <p className="text-white text-xl">Signing out...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-yellow-600">
      {/* 🎯 Navigation Bar */}
      <nav className="bg-white/10 backdrop-blur-lg border-b border-white/20 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* 🏆 Logo */}
          <div className="flex items-center space-x-3">
            <FaHome className="text-4xl text-yellow-400" />
            <div>
              <h1 className="text-2xl font-bold text-white">SlugConnect</h1>
              <p className="text-blue-100 text-sm">Your UCSC Community Hub</p>
            </div>
          </div>

          {/* 🔐 Authentication */}
          <div className="flex items-center space-x-4">
            {session ? (
              <div className="flex items-center space-x-4">
                <div className="text-white text-right">
                  <p className="font-semibold">Welcome back!</p>
                  <p className="text-blue-100 text-sm">{session.user?.name || session.user?.email}</p>
                </div>
                {session.user?.image && (
                  <img 
                    src={session.user.image} 
                    alt="Profile" 
                    className="w-10 h-10 rounded-full border-2 border-yellow-400"
                  />
                )}
                <button
                  onClick={handleSignOut}
                  disabled={isSigningOut}
                  className="bg-white/20 text-white px-4 py-2 rounded-xl font-semibold hover:bg-white/30 transition-colors duration-200 flex items-center space-x-2 disabled:opacity-50"
                >
                  <FaSignOutAlt />
                  <span>{isSigningOut ? "Signing out..." : "Sign Out"}</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="bg-white/20 backdrop-blur-lg text-white px-6 py-2 rounded-xl font-semibold hover:bg-white/30 transition-colors duration-200 border border-white/20"
              >
                Log In
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* 🎨 Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* 🏆 Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Welcome to SlugConnect
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Connect with fellow UCSC students, join study groups, discover campus clubs, 
            and find your perfect college match. Build your community today!
          </p>
          
          {/* Database Status */}
          <div className="bg-green-500/10 backdrop-blur-lg rounded-2xl p-4 border border-green-400/20 max-w-md mx-auto mb-8">
            <div className="flex items-center justify-center gap-2 text-green-300">
              <FaDatabase className="text-lg" />
              <span className="font-semibold">Database Connected</span>
            </div>
            <p className="text-green-100 text-sm mt-1">All data is now stored securely in PostgreSQL</p>
          </div>
          
          {!session && (
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="bg-yellow-400 text-gray-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all duration-200 transform hover:scale-105"
              >
                Get Started
              </Link>
              <Link
                href="/personalize"
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-all duration-200"
              >
                Learn More
              </Link>
            </div>
          )}
        </div>

        {/* 🎭 Feature Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Link
            href="/personalize"
            className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <FaHeart className="text-4xl text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-white mb-2">Personalize</h3>
              <p className="text-blue-100 text-sm">Tell us about yourself and discover your perfect matches</p>
            </div>
          </Link>

          <Link
            href="/study-groups"
            className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <FaGraduationCap className="text-4xl text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-white mb-2">Study Groups</h3>
              <p className="text-blue-100 text-sm">Join study groups for your courses and ace your classes</p>
            </div>
          </Link>

          <Link
            href="/clubs"
            className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <FaUsers className="text-4xl text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-white mb-2">Campus Clubs</h3>
              <p className="text-blue-100 text-sm">Discover and join clubs that match your interests</p>
            </div>
          </Link>

          <Link
            href="/college-finder"
            className="group bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 transform hover:scale-105"
          >
            <div className="text-center">
              <FaHeart className="text-4xl text-yellow-400 mx-auto mb-4 group-hover:scale-110 transition-transform duration-300" />
              <h3 className="text-xl font-bold text-white mb-2">College Finder</h3>
              <p className="text-blue-100 text-sm">Find your perfect UCSC college match</p>
            </div>
          </Link>
        </div>

        {/* 🎯 More Features */}
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-white mb-8">More Features</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <FaUsers className="text-3xl text-yellow-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">Networking</h4>
              <p className="text-blue-100 text-sm">Connect with students and alumni</p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <FaChartBar className="text-3xl text-yellow-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">Analytics</h4>
              <p className="text-blue-100 text-sm">Track your engagement and activity</p>
            </div>
          </div>
        </div>

        {/* 🚀 Call to Action */}
        {!session && (
          <div className="text-center mt-16">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white mb-4">Ready to Connect?</h3>
              <p className="text-blue-100 mb-6">
                Join thousands of UCSC students building their community on SlugConnect
              </p>
              <Link
                href="/login"
                className="inline-flex items-center space-x-2 bg-yellow-400 text-gray-800 px-8 py-4 rounded-xl font-bold text-lg hover:bg-yellow-300 transition-all duration-200 transform hover:scale-105"
              >
                <span>Get Started Now</span>
                <FaArrowRight className="text-lg" />
              </Link>
            </div>
          </div>
        )}

        {/* 🎉 Welcome Message for Authenticated Users */}
        {session && (
          <div className="text-center mt-16">
            <div className="bg-green-500/10 backdrop-blur-lg rounded-2xl p-8 border border-green-400/20">
              <h3 className="text-2xl font-bold text-white mb-4">Welcome to SlugConnect!</h3>
              <p className="text-green-100 mb-6">
                You&apos;re now connected to the UCSC community. Explore all our features above!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="/personalize"
                  className="bg-yellow-400 text-gray-800 px-6 py-3 rounded-xl font-semibold hover:bg-yellow-300 transition-colors duration-200"
                >
                  Set Up Profile
                </Link>
                <Link
                  href="/study-groups"
                  className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors duration-200"
                >
                  Find Study Groups
                </Link>
                <Link
                  href="/clubs"
                  className="bg-purple-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-purple-600 transition-colors duration-200"
                >
                  Join Clubs
                </Link>
                {session.user?.role === 'admin' && (
                  <Link
                    href="/admin"
                    className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition-colors duration-200"
                  >
                    Admin Dashboard
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 🌟 Floating Particles */}
      <div className="fixed inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-300 rounded-full opacity-40 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
