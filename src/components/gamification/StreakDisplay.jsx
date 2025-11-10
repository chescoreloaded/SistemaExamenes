import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useLanguage } from '@/context/LanguageContext'; // ✅ Import hook

export function StreakDisplay({ 
  current, 
  best, 
  type = 'daily',
  showBest = true,
  compact = false 
}) {
  const { t } = useLanguage(); // ✅ Usar hook

  const getFlameIntensity = () => {
    if (current >= 30) return { emoji: '🔥🔥🔥', color: 'from-red-500 to-orange-600', glow: 'shadow-red-500/50' };
    if (current >= 7) return { emoji: '🔥🔥', color: 'from-orange-500 to-yellow-500', glow: 'shadow-orange-500/50' };
    if (current >= 3) return { emoji: '🔥', color: 'from-orange-400 to-yellow-400', glow: 'shadow-orange-400/50' };
    return { emoji: '⚪', color: 'from-gray-300 to-gray-400', glow: 'shadow-gray-400/50' };
  };

  const flame = getFlameIntensity();

  // Mensaje motivacional traducido
  const getMessage = () => {
    if (type === 'daily') {
      if (current === 0) return t('gamification.streak.messages.daily.start');
      if (current < 3) return t('gamification.streak.messages.daily.keepGoing');
      if (current < 7) return t('gamification.streak.messages.daily.great');
      if (current < 30) return t('gamification.streak.messages.daily.unstoppable');
      return t('gamification.streak.messages.daily.legendary');
    } else {
      if (current === 0) return t('gamification.streak.messages.correct.start');
      if (current < 5) return t('gamification.streak.messages.correct.good');
      if (current < 10) return t('gamification.streak.messages.correct.onFire');
      if (current < 20) return t('gamification.streak.messages.correct.incredible');
      return t('gamification.streak.messages.correct.perfect');
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <motion.div
          animate={current > 0 ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] } : {}}
          transition={{ duration: 0.5, repeat: current > 0 ? Infinity : 0, repeatDelay: 2 }}
          className="text-2xl"
        >
          {flame.emoji}
        </motion.div>
        <div className="text-lg font-bold text-gray-700 dark:text-gray-300">
          {current}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {type === 'daily' ? t('gamification.streak.days') : t('gamification.streak.correct')} {/* ✅ Traducido */}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`relative bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border-2 border-gray-100 dark:border-gray-700 ${current > 0 ? `shadow-xl ${flame.glow}` : ''}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700 dark:text-white">
            {type === 'daily' ? t('gamification.streak.dailyTitle') : t('gamification.streak.currentTitle')} {/* ✅ Traducido */}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getMessage()}
          </p>
        </div>
        <motion.div
          animate={current > 0 ? { scale: [1, 1.3, 1], rotate: [0, 10, -10, 0] } : {}}
          transition={{ duration: 1, repeat: current > 0 ? Infinity : 0, repeatDelay: 1, ease: "easeInOut" }}
          className="text-6xl"
        >
          {flame.emoji}
        </motion.div>
      </div>

      <div className="relative mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
          className={`inline-block px-8 py-4 rounded-2xl bg-gradient-to-r ${flame.color} shadow-lg ${flame.glow}`}
        >
          <div className="text-center">
            <motion.div
              key={current}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="text-5xl font-bold text-white drop-shadow-lg"
            >
              {current}
            </motion.div>
            <div className="text-sm text-white/90 font-medium mt-1">
              {type === 'daily' ? t('gamification.streak.consecutiveDays') : t('gamification.streak.consecutiveAnswers')} {/* ✅ Traducido */}
            </div>
          </div>
        </motion.div>
        {current >= 3 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-orange-400"
                style={{ left: `${50 + Math.cos((i * Math.PI) / 3) * 60}%`, top: `${50 + Math.sin((i * Math.PI) / 3) * 60}%` }}
                animate={{ y: [0, -20, 0], opacity: [0, 1, 0], scale: [0, 1, 0] }}
                transition={{ duration: 2, repeat: Infinity, delay: i * 0.3, ease: "easeOut" }}
              />
            ))}
          </div>
        )}
      </div>

      {showBest && best > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700"
        >
          <span className="text-2xl">👑</span>
          <div className="text-sm">
            <span className="text-gray-500 dark:text-gray-400">{t('gamification.streak.best')}:</span> {/* ✅ Traducido */}
            <span className="font-bold text-indigo-600 dark:text-indigo-400 ml-1">
              {best} {type === 'daily' ? t('gamification.streak.days') : t('gamification.streak.correct')} {/* ✅ Traducido */}
            </span>
          </div>
        </motion.div>
      )}

      {current === 0 && best > 0 && type === 'daily' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg"
        >
          <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
            {t('gamification.streak.encouragement')} <strong>{best} {t('gamification.streak.days')}</strong> {/* ✅ Traducido */}
          </p>
        </motion.div>
      )}
    </motion.div>
  );
}

StreakDisplay.propTypes = {
  current: PropTypes.number.isRequired,
  best: PropTypes.number.isRequired,
  type: PropTypes.oneOf(['daily', 'correct']),
  showBest: PropTypes.bool,
  compact: PropTypes.bool
};

StreakDisplay.defaultProps = {
  type: 'daily',
  showBest: true,
  compact: false
};

export default StreakDisplay;
