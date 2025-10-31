import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import enTranslations from '../locales/en.json';
import zhTranslations from '../locales/zh.json';

type Language = 'en' | 'zh';

type TranslationNode = string | number | boolean | null | TranslationNode[] | { [key: string]: TranslationNode };

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    getSection: <T = Record<string, unknown>>(key: string) => T;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const fallbackLanguage: Language = 'en';

const translationTrees: Record<Language, TranslationNode> = {
    en: enTranslations as TranslationNode,
    zh: zhTranslations as TranslationNode
};

const resolvePath = (tree: TranslationNode | undefined, path: string): TranslationNode | undefined => {
    if (!tree) return undefined;
    if (!path) return tree;
    const segments = path.split('.');
    return segments.reduce<TranslationNode | undefined>((current, segment) => {
        if (current === undefined || current === null) return undefined;
        if (Array.isArray(current)) {
            const index = Number(segment);
            if (Number.isNaN(index)) return undefined;
            return current[index];
        }
        if (typeof current === 'object') {
            return (current as Record<string, TranslationNode>)[segment];
        }
        return undefined;
    }, tree);
};

const formatTemplate = (template: string, params?: Record<string, string | number>) => {
    if (!params) return template;
    return template.replace(/\{([^}]+)\}/g, (_, key) => {
        const trimmed = key.trim();
        if (trimmed in params) {
            return String(params[trimmed]);
        }
        return `{${trimmed}}`;
    });
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [language, setLanguageState] = useState<Language>(() => {
        const saved = localStorage.getItem('language');
        if (saved === 'en' || saved === 'zh') return saved;

        const browserLang = navigator.language.toLowerCase();
        return browserLang.startsWith('zh') ? 'zh' : 'en';
    });

    useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    const setLanguage = (lang: Language) => {
        setLanguageState(lang);
    };

    const t = (key: string, params?: Record<string, string | number>): string => {
        const primary = resolvePath(translationTrees[language], key);
        const fallback = language === fallbackLanguage ? undefined : resolvePath(translationTrees[fallbackLanguage], key);
        const value = typeof primary === 'string' ? primary : typeof fallback === 'string' ? fallback : undefined;
        if (!value) {
            return key;
        }
        return formatTemplate(value, params);
    };

    const getSection = <T,>(key: string): T => {
        const primary = resolvePath(translationTrees[language], key);
        if (primary && typeof primary === 'object') {
            return primary as T;
        }
        const fallback = language === fallbackLanguage ? undefined : resolvePath(translationTrees[fallbackLanguage], key);
        if (fallback && typeof fallback === 'object') {
            return fallback as T;
        }
        return {} as T;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t, getSection }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within LanguageProvider');
    }
    return context;
};
