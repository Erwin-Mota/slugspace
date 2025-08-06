'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

interface SurveyContextType {
  currentQuestion: number;
  tags: Set<string>;
  addTags: (tags: string[]) => void;
  next: () => void;
  prev: () => void;
  reset: () => void;
}

const SurveyContext = createContext<SurveyContextType | undefined>(undefined);

export function useSurvey() {
  const context = useContext(SurveyContext);
  if (!context) {
    throw new Error('useSurvey must be used within a SurveyProvider');
  }
  return context;
}

interface SurveyProviderProps {
  children: React.ReactNode;
}

export function SurveyProvider({ children }: SurveyProviderProps) {
  const [currentQuestion, setCurrentQuestion] = useState(1);
  const [tags, setTags] = useState<Set<string>>(new Set());

  // Hydrate from localStorage on mount
  useEffect(() => {
    const savedQuestion = localStorage.getItem('survey-current-question');
    const savedTags = localStorage.getItem('survey-tags');
    
    if (savedQuestion) {
      setCurrentQuestion(Number(savedQuestion));
    }
    
    if (savedTags) {
      setTags(new Set(JSON.parse(savedTags)));
    }
  }, []);

  // Persist to localStorage on updates
  useEffect(() => {
    localStorage.setItem('survey-current-question', currentQuestion.toString());
  }, [currentQuestion]);

  useEffect(() => {
    localStorage.setItem('survey-tags', JSON.stringify([...tags]));
  }, [tags]);

  const addTags = (newTags: string[]) => {
    setTags(prev => new Set([...prev, ...newTags]));
  };

  const next = () => {
    setCurrentQuestion(prev => prev + 1);
  };

  const prev = () => {
    setCurrentQuestion(prev => Math.max(1, prev - 1));
  };

  const reset = () => {
    setCurrentQuestion(1);
    setTags(new Set());
  };

  const value: SurveyContextType = {
    currentQuestion,
    tags,
    addTags,
    next,
    prev,
    reset,
  };

  return (
    <SurveyContext.Provider value={value}>
      {children}
    </SurveyContext.Provider>
  );
} 