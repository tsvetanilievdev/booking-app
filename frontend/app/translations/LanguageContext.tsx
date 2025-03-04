'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { translations, Language, TranslationKeys } from './index';

type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
};

const defaultLanguage: Language = 'en';

const LanguageContext = createContext<LanguageContextType>({
  language: defaultLanguage,
  setLanguage: () => {},
  t: () => ''
});

export const useLanguage = () => useContext(LanguageContext);

type LanguageProviderProps = {
  children: ReactNode;
};

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [language, setLanguage] = useState<Language>(defaultLanguage);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && Object.keys(translations).includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
    document.documentElement.lang = lang;
  };

  // Translation function
  const t = (key: string): string => {
    const keys = key.split('.');
    // Type assertion to fix TypeScript error
    let value: any = translations[language as keyof typeof translations];
    
    for (const k of keys) {
      if (value && k in value) {
        value = value[k as keyof typeof value];
      } else {
        // Fallback to English if key not found in current language
        let fallbackValue: any = translations['en'];
        for (const fk of keys) {
          if (fallbackValue && fk in fallbackValue) {
            fallbackValue = fallbackValue[fk as keyof typeof fallbackValue];
          } else {
            return key; // Return the key if not found in fallback
          }
        }
        return typeof fallbackValue === 'string' ? fallbackValue : key;
      }
    }
    
    return typeof value === 'string' ? value : key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
} 