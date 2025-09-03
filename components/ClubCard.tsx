'use client';

import { useState } from 'react';

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

interface ClubCardProps {
  club: Club;
  isJoined: boolean;
  onToggle: () => void;
  isRecommended?: boolean;
}

export default function ClubCard({ club, isJoined, onToggle, isRecommended = false }: ClubCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Academic': 'bg-blue-100 text-blue-800 border-blue-200',
      'Cultural': 'bg-purple-100 text-purple-800 border-purple-200',
      'Greek Life': 'bg-pink-100 text-pink-800 border-pink-200',
      'Professional': 'bg-green-100 text-green-800 border-green-200',
      'Religious': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Service': 'bg-orange-100 text-orange-800 border-orange-200',
      'Special Interest': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Sports': 'bg-red-100 text-red-800 border-red-200',
    };
    return colors[category] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'Academic': '🎓',
      'Cultural': '🌍',
      'Greek Life': '🏛️',
      'Professional': '💼',
      'Religious': '⛪',
      'Service': '🤝',
      'Special Interest': '⭐',
      'Sports': '⚽',
    };
    return icons[category] || '📋';
  };

  return (
    <div 
      className={`
        relative bg-white/95 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20
        transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
        ${isAnimating ? 'animate-pulse' : ''}
        ${isJoined ? 'ring-2 ring-yellow-400 shadow-yellow-400/25' : ''}
        ${isRecommended ? 'ring-2 ring-green-400 shadow-green-400/25' : ''}
      `}
    >
      {/* Recommendation Badge */}
      {isRecommended && (
        <div className="absolute -top-3 -right-3 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
          ⭐ Recommended
        </div>
      )}

      {/* Joined Badge */}
      {isJoined && (
        <div className="absolute -top-3 -left-3 bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-xs font-bold shadow-lg z-10">
          ✓ Joined
        </div>
      )}

      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 mr-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{getCategoryIcon(club.category)}</span>
              <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getCategoryColor(club.category)}`}>
                {club.category}
              </span>
            </div>
            <h3 className="font-bold text-gray-800 text-lg mb-2 leading-tight">
              {club.name}
            </h3>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <i className="fas fa-users"></i>
                {club.memberCount} members
              </span>
              <span className="flex items-center gap-1">
                <i className="fas fa-star"></i>
                {club.popularityScore.toFixed(1)}
              </span>
            </div>
          </div>
          
          {/* Join/Leave Button */}
          <button
            onClick={handleToggle}
            className={`
              px-4 py-2 rounded-lg font-semibold text-sm
              transition-all duration-200 transform hover:scale-105 flex-shrink-0
              ${isJoined 
                ? 'bg-red-500 hover:bg-red-600 text-white shadow-red-200' 
                : 'bg-yellow-400 hover:bg-yellow-500 text-gray-800 shadow-yellow-200'
              }
              shadow-lg
            `}
          >
            {isJoined ? (
              <>
                <i className="fas fa-sign-out-alt mr-1"></i>
                Leave
              </>
            ) : (
              <>
                <i className="fas fa-plus mr-1"></i>
                Join
              </>
            )}
          </button>
        </div>

        {/* Description */}
        <div className="mb-4">
          <p className={`text-gray-600 text-sm leading-relaxed ${!isExpanded && club.description.length > 150 ? 'line-clamp-3' : ''}`}>
            {club.description}
          </p>
          
          {club.description.length > 150 && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2 transition-colors"
            >
              {isExpanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {/* Meeting Information */}
        {(club.meetingTime || club.meetingLocation) && (
          <div className="mb-4 bg-gray-50 rounded-lg p-3">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Meeting Info:</h4>
            <div className="space-y-1">
              {club.meetingTime && (
                <div className="flex items-center gap-2">
                  <i className="fas fa-clock text-gray-500 text-sm"></i>
                  <span className="text-gray-600 text-sm">{club.meetingTime}</span>
                </div>
              )}
              {club.meetingLocation && (
                <div className="flex items-center gap-2">
                  <i className="fas fa-map-marker-alt text-gray-500 text-sm"></i>
                  <span className="text-gray-600 text-sm">{club.meetingLocation}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Contact Information */}
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2">Contact Info:</h4>
          <div className="space-y-2">
            {club.contactEmail && (
              <div className="flex items-center gap-2">
                <i className="fas fa-envelope text-gray-500 text-sm"></i>
                <a 
                  href={`mailto:${club.contactEmail}`}
                  className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                >
                  {club.contactEmail}
                </a>
              </div>
            )}
            
            {club.website && (
              <div className="flex items-center gap-2">
                <i className="fas fa-globe text-gray-500 text-sm"></i>
                <a 
                  href={club.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm transition-colors"
                >
                  Website
                </a>
              </div>
            )}
            
            {club.instagram && (
              <div className="flex items-center gap-2">
                <i className="fab fa-instagram text-pink-500 text-sm"></i>
                <a 
                  href={`https://instagram.com/${club.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-pink-600 hover:text-pink-800 text-sm transition-colors"
                >
                  @{club.instagram}
                </a>
              </div>
            )}
            
            {club.discord && (
              <div className="flex items-center gap-2">
                <i className="fab fa-discord text-indigo-500 text-sm"></i>
                <a 
                  href={club.discord}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 text-sm transition-colors"
                >
                  Discord Server
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Membership Status */}
        {isJoined && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center text-yellow-800">
              <i className="fas fa-users mr-2"></i>
              <span className="text-sm font-medium">You&apos;re a member of this club!</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Stay connected with club updates and events.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
