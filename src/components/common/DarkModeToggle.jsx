import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export function DarkModeToggle({ isDark, toggle, variant = 'circle' }) {
  
  if (variant === 'switch') {
    return (
      <button
        onClick={toggle}
        className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors ${isDark ? 'bg-indigo-600' : 'bg-gray-300'}`}
      >
        <span className="sr-only">Toggle Dark Mode</span>
        <motion.span
          className="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg flex items-center justify-center"
          animate={{ x: isDark ? 36 : 4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <span className="text-xs">
            {isDark ? '☀️' : '🌙'}
          </span>
        </motion.span>
      </button>
    );
  }

  return (
    <motion.button
      onClick={toggle}
      // ✅ CAMBIO: w-10 h-10 flex items-center justify-center (reemplaza p-2.5)
      className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle Dark Mode"
    >
      <motion.span
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 180, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="text-xl block"
      >
        {isDark ? '☀️' : '🌙'}
      </motion.span>
    </motion.button>
  );
}

DarkModeToggle.propTypes = {
  isDark: PropTypes.bool.isRequired,
  toggle: PropTypes.func.isRequired,
  variant: PropTypes.oneOf(['circle', 'switch'])
};

export default DarkModeToggle;