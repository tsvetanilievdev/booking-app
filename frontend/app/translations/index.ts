import { enTranslations } from './en';
import { bgTranslations } from './bg';

export const translations = {
  en: enTranslations,
  bg: bgTranslations
};

export type Language = 'en' | 'bg' | 'es' | 'fr' | 'de';
export type TranslationKeys = typeof enTranslations; 