'use client';

import { useState } from 'react';

interface InterestTag {
  id: string;
  name: string;
  icon: string;
  color: string;
  description?: string;
}

interface CategoryData {
  id: string;
  name: string;
  icon: string;
  description: string;
  color: string;
  tags: InterestTag[];
}

interface InterestCategoryProps {
  category: CategoryData;
  selectedTags: Set<string>;
  onTagToggle: (tagId: string) => void;
}

export default function InterestCategory({ category, selectedTags, onTagToggle }: InterestCategoryProps) {
  const [hoveredTag, setHoveredTag] = useState<string | null>(null);

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
      {/* Category Header */}
      <div className="text-center mb-8">
        <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r ${category.color} flex items-center justify-center text-3xl shadow-lg`}>
          {category.icon}
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">{category.name}</h2>
        <p className="text-gray-200 text-lg">{category.description}</p>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {category.tags.map((tag) => {
          const isSelected = selectedTags.has(tag.id);
          const isHovered = hoveredTag === tag.id;
          
          return (
            <button
              key={tag.id}
              onClick={() => onTagToggle(tag.id)}
              onMouseEnter={() => setHoveredTag(tag.id)}
              onMouseLeave={() => setHoveredTag(null)}
              className={`
                group relative p-4 rounded-2xl border-2 transition-all duration-300 transform
                ${isSelected 
                  ? 'bg-white border-white shadow-lg scale-105 text-gray-800' 
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/40 hover:scale-102'
                }
                ${isHovered ? 'shadow-xl' : ''}
              `}
            >
              {/* Selection Indicator */}
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg">
                  ✓
                </div>
              )}

              {/* Tag Content */}
              <div className="flex flex-col items-center text-center">
                <div className="text-2xl mb-2 transition-transform duration-200 group-hover:scale-110">
                  {tag.icon}
                </div>
                <span className="font-semibold text-sm leading-tight">
                  {tag.name}
                </span>
              </div>

              {/* Hover Effect */}
              <div className={`
                absolute inset-0 rounded-2xl bg-gradient-to-r from-yellow-400/20 to-yellow-500/20 
                opacity-0 transition-opacity duration-300
                ${isHovered && !isSelected ? 'opacity-100' : ''}
              `} />
            </button>
          );
        })}
      </div>

      {/* Category Stats */}
      <div className="mt-8 text-center">
        <div className="inline-flex items-center gap-4 bg-white/10 rounded-2xl px-6 py-3">
          <div className="text-white">
            <span className="font-bold text-lg">
              {category.tags.filter(tag => selectedTags.has(tag.id)).length}
            </span>
            <span className="text-gray-200 ml-1">
              / {category.tags.length} selected
            </span>
          </div>
          <div className="w-32 bg-white/20 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-2 rounded-full transition-all duration-500"
              style={{ 
                width: `${(category.tags.filter(tag => selectedTags.has(tag.id)).length / category.tags.length) * 100}%` 
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 