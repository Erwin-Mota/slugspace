"use client";

import { signIn, getSession } from "next-auth/react";
import { useState } from "react";
import { FaGithub, FaGoogle, FaSpinner, FaHome } from "react-icons/fa";
import Link from "next/link";

// Force dynamic rendering for OAuth
export const dynamic = 'force-dynamic';

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // 🚀 Fast OAuth sign in
  const handleOAuthSignIn = async (provider: string) => {
    setIsLoading(provider);
    try {
      // OAuth requires redirect: true to work
      await signIn(provider, { 
        callbackUrl: "/",
        redirect: true
      });
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error);
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-yellow-600 flex items-center justify-center p-4">
      {/* 🌟 Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-yellow-300 rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>

      {/* 🎨 Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          {/* 🏆 Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <FaHome className="text-4xl text-yellow-400 mr-3" />
              <h1 className="text-3xl font-bold text-white">SlugSpace</h1>
            </div>
            <p className="text-blue-100 text-lg">Welcome to your UCSC community hub</p>
          </div>

          {/* 🔐 OAuth Buttons */}
          <div className="space-y-4">
            {/* GitHub */}
            <button
              onClick={() => handleOAuthSignIn("github")}
              disabled={isLoading !== null}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {isLoading === "github" ? (
                <FaSpinner className="animate-spin text-xl" />
              ) : (
                <FaGithub className="text-xl" />
              )}
              <span>
                {isLoading === "github" ? "Connecting..." : "Continue with GitHub"}
              </span>
            </button>

            {/* Google */}
            <button
              onClick={() => handleOAuthSignIn("google")}
              disabled={isLoading !== null}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105"
            >
              {isLoading === "google" ? (
                <FaSpinner className="animate-spin text-xl" />
              ) : (
                <FaGoogle className="text-xl" />
              )}
              <span>
                {isLoading === "google" ? "Connecting..." : "Continue with Google"}
              </span>
            </button>
          </div>

          {/* 🏠 Back to Home */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-blue-100 hover:text-white transition-colors duration-200 text-sm"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
