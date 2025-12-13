// hooks/useTranslation.ts
import { useTranslation as useI18nTranslation } from 'react-i18next';
import { LanguageCode, LanguageName, LANGUAGES } from '@/lib/i18n/config';

// Tipo para variáveis de tradução
export type TranslationVariables = Record<string, string | number | Date>;

export function useTranslation() {
  const { t, i18n, ready } = useI18nTranslation();
  
  const currentLanguage = i18n.language as LanguageCode;
  const currentLanguageName = i18n.language as LanguageName;
  
  const changeLanguage = async (lang: LanguageCode) => {
    await i18n.changeLanguage(lang);
    localStorage.setItem('i18nextLng', lang);
    
    // Atualiza atributo HTML lang para acessibilidade
    document.documentElement.lang = lang;
    
    // Atualiza título da página se houver
    const pageTitle = t('common.pageTitle', { defaultValue: '' });
    if (pageTitle) {
      document.title = pageTitle;
    }
  };
  
  const getCurrentLanguage = () => {
    return LANGUAGES.find(lang => lang.code === currentLanguage) || LANGUAGES[0];
  };
  
  // Função t tipada com suporte a variáveis
  const typedT = (key: string, variables?: TranslationVariables): string => {
    return t(key, variables);
  };
  
  // Helper para formatação de números/datas específica por idioma
  const formatNumber = (value: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat(currentLanguage, options).format(value);
  };
  
  const formatDate = (date: Date | string, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat(currentLanguage, options).format(dateObj);
  };
  
  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat(currentLanguage, {
      style: 'currency',
      currency,
    }).format(value);
  };
  
  // Verifica se uma chave existe
  const hasTranslation = (key: string): boolean => {
    return i18n.exists(key);
  };
  
  // Obtém tradução com fallback explícito
  const getTranslation = (
    key: string, 
    variables?: TranslationVariables, 
    fallback?: string
  ): string => {
    if (hasTranslation(key)) {
      return t(key, variables);
    }
    return fallback || key;
  };

  return {
    // Função principal de tradução
    t: typedT,
    
    // Funções auxiliares
    formatNumber,
    formatDate,
    formatCurrency,
    hasTranslation,
    getTranslation,
    
    // Estado e controle
    i18n,
    ready,
    currentLanguage,
    currentLanguageName,
    changeLanguage,
    getCurrentLanguage,
    languages: LANGUAGES,
    
    // Informações do idioma atual
    isRTL: ['ar', 'he', 'fa'].includes(currentLanguage), // Exemplo para RTL
    direction: ['ar', 'he', 'fa'].includes(currentLanguage) ? 'rtl' : 'ltr',
  };
}

// Hook específico para namespaces (opcional)
export function useNamespaceTranslation(namespace: string) {
  const { t, i18n, ready } = useI18nTranslation(namespace);
  
  const typedT = (key: string, variables?: TranslationVariables): string => {
    return t(key, variables);
  };
  
  return {
    t: typedT,
    i18n,
    ready,
  };
}