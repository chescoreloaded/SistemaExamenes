import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useLanguage } from '@/context/LanguageContext';

export function SearchBar({ onSearch, className = '' }) {
  const { t } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce simple para no filtrar en cada pulsación de tecla
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      onSearch(searchTerm);
    }, 300); // Espera 300ms después de que el usuario deja de escribir

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, onSearch]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative ${className}`}
    >
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <span className="text-xl">🔍</span>
      </div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder={t('search.placeholder') || 'Buscar cursos...'} // Asegúrate de agregar esta clave a translations.js
        className="
          w-full pl-12 pr-4 py-4
          bg-white dark:bg-gray-800 
          border-2 border-gray-200 dark:border-gray-700 
          rounded-2xl shadow-sm
          text-lg text-gray-700 dark:text-white placeholder-gray-400 dark:placeholder-gray-500
          focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none
          transition-all duration-200
        "
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          ✕
        </button>
      )}
    </motion.div>
  );
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default SearchBar;