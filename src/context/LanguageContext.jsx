import { createContext, useContext, useState, useEffect } from 'react';
// ✅ IMPORTAR las traducciones
import { TRANSLATIONS } from '@/data/translations';

export const LANGUAGES = {
  ES: 'es',
  EN: 'en'
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    const savedLang = localStorage.getItem('appLanguage');
    return Object.values(LANGUAGES).includes(savedLang) ? savedLang : LANGUAGES.ES;
  });

  useEffect(() => {
    localStorage.setItem('appLanguage', language);
    document.documentElement.lang = language;
  }, [language]);

  const changeLanguage = (langCode) => {
    if (Object.values(LANGUAGES).includes(langCode)) {
      setLanguage(langCode);
    }
  };

  // ✅ NUEVA FUNCIÓN: t('home.title') -> devuelve el texto correcto
  const t = (key) => {
    const keys = key.split('.');
    let value = TRANSLATIONS[language];
    for (const k of keys) {
      value = value?.[k];
    }
    // Fallback si no encuentra la key: devuelve la key misma para que notemos el error
    return value || key;
  };

  const value = {
    language,
    changeLanguage,
    LANGUAGES,
    t // ✅ Exportamos la función t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage debe ser usado dentro de un LanguageProvider');
  }
  return context;
}