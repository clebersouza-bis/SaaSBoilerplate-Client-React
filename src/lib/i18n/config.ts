// lib/i18n/config.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import * as enTranslations from './locales/en.json';
import * as ptTranslations from './locales/pt.json';
import * as esTranslations from './locales/es.json';

// Available languages
export const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'pt', name: 'Português', flag: '🇧🇷' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
] as const;

export type LanguageCode = 'en' | 'pt' | 'es';

// Initialize i18n
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: enTranslations },
      pt: { translation: ptTranslations },
      es: { translation: esTranslations },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'pt', 'es'],
    
    // Detection options
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
      lookupLocalStorage: 'i18nextLng',
      lookupFromPathIndex: 0,
      lookupFromSubdomainIndex: 0,
    },
    
    interpolation: {
      escapeValue: false, // React já protege contra XSS
      // Configuração para usar {{ }} como delimitadores
      prefix: '{{',
      suffix: '}}',
      // Função de interpolação customizada se necessário
      format: (value, format, lng) => {
        if (format === 'uppercase') return value.toUpperCase();
        if (format === 'lowercase') return value.toLowerCase();
        if (format === 'capitalize') {
          return value.charAt(0).toUpperCase() + value.slice(1);
        }
        return value;
      }
    },
    
    // Opções de tradução
    saveMissing: import.meta.env.DEV, // Salva strings faltantes apenas em desenvolvimento
    missingKeyHandler: (lng, ns, key) => {
      if (import.meta.env.DEV) {
        console.warn(`[i18n] Missing translation: ${key} in language ${lng}`);
      }
    },
    
    react: {
      useSuspense: false, // Prevents suspense on initial load
      bindI18n: 'languageChanged loaded',
      bindI18nStore: 'added removed',
    },
    
    // Debug apenas em desenvolvimento
    debug: import.meta.env.DEV,
  });

// Função auxiliar para usar variáveis
export const createT = (namespace?: string) => {
  return (key: string, variables?: Record<string, any>) => {
    return i18n.t(key, { ns: namespace, ...variables });
  };
};

export default i18n;