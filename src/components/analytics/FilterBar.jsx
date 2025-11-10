import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { useSoundContext } from '@/context/SoundContext';
import { useLanguage } from '@/context/LanguageContext'; // ✅ Import hook i18n

/**
 * FilterBar - Barra de filtros para Analytics (Internacionalizada)
 */
export function FilterBar({ onFilterChange, subjects = [], className = '' }) {
  const { playClick } = useSoundContext();
  const { t } = useLanguage(); // ✅ Usar hook i18n
  
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [selectedDateRange, setSelectedDateRange] = useState('all');
  const [isSubjectOpen, setIsSubjectOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);

  // Opciones de rango de fechas traducidas
const dateRangeOptions = [
    { value: 'all', label: t('analytics.filters.allTime') },
    { value: '7days', label: t('analytics.filters.lastWeek') },
    { value: '30days', label: t('analytics.filters.lastMonth') },
    { value: '90days', label: t('analytics.filters.last3Months') }, // ✅ Traducido
    { value: '365days', label: t('analytics.filters.lastYear') }    // ✅ Traducido
  ];
  // Calcular fecha de inicio según rango
const getDateRange = (range) => {
    const now = new Date();
    const end = now.toISOString().split('T')[0];
    let start;
    switch (range) {
      case '7days': start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; break;
      case '30days': start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; break;
      case '90days': start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; break;
      case '365days': start = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; break;
      case 'all': default: return null;
    }
    return { start, end };
  };

  // Notificar cambios
useEffect(() => {
    onFilterChange({
      subjectId: selectedSubject === 'all' ? null : selectedSubject,
      dateRange: getDateRange(selectedDateRange)
    });
  }, [selectedSubject, selectedDateRange]);

  // Handlers
  const handleSubjectChange = (subjectId) => {
    playClick();
    setSelectedSubject(subjectId);
    setIsSubjectOpen(false);
  };

  const handleDateRangeChange = (range) => {
    playClick();
    setSelectedDateRange(range);
    setIsDateOpen(false);
  };

  const handleReset = () => {
    playClick();
    setSelectedSubject('all');
    setSelectedDateRange('all');
  };

  const hasActiveFilters = selectedSubject !== 'all' || selectedDateRange !== 'all';

  return (
    <div className={`flex flex-wrap items-center gap-4 ${className}`}>
      {/* Subject Filter */}
      <div className="relative">
        <button
          onClick={() => { playClick(); setIsSubjectOpen(!isSubjectOpen); setIsDateOpen(false); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 text-gray-700 dark:text-gray-200 font-medium"
        >
          <span className="text-lg">📚</span>
          <span>
            {selectedSubject === 'all' 
              ? t('analytics.filters.allSubjects') // ✅ Usa clave específica
              : subjects.find(s => s.id === selectedSubject)?.name || 'Materia'
            }
          </span>
          <motion.span animate={{ rotate: isSubjectOpen ? 180 : 0 }} className="text-gray-400">▼</motion.span>
        </button>

        <AnimatePresence>
          {isSubjectOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full mt-2 left-0 z-50 w-64 max-h-80 overflow-y-auto bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl"
            >
              <button
                onClick={() => { playClick(); setSelectedSubject('all'); setIsSubjectOpen(false); }}
                className={`w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${selectedSubject === 'all' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
              >
                <span className="text-lg mr-2">📚</span>
                {t('analytics.filters.allSubjects')} {/* ✅ Traducido */}
              </button>
              <div className="border-t border-gray-200 dark:border-gray-700" />
              {subjects.map((subject) => (
                <button
                  key={subject.id}
                  onClick={() => { playClick(); setSelectedSubject(subject.id); setIsSubjectOpen(false); }}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${selectedSubject === subject.id ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  <span className="text-lg mr-2">{subject.icon || '📖'}</span>
                  {subject.name}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Date Range Filter */}
      <div className="relative">
        <button
          onClick={() => { playClick(); setIsDateOpen(!isDateOpen); setIsSubjectOpen(false); }}
          className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-sm hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-200 text-gray-700 dark:text-gray-200 font-medium"
        >
          <span className="text-lg">📅</span>
          <span>{dateRangeOptions.find(d => d.value === selectedDateRange)?.label}</span>
          <motion.span animate={{ rotate: isDateOpen ? 180 : 0 }} className="text-gray-400">▼</motion.span>
        </button>

        <AnimatePresence>
          {isDateOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute top-full mt-2 left-0 z-50 w-56 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg shadow-xl"
            >
              {dateRangeOptions.map((option, index) => (
                <button
                  key={option.value}
                  onClick={() => { playClick(); setSelectedDateRange(option.value); setIsDateOpen(false); }}
                  className={`w-full text-left px-4 py-3 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${index > 0 ? 'border-t border-gray-100 dark:border-gray-700' : ''} ${selectedDateRange === option.value ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 font-semibold' : 'text-gray-700 dark:text-gray-300'}`}
                >
                  {option.label}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Reset Button */}
      {(selectedSubject !== 'all' || selectedDateRange !== 'all') && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 border-2 border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium transition-all"
        >
          <span>🔄</span><span>{t('analytics.filters.clear')}</span>
        </motion.button>
      )}
    </div>
  );
}

FilterBar.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  subjects: PropTypes.arrayOf(PropTypes.shape({ id: PropTypes.string.isRequired, name: PropTypes.string.isRequired, icon: PropTypes.string })),
  className: PropTypes.string
};

export default FilterBar;