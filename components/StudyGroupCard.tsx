'use client';

import { useState } from 'react';

interface Course {
  code: string;
  name: string;
  credits: number;
  level: string;
  description: string;
  prerequisites: string[];
  quarters_offered: string[];
}

interface StudyGroupCardProps {
  course: Course;
  isJoined: boolean;
  onToggle: () => void;
}

export default function StudyGroupCard({ course, isJoined, onToggle }: StudyGroupCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleToggle = () => {
    setIsAnimating(true);
    onToggle();
    setTimeout(() => setIsAnimating(false), 300);
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'lower':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'upper':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'graduate':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQuarterIcons = (quarters: string[]) => {
    const quarterMap: Record<string, string> = {
      fall: '🍂',
      winter: '❄️',
      spring: '🌸',
      summer: '☀️'
    };
    return quarters.map(q => quarterMap[q.toLowerCase()] || '📅').join(' ');
  };

  return (
    <div 
      className={`
        bg-white/95 backdrop-blur-sm rounded-xl shadow-lg border border-white/20
        transition-all duration-300 hover:shadow-xl hover:scale-[1.02]
        ${isAnimating ? 'animate-pulse' : ''}
        ${isJoined ? 'ring-2 ring-yellow-400 shadow-yellow-400/25' : ''}
      `}
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-bold text-gray-800 text-lg mb-1 leading-tight">
              {course.code}
            </h3>
            <p className="text-gray-600 text-sm font-medium line-clamp-2">
              {course.name}
            </p>
          </div>
          
          {/* Join/Leave Button */}
          <button
            onClick={handleToggle}
            className={`
              ml-3 px-4 py-2 rounded-lg font-semibold text-sm
              transition-all duration-200 transform hover:scale-105
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

        {/* Course Info Tags */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getLevelColor(course.level)}`}>
            {course.level.toUpperCase()}
          </span>
          <span className="px-2 py-1 rounded-md text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
            {course.credits} units
          </span>
          <span className="px-2 py-1 rounded-md text-xs font-medium bg-orange-100 text-orange-800 border border-orange-200">
            {getQuarterIcons(course.quarters_offered)}
          </span>
        </div>

        {/* Study Group Info */}
        {isJoined && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
            <div className="flex items-center text-yellow-800">
              <i className="fas fa-users mr-2"></i>
              <span className="text-sm font-medium">You're in this study group!</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              Connect with classmates, share notes, and study together.
            </p>
          </div>
        )}

        {/* Prerequisites */}
        {course.prerequisites.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1">Prerequisites:</p>
            <div className="flex flex-wrap gap-1">
              {course.prerequisites.map((prereq, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-mono"
                >
                  {prereq}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Expandable Description */}
        <div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <span>Course Description</span>
            <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'} ml-1 transition-transform`}></i>
          </button>
          
          {isExpanded && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg animate-fade-in">
              <p className="text-sm text-gray-700 leading-relaxed">
                {course.description}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 