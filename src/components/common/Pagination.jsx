import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useSoundContext } from '@/context/SoundContext';

export function Pagination({ currentPage, totalPages, onPageChange, className = '' }) {
  const { t } = useLanguage();
  const { playClick } = useSoundContext();

  if (totalPages <= 1) return null;

  const handlePrevious = () => {
    if (currentPage > 1) {
      playClick();
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      playClick();
      onPageChange(currentPage + 1);
    }
  };

  // Reemplazo simple para el texto "Página X de Y"
  const pageText = t('common.pagination.pageOf')
    .replace('{current}', currentPage)
    .replace('{total}', totalPages);

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handlePrevious}
        disabled={currentPage === 1}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          ${currentPage === 1 
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' 
            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm border border-gray-200 dark:border-gray-600'}
        `}
      >
        ← <span className="hidden sm:inline">{t('common.pagination.previous')}</span>
      </motion.button>

      <span className="text-sm font-medium text-gray-600 dark:text-gray-300">
        {pageText}
      </span>

      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleNext}
        disabled={currentPage === totalPages}
        className={`
          flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
          ${currentPage === totalPages 
            ? 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed' 
            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 shadow-sm border border-gray-200 dark:border-gray-600'}
        `}
      >
        <span className="hidden sm:inline">{t('common.pagination.next')}</span> →
      </motion.button>
    </div>
  );
}

Pagination.propTypes = {
  currentPage: PropTypes.number.isRequired,
  totalPages: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default Pagination;