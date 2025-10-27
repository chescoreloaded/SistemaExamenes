import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Componente toggle de modo oscuro con 2 variantes
 */
export function DarkModeToggle({ isDark, toggle, variant = 'circle' }) {
  
  if (variant === 'switch') {
    // Variante: Switch horizontal
    return (
      <button
        onClick={toggle}
        className="relative inline-flex h-8 w-16 items-center rounded-full transition-colors bg-gray-300 dark:bg-indigo-600"
      >
        <motion.span
          className="inline-block h-6 w-6 transform rounded-full bg-white shadow-lg flex items-center justify-center"
          animate={{ x: isDark ? 36 : 4 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <span className="text-xs">
            {isDark ? '🌙' : '☀️'}
          </span>
        </motion.span>
      </button>
    );
  }

  // Variante por defecto: Botón circular
  return (
    <motion.button
      onClick={toggle}
      className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 border-2 border-gray-200 dark:border-gray-700"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span
        key={isDark ? 'dark' : 'light'}
        initial={{ rotate: -180, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        exit={{ rotate: 180, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="text-2xl block"
      >
        {isDark ? '🌙' : '☀️'}
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
