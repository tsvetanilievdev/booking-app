import { useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../translations';

export const useTranslation = () => {
  const { language } = useLanguage();

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      const keys = key.split('.');
      let value = translations[language];

      for (const k of keys) {
        if (value?.[k] === undefined) {
          console.warn(`Translation key not found: ${key} in language ${language}`);
          return key;
        }
        value = value[k];
      }

      if (typeof value !== 'string') {
        console.warn(`Translation value is not a string: ${key} in language ${language}`);
        return key;
      }

      if (params) {
        return Object.entries(params).reduce(
          (acc, [paramKey, paramValue]) => 
            acc.replace(new RegExp(`\\{\\{${paramKey}\\}\\}`, 'g'), paramValue), 
          value
        );
      }

      return value;
    },
    [language]
  );

  return { t, language };
}; 