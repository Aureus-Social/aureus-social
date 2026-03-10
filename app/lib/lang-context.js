'use client';
import { createContext, useContext, useState, useEffect } from 'react';
import { I18N } from './i18n';

export const LangContext = createContext({ lang: 'fr', setLang: () => {}, t: (k) => k, tText: (s) => s });

export function LangProvider({ children, initialLang = 'fr' }) {
  const [lang, setLangState] = useState(initialLang);

  useEffect(() => {
    try {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('aureus_lang') : null;
      if (saved && ['fr','nl','en','de'].includes(saved)) setLangState(saved);
    } catch(e) { /* localStorage bloqué (iOS Safari protections) */ }
  }, []);

  const setLang = (l) => {
    setLangState(l);
    try {
      if (typeof window !== 'undefined') localStorage.setItem('aureus_lang', l);
    } catch(e) { /* localStorage bloqué (iOS Safari protections) */ }
  };

  const t = (key) => {
    const entry = I18N[key];
    if (!entry) return null;
    if (Array.isArray(entry[lang])) return entry[lang];
    return entry[lang] || entry['fr'] || null;
  };

  // Traduit automatiquement un texte FR vers la langue active
  const tText = (frText) => {
    if (lang === 'fr') return frText;
    // Chercher dans toutes les entrées i18n
    for (const entry of Object.values(I18N)) {
      if (typeof entry === 'object' && entry.fr === frText && entry[lang]) {
        return entry[lang];
      }
    }
    return frText; // Fallback: retourner le texte FR original
  };

  return (
    <LangContext.Provider value={{ lang, setLang, t, tText }}>
      {children}
    </LangContext.Provider>
  );
}

export function useLang() {
  return useContext(LangContext);
}
