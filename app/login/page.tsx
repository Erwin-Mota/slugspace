"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FaGoogle, FaSlug, FaGraduationCap, FaUsers, FaHeart } from "react-icons/fa";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (session) {
      router.push("/");
    }
  }, [session, router]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-yellow-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white"></div>
      </div>
    );
  }

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
            <FaSlug className="text-6xl text-yellow-400 mr-4 animate-bounce" />
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

          {/* 🚀 Google Sign In Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={`w-full flex items-center justify-center space-x-3 bg-white text-gray-800 rounded-xl py-4 px-6 font-semibold transition-all duration-300 transform ${
              isHovered ? 'scale-105 shadow-2xl' : 'shadow-lg'
            } hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-800"></div>
            ) : (
              <>
                <FaGoogle className="text-xl text-red-500" />
                <span>Continue with Google</span>
              </>
            )}
          </button>

          {/* 🔒 Security Notice */}
          <div className="mt-6 text-center">
            <p className="text-blue-200 text-sm">
              🔒 Secure authentication via UCSC Google accounts only
            </p>
            <p className="text-blue-100 text-xs mt-2">
              Only @ucsc.edu emails are allowed
            </p>
          </div>
        </div>

        {/* 🎯 Back to Home */}
        <div className="text-center mt-6">
          <button
            onClick={() => router.push("/")}
            className="text-blue-200 hover:text-white transition-colors duration-200 flex items-center justify-center mx-auto space-x-2"
          >
            <span>← Back to Home</span>
          </button>
        </div>
      </div>

      {/* 🌟 Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full opacity-60 animate-pulse"
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