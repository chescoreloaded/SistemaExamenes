import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';

export function LanguageSelector({ variant = 'default' }) {
  const { language, changeLanguage, LANGUAGES } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = () => {
    if (variant !== 'readOnly') setIsOpen(!isOpen);
  };

  const handleSelect = (lang) => {
    changeLanguage(lang);
    setIsOpen(false);
  };

  const langConfig = {
    [LANGUAGES.ES]: { label: 'Español', flag: '🇪🇸', short: 'ES' },
    [LANGUAGES.EN]: { label: 'English', flag: '🇺🇸', short: 'EN' }
  };

  const currentLang = langConfig[language];

  // ✅ MODO SOLO LECTURA: Tamaño fijo w-10 h-10
  if (variant === 'readOnly') {
    return (
      <div 
        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-200 dark:border-gray-700 cursor-default"
        title={`Idioma actual: ${currentLang.label}`}
      >
        <span className="text-lg leading-none">
          {currentLang.flag}
        </span>
      </div>
    );
  }

  // MODO DEFAULT (Interactivo)
  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={toggleDropdown}
        // Agregamos h-10 para que coincida en altura con los botones circulares
        className="h-10 flex items-center gap-2 px-3 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 transition-colors duration-200"
        aria-label="Seleccionar idioma"
      >
        <span className="text-lg leading-none">{currentLang.flag}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-200 hidden sm:inline">
          {currentLang.short}
        </span>
        <span className="text-xs text-gray-400">▼</span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50"
          >
            <div className="py-1">
              {Object.values(LANGUAGES).map((langCode) => {
                const config = langConfig[langCode];
                const isSelected = language === langCode;
                return (
                  <button
                    key={langCode}
                    onClick={() => handleSelect(langCode)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-200
                      ${isSelected 
                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 font-semibold' 
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      }
                    `}
                  >
                    <span className="text-xl">{config.flag}</span>
                    <span className="text-sm">{config.label}</span>
                    {isSelected && (
                      <span className="ml-auto text-indigo-600 dark:text-indigo-400">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

LanguageSelector.propTypes = {
  variant: PropTypes.oneOf(['default', 'readOnly'])
};