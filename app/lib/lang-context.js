'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { I18N } from './i18n';

export const LangContext = createContext({ lang: 'fr', setLang: () => {}, t: (k) => k });

export function LangProvider({ children, initialLang = 'fr' }) {
  const [lang, setLangState] = useState(initialLang);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem('aureus_lang') : null;
    if (saved && ['fr','nl','en','de'].includes(saved)) setLangState(saved);
  }, []);

  const setLang = (l) => {
    setLangState(l);
    if (typeof window !== 'undefined') localStorage.setItem('aureus_lang', l);
  };

  const t = (key) => {
    const entry = I18N[key];
    if (!entry) return key;
    if (Array.isArray(entry[lang])) return entry[lang];
    return entry[lang] || entry['fr'] || key;
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
