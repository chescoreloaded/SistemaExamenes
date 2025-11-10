import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Header del modo examen y práctica
 * ✅ ACTUALIZADO: Dark mode completo + transiciones suaves
 */
export function ExamHeader({
  subjectName,
  subjectIcon,
  mode,
  timeRemaining,
  showTimer,
  answeredCount,
  totalQuestions,
  progress
}) {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.header 
      className="
        bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 
        dark:from-blue-700 dark:via-indigo-700 dark:to-purple-700
        text-white shadow-xl 
        border-b-4 border-white/20 dark:border-white/10
        sticky top-0 z-40
        transition-colors duration-300
      "
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Subject info COMPACTO */}
          <div className="flex items-center gap-3">
            <motion.span 
              className="text-3xl"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              {subjectIcon}
            </motion.span>
            <div>
              <h1 className="text-lg font-bold">{subjectName}</h1>
              <p className="text-xs text-white/90 dark:text-white/80 font-medium transition-colors duration-300">
                {mode === 'exam' ? '📝 Modo Examen' : '🎯 Modo Práctica'}
              </p>
            </div>
          </div>
          
          {/* Timer COMPACTO */}
          {showTimer && (
            <motion.div 
              className={`
                text-xl font-bold px-5 py-2.5 rounded-xl shadow-lg
                transition-all duration-300
                ${timeRemaining < 300 
                  ? 'bg-red-500/90 dark:bg-red-600/90 animate-pulse' 
                  : 'bg-white/20 dark:bg-white/10 backdrop-blur-sm'
                }
              `}
              animate={timeRemaining < 300 ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 1, repeat: timeRemaining < 300 ? Infinity : 0 }}
            >
              ⏱️ {formatTime(timeRemaining)}
            </motion.div>
          )}
          
          {/* Progress info COMPACTO */}
          <div className="text-right">
            <div className="text-xl font-bold">
              {answeredCount} / {totalQuestions}
            </div>
            <div className="text-xs text-white/90 dark:text-white/80 font-medium transition-colors duration-300">
              {Math.round(progress)}% completado
            </div>
          </div>
        </div>
        
        {/* Progress bar COMPACTA con dark mode */}
        <div className="mt-3 bg-white/20 dark:bg-white/10 rounded-full h-2.5 overflow-hidden shadow-inner transition-colors duration-300">
          <motion.div 
            className="
              bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 
              dark:from-green-500 dark:via-emerald-500 dark:to-teal-500
              h-full rounded-full shadow-lg
              transition-colors duration-300
            "
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.header>
  );
}

ExamHeader.propTypes = {
  subjectName: PropTypes.string.isRequired,
  subjectIcon: PropTypes.string,
  mode: PropTypes.string.isRequired,
  timeRemaining: PropTypes.number,
  showTimer: PropTypes.bool,
  answeredCount: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  progress: PropTypes.number.isRequired
};

export default ExamHeader;