import { en } from './en';
import { es } from './es';
import { getUserLanguage } from '../utils/storage';

export const translations = {
    en,
    es
};

export type Language = keyof typeof translations;
export type TranslationKey = keyof typeof en;

export function getTranslation(locale: string = 'en', userId?: string) {
    // If userId is provided, try to get their stored language preference
    if (userId) {
        const storedLang = getUserLanguage(userId);
        if (storedLang && translations[storedLang as Language]) {
            return translations[storedLang as Language];
        }
    }

    // Normalize locale to just the language part (e.g., 'en-US' -> 'en')
    const lang = locale.split('-')[0].toLowerCase();
    
    // Return the translation for the language, fallback to English if not found
    return translations[lang as Language] || translations.en;
}

export function t(locale: string, key: string, params: Record<string, string> = {}, userId?: string) {
    const translation = getTranslation(locale, userId);
    const keys = key.split('.');
    
    // Navigate through the translation object
    let value: any = translation;
    for (const k of keys) {
        value = value?.[k];
        if (!value) return key; // Return the key if translation not found
    }

    // Replace parameters in the string
    return typeof value === 'string' 
        ? value.replace(/\{(\w+)\}/g, (_, k) => params[k] || `{${k}}`)
        : key;
}
