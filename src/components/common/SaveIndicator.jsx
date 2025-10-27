import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Indicador visual del estado de guardado
 */
export  function SaveIndicator({ 
  status = 'idle', 
  lastSaved = null,
  className = '' 
}) {
  const getStatusConfig = () => {
    switch (status) {
      case 'saving':
        return {
          icon: (
            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          ),
          text: 'Guardando...',
          color: 'text-blue-600',
          bg: 'bg-blue-100',
          show: true
        };
      case 'saved':
        return {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          text: 'Guardado',
          color: 'text-green-600',
          bg: 'bg-green-100',
          show: true
        };
      case 'error':
        return {
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          text: 'Error al guardar',
          color: 'text-red-600',
          bg: 'bg-red-100',
          show: true
        };
      default:
        return {
          show: false
        };
    }
  };

  const config = getStatusConfig();

  if (!config.show) return null;

  return (
    <AnimatePresence>
      <motion.div
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${config.bg} ${className}`}
        initial={{ opacity: 0, y: -10, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.9 }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          className={config.color}
          animate={status === 'saving' ? { rotate: 360 } : {}}
          transition={status === 'saving' ? { 
            repeat: Infinity, 
            duration: 1, 
            ease: "linear" 
          } : {}}
        >
          {config.icon}
        </motion.div>
        <span className={`text-xs font-medium ${config.color}`}>
          {config.text}
        </span>
        {lastSaved && status === 'saved' && (
          <span className="text-xs text-gray-500">
            {formatLastSaved(lastSaved)}
          </span>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function formatLastSaved(date) {
  const seconds = Math.floor((new Date() - date) / 1000);
  
  if (seconds < 60) return 'ahora';
  if (seconds < 3600) return `hace ${Math.floor(seconds / 60)}m`;
  return `hace ${Math.floor(seconds / 3600)}h`;
}

SaveIndicator.propTypes = {
  status: PropTypes.oneOf(['idle', 'saving', 'saved', 'error']),
  lastSaved: PropTypes.instanceOf(Date),
  className: PropTypes.string
};

export default SaveIndicator;
