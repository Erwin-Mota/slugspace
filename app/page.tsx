"use client";

import Link from "next/link";
import { FaGraduationCap, FaUsers, FaHeart, FaArrowRight, FaHome } from "react-icons/fa";

export default function HomePage() {
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
            <Link
              href="/login"
              className="bg-yellow-400 text-gray-800 px-6 py-2 rounded-xl font-semibold hover:bg-yellow-300 transition-colors duration-200"
            >
              Log In
            </Link>
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
          <div className="grid md:grid-cols-1 gap-6">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10">
              <FaUsers className="text-3xl text-yellow-400 mx-auto mb-4" />
              <h4 className="text-xl font-semibold text-white mb-2">Networking</h4>
              <p className="text-blue-100 text-sm">Connect with students and alumni</p>
            </div>
          </div>
        </div>

        {/* 🚀 Call to Action */}
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