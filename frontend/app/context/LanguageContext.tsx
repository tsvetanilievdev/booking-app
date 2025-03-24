'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'bg';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Default language
const DEFAULT_LANGUAGE: Language = 'en';

// Get language from localStorage or use default
const getInitialLanguage = (): Language => {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;
  
  const savedLanguage = localStorage.getItem('language') as Language;
  return savedLanguage && ['en', 'bg'].includes(savedLanguage) 
    ? savedLanguage 
    : DEFAULT_LANGUAGE;
};

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  
  useEffect(() => {
    // Set initial language on client side
    setLanguageState(getInitialLanguage());
  }, []);
  
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('language', newLanguage);
      
      // Set HTML lang attribute
      document.documentElement.lang = newLanguage;
    }
  };
  
  // Set initial HTML lang attribute
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);
  
  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
} 