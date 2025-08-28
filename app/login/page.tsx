"use client";

import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaGithub, FaHome, FaGraduationCap, FaUsers, FaHeart, FaGoogle } from "react-icons/fa";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGitHubSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("github", { callbackUrl: "/" });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-yellow-600 flex items-center justify-center p-4">
      {/* 🎨 Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-blob animation-delay-4000"></div>
      </div>

      {/* 🎓 Main Login Card */}
      <div className="relative z-10 w-full max-w-md">
        {/* 🏆 UCSC Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <FaHome className="text-6xl text-yellow-400 mr-4 animate-bounce" />
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">SlugConnect</h1>
              <p className="text-blue-100 text-lg">Your UCSC Community Hub</p>
            </div>
          </div>
          
          {/* 🎭 Feature Icons */}
          <div className="flex justify-center space-x-6 mb-6">
            <div className="text-center">
              <FaGraduationCap className="text-2xl text-yellow-400 mx-auto mb-2" />
              <span className="text-blue-100 text-sm">Study Groups</span>
            </div>
            <div className="text-center">
              <FaUsers className="text-2xl text-yellow-400 mx-auto mb-2" />
              <span className="text-blue-100 text-sm">Campus Clubs</span>
            </div>
            <div className="text-center">
              <FaHeart className="text-2xl text-yellow-400 mx-auto mb-2" />
              <span className="text-blue-100 text-sm">College Match</span>
            </div>
          </div>
        </div>

        {/* 🔐 Login Card */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-white mb-2">Welcome Back, Slug!</h2>
            <p className="text-blue-100">Connect with your UCSC community</p>
          </div>

          {/* 🚀 GitHub Sign In Button */}
          <button
            onClick={handleGitHubSignIn}
            disabled={isLoading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`w-full mb-4 p-4 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
              isLoading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-gray-900 hover:bg-gray-800 hover:scale-105'
            } text-white border-2 border-gray-700 hover:border-gray-600 flex items-center justify-center space-x-3`}
          >
            <FaGithub className="text-2xl" />
            <span>{isLoading ? 'Signing in...' : 'Continue with GitHub'}</span>
          </button>

          {/* 🔵 Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
            className={`w-full mb-6 p-4 rounded-xl font-semibold text-lg transition-all duration-300 transform ${
              isGoogleLoading
                ? 'bg-gray-500 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:scale-105'
            } text-white border-2 border-blue-500 hover:border-blue-600 flex items-center justify-center space-x-3`}
          >
            <FaGoogle className="text-2xl" />
            <span>{isGoogleLoading ? 'Signing in...' : 'Continue with Google'}</span>
          </button>

          {/* 🔒 Security Notice */}
          <div className="text-center text-blue-100 text-sm">
            <p>🔒 Secure authentication via OAuth 2.0</p>
            <p>Your password is never shared with us</p>
          </div>

          {/* 🏠 Back to Home */}
          <div className="text-center mt-6">
            <button
              onClick={() => router.push('/')}
              className="text-white/80 hover:text-white transition-colors duration-200 flex items-center mx-auto"
            >
              <FaHome className="mr-2" /> Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 