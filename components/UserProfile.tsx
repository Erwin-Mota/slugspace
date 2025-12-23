"use client";

import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { FaUser, FaSignOutAlt, FaEdit, FaHeart, FaGraduationCap, FaUsers, FaCog } from "react-icons/fa";

export default function UserProfile() {
  const { data: session } = useSession();
  const [isExpanded, setIsExpanded] = useState(false);

  if (!session?.user) {
    return null;
  }

  const user = session.user as any;

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="relative">
      {/* 🎯 Profile Trigger Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center space-x-3 bg-white/10 backdrop-blur-lg rounded-xl px-4 py-2 hover:bg-white/20 transition-all duration-200 border border-white/20"
      >
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name || "User"}
            width={32}
            height={32}
            className="w-8 h-8 rounded-full border-2 border-yellow-400"
            unoptimized
          />
        ) : (
          <div className="w-8 h-8 bg-yellow-400 rounded-full flex items-center justify-center">
            <FaUser className="text-gray-800 text-sm" />
          </div>
        )}
        <span className="text-white font-medium hidden md:block">
          {user.name || user.email?.split('@')[0] || 'Slug'}
        </span>
        <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
          ▼
        </div>
      </button>

      {/* 🎨 Expanded Profile Panel */}
      {isExpanded && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 z-50">
          {/* 🎭 Profile Header */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4 mb-4">
              {user.image ? (
                <Image
                  src={user.image}
                  alt={user.name || "User"}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full border-4 border-yellow-400"
                  unoptimized
                />
              ) : (
                <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center">
                  <FaUser className="text-gray-800 text-2xl" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-800">
                  {user.name || 'UCSC Student'}
                </h3>
                <p className="text-gray-600 text-sm">{user.email}</p>
                {user.major && (
                  <p className="text-blue-600 text-sm font-medium">
                    <FaGraduationCap className="inline mr-1" />
                    {user.major}
                  </p>
                )}
              </div>
            </div>

            {/* 🎯 Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-xl">
                <div className="text-2xl font-bold text-blue-600">
                  {user.joinedClubs?.length || 0}
                </div>
                <div className="text-blue-500 text-sm">Clubs</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-xl">
                <div className="text-2xl font-bold text-green-600">
                  {user.studyGroups?.length || 0}
                </div>
                <div className="text-green-500 text-sm">Study Groups</div>
              </div>
            </div>
          </div>

          {/* 🎭 Personality Traits */}
          {user.personalityTraits && (
            <div className="p-6 border-b border-gray-200">
              <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <FaHeart className="text-red-500 mr-2" />
                Your Interests
              </h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(user.personalityTraits).map(([category, traits]: [string, any]) => (
                  <div key={category} className="w-full">
                    <span className="text-xs font-medium text-gray-500 uppercase">{category}:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {traits.slice(0, 3).map((trait: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full"
                        >
                          {trait}
                        </span>
                      ))}
                      {traits.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                          +{traits.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 🔧 Quick Actions */}
          <div className="p-6 space-y-3">
            <button className="w-full flex items-center justify-center space-x-3 bg-blue-600 text-white rounded-xl py-3 px-4 hover:bg-blue-700 transition-colors duration-200">
              <FaEdit className="text-lg" />
              <span>Edit Profile</span>
            </button>
            
            <button className="w-full flex items-center justify-center space-x-3 bg-gray-100 text-gray-700 rounded-xl py-3 px-4 hover:bg-gray-200 transition-colors duration-200">
              <FaCog className="text-lg" />
              <span>Settings</span>
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center justify-center space-x-3 bg-red-100 text-red-700 rounded-xl py-3 px-4 hover:bg-red-200 transition-colors duration-200"
            >
              <FaSignOutAlt className="text-lg" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* 🎯 Click Outside to Close */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsExpanded(false)}
        />
      )}
    </div>
  );
} 