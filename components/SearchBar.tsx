'use client';

import { useState, useEffect, useCallback } from 'react';

interface SearchBarProps {
  onSearch: (term: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export default function SearchBar({ 
  onSearch, 
  placeholder = "Search...", 
  className = "", 
  debounceMs = 300 
}: SearchBarProps) {
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(inputValue);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [inputValue, onSearch, debounceMs]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setInputValue('');
    onSearch('');
  }, [onSearch]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(inputValue);
    }
  }, [inputValue, onSearch]);

  return (
    <div className={`relative ${className}`}>
      <div 
        className={`
          relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg
          transition-all duration-300 border-2
          ${isFocused 
            ? 'border-yellow-400 shadow-yellow-400/25 shadow-lg' 
            : 'border-white/20 hover:border-white/40'
          }
        `}
      >
        {/* Search Icon */}
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500">
          <i className="fas fa-search text-lg"></i>
        </div>

        {/* Input Field */}
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          className="
            w-full pl-12 pr-12 py-4 bg-transparent text-gray-800 
            placeholder-gray-500 text-lg font-medium rounded-2xl
            focus:outline-none
          "
        />

        {/* Clear Button */}
        {inputValue && (
          <button
            onClick={handleClear}
            className="
              absolute right-4 top-1/2 transform -translate-y-1/2 
              text-gray-400 hover:text-gray-600 transition-colors
              p-1 rounded-full hover:bg-gray-100
            "
          >
            <i className="fas fa-times"></i>
          </button>
        )}
      </div>

      {/* Search indicator */}
      {inputValue && (
        <div className="absolute -bottom-6 left-0 text-sm text-white/70">
          <i className="fas fa-search animate-pulse mr-1"></i>
          Searching for &quot;{inputValue}&quot;...
        </div>
      )}
    </div>
  );
} 