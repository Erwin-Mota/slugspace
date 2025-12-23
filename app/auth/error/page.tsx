"use client";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { FaExclamationTriangle, FaArrowLeft, FaHome } from "react-icons/fa";
import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const error = searchParams.get("error");

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "AccessDenied":
        return "Access Denied";
      case "Configuration":
        return "Server Configuration Error - Please try again later";
      case "Verification":
        return "Verification Failed - Please try signing in again";
      default:
        return "Authentication Error - Something went wrong";
    }
  };

  const getErrorDescription = (error: string | null) => {
    switch (error) {
      case "AccessDenied":
        return "Your access request was denied. Please try again or contact support if the problem persists.";
      case "Configuration":
        return "Our authentication system is experiencing technical difficulties.";
      case "Verification":
        return "The authentication process couldn't be completed.";
      default:
        return "We encountered an unexpected error during authentication.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-600 flex items-center justify-center p-4">
      {/* 🎨 Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-400 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse animation-delay-2000"></div>
      </div>

      {/* 🚨 Main Error Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20 text-center">
          {/* 🚨 Error Icon */}
          <div className="mb-6">
            <FaExclamationTriangle className="text-6xl text-red-400 mx-auto animate-bounce" />
          </div>

          {/* 📝 Error Message */}
          <h1 className="text-3xl font-bold text-white mb-4">
            Oops! Authentication Error
          </h1>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-red-200 mb-2">
              {getErrorMessage(error)}
            </h2>
            <p className="text-red-100 text-sm leading-relaxed">
              {getErrorDescription(error)}
            </p>
          </div>

          {/* 🔧 Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={() => router.push("/login")}
              className="w-full bg-white text-red-800 rounded-xl py-3 px-6 font-semibold hover:bg-red-50 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <FaArrowLeft className="text-lg" />
              <span>Try Again</span>
            </button>
            
            <button
              onClick={() => router.push("/")}
              className="w-full bg-transparent border-2 border-white/30 text-white rounded-xl py-3 px-6 font-semibold hover:bg-white/10 transition-all duration-200 flex items-center justify-center space-x-2"
            >
              <FaHome className="text-lg" />
              <span>Go Home</span>
            </button>
          </div>

          {/* 💡 Helpful Tips */}
          <div className="mt-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-yellow-300 font-semibold mb-2">💡 Need Help?</h3>
            <ul className="text-red-100 text-sm text-left space-y-1">
              <li>• Check your internet connection</li>
              <li>• Try clearing your browser cookies</li>
              <li>• Make sure you&apos;re using a valid email address</li>
              <li>• Contact support if the problem persists</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 🌟 Floating Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-red-300 rounded-full opacity-60 animate-pulse"
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

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-red-800 to-orange-600 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
} 