import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Display de racha con animación de fuego
 */
export function StreakDisplay({ 
  current, 
  best, 
  type = 'daily',
  showBest = true,
  compact = false 
}) {
  // Determinar intensidad del fuego según racha
  const getFlameIntensity = () => {
    if (current >= 30) return { emoji: '🔥🔥🔥', color: 'from-red-500 to-orange-600', glow: 'shadow-red-500/50' };
    if (current >= 7) return { emoji: '🔥🔥', color: 'from-orange-500 to-yellow-500', glow: 'shadow-orange-500/50' };
    if (current >= 3) return { emoji: '🔥', color: 'from-orange-400 to-yellow-400', glow: 'shadow-orange-400/50' };
    return { emoji: '⚪', color: 'from-gray-300 to-gray-400', glow: 'shadow-gray-400/50' };
  };

  const flame = getFlameIntensity();

  // Mensaje motivacional
  const getMessage = () => {
    if (type === 'daily') {
      if (current === 0) return '¡Empieza tu racha hoy!';
      if (current < 3) return '¡Sigue así!';
      if (current < 7) return '¡Gran racha!';
      if (current < 30) return '¡Imparable!';
      return '¡LEGENDARIO!';
    } else {
      // Racha de respuestas correctas
      if (current === 0) return 'Responde correctamente';
      if (current < 5) return '¡Buena racha!';
      if (current < 10) return '¡En fuego!';
      if (current < 20) return '¡Increíble!';
      return '¡PERFECTO!';
    }
  };

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {/* Icono de fuego */}
        <motion.div
          animate={current > 0 ? {
            scale: [1, 1.2, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{
            duration: 0.5,
            repeat: current > 0 ? Infinity : 0,
            repeatDelay: 2
          }}
          className="text-2xl"
        >
          {flame.emoji}
        </motion.div>

        {/* Contador */}
        <div className="text-lg font-bold text-gray-700">
          {current}
        </div>

        {/* Label */}
        <div className="text-sm text-gray-500">
          {type === 'daily' ? 'días' : 'correctas'}
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`
        relative bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100
        ${current > 0 ? `shadow-xl ${flame.glow}` : ''}
      `}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-700">
            {type === 'daily' ? 'Racha Diaria' : 'Racha Actual'}
          </h3>
          <p className="text-sm text-gray-500">
            {getMessage()}
          </p>
        </div>

        {/* Icono de fuego animado */}
        <motion.div
          animate={current > 0 ? {
            scale: [1, 1.3, 1],
            rotate: [0, 10, -10, 0]
          } : {}}
          transition={{
            duration: 1,
            repeat: current > 0 ? Infinity : 0,
            repeatDelay: 1,
            ease: "easeInOut"
          }}
          className="text-6xl"
        >
          {flame.emoji}
        </motion.div>
      </div>

      {/* Contador principal */}
      <div className="relative mb-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            delay: 0.2
          }}
          className={`
            inline-block px-8 py-4 rounded-2xl
            bg-gradient-to-r ${flame.color}
            shadow-lg ${flame.glow}
          `}
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
              {type === 'daily' ? 'días consecutivos' : 'respuestas seguidas'}
            </div>
          </div>
        </motion.div>

        {/* Efecto de partículas si tiene racha activa */}
        {current >= 3 && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-orange-400"
                style={{
                  left: `${50 + Math.cos((i * Math.PI) / 3) * 60}%`,
                  top: `${50 + Math.sin((i * Math.PI) / 3) * 60}%`,
                }}
                animate={{
                  y: [0, -20, 0],
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeOut"
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Record personal */}
      {showBest && best > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200"
        >
          <span className="text-2xl">👑</span>
          <div className="text-sm">
            <span className="text-gray-500">Mejor racha:</span>
            <span className="font-bold text-indigo-600 ml-1">
              {best} {type === 'daily' ? 'días' : 'correctas'}
            </span>
          </div>
        </motion.div>
      )}

      {/* Mensaje de ánimo para racha perdida */}
      {current === 0 && best > 0 && type === 'daily' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <p className="text-xs text-blue-700 text-center">
            💪 ¡No te rindas! Tu récord es de <strong>{best} días</strong>
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
