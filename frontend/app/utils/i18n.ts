import en from '../../messages/en.json';
import bg from '../../messages/bg.json';

export type Language = 'en' | 'bg';

// Define supported languages
export const languages = {
  en: 'English',
  bg: 'Български'
};

// Get nested translation by path
export function getTranslation(obj: any, path: string, params?: Record<string, string | number>): string {
  const keys = path.split('.');
  let result: any = obj;
  
  for (const key of keys) {
    if (result && result[key] !== undefined) {
      result = result[key];
    } else {
      // Key not found
      return path;
    }
  }
  
  // Replace parameters in translation if needed
  if (typeof result === 'string' && params) {
    return result.replace(/{(\w+)}/g, (_, key) => {
      return params[key]?.toString() || '';
    });
  }
  
  return typeof result === 'string' ? result : path;
}

// Main translation function
export function translate(path: string, language: Language = 'en', params?: Record<string, string | number>): string {
  const translations = language === 'bg' ? bg : en;
  return getTranslation(translations, path, params);
}

// Hook creator for component-based translation
export function createTranslator(language: Language) {
  return (path: string, params?: Record<string, string | number>) => {
    return translate(path, language, params);
  };
} 