import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Barra de progreso de nivel con animaciones
 */
export function LevelProgressBar({ 
  level, 
  currentLevelXP, 
  xpForNextLevel, 
  title, 
  icon, 
  color,
  showDetails = true,
  compact = false
}) {
  const progressPercentage = (currentLevelXP / xpForNextLevel) * 100;

  if (compact) {
    return (
      <div className="flex items-center gap-3">
        {/* Nivel */}
        <div className={`
          flex items-center justify-center
          w-12 h-12 rounded-full
          bg-gradient-to-br from-indigo-500 to-purple-600
          text-white font-bold text-lg
          shadow-lg
        `}>
          {level}
        </div>

        {/* Barra compacta */}
        <div className="flex-1">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ 
                duration: 1,
                ease: "easeOut",
                delay: 0.2
              }}
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
            />
          </div>
        </div>

        {/* XP texto */}
        <div className="text-sm font-medium text-gray-600 whitespace-nowrap">
          {currentLevelXP} / {xpForNextLevel} XP
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-100">
      {/* Header con nivel y título */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* Badge de nivel */}
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
            className={`
              relative flex items-center justify-center
              w-16 h-16 rounded-full
              bg-gradient-to-br from-indigo-500 to-purple-600
              text-white font-bold text-2xl
              shadow-xl
              border-4 border-white
            `}
          >
            {level}
            
            {/* Efecto de brillo */}
            <motion.div
              className="absolute inset-0 rounded-full bg-white"
              animate={{
                opacity: [0, 0.3, 0],
                scale: [0.8, 1.2, 0.8]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </motion.div>

          {/* Título e icono */}
          <div>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <span className="text-2xl">{icon}</span>
              <span className={`text-xl font-bold ${color}`}>
                {title}
              </span>
            </motion.div>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="text-sm text-gray-500"
            >
              Nivel {level}
            </motion.p>
          </div>
        </div>

        {/* Nivel siguiente */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="text-right"
          >
            <div className="text-xs text-gray-500">Próximo nivel</div>
            <div className="text-2xl font-bold text-gray-700">{level + 1}</div>
          </motion.div>
        )}
      </div>

      {/* Barra de progreso */}
      <div className="space-y-2">
        {/* Texto de progreso */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-between text-sm"
          >
            <span className="text-gray-600 font-medium">
              Progreso al siguiente nivel
            </span>
            <span className="font-bold text-indigo-600">
              {Math.round(progressPercentage)}%
            </span>
          </motion.div>
        )}

        {/* Barra */}
        <div className="relative h-6 bg-gray-200 rounded-full overflow-hidden shadow-inner">
          {/* Fondo con patrón */}
          <div className="absolute inset-0 opacity-10">
            <div className="w-full h-full bg-gradient-to-r from-transparent via-white to-transparent" />
          </div>

          {/* Progreso */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ 
              duration: 1.5,
              ease: "easeOut",
              delay: 0.3
            }}
            className="relative h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 rounded-full"
          >
            {/* Brillo animado */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent"
              animate={{
                x: ['-100%', '200%']
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                repeatDelay: 1
              }}
              style={{ opacity: 0.3 }}
            />
          </motion.div>

          {/* Texto de XP dentro de la barra */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="text-xs font-bold text-white drop-shadow-lg">
              {currentLevelXP.toLocaleString()} / {xpForNextLevel.toLocaleString()} XP
            </span>
          </motion.div>
        </div>

        {/* XP faltante */}
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center text-xs text-gray-500"
          >
            Faltan <span className="font-semibold text-indigo-600">
              {(xpForNextLevel - currentLevelXP).toLocaleString()} XP
            </span> para el siguiente nivel
          </motion.div>
        )}
      </div>
    </div>
  );
}

LevelProgressBar.propTypes = {
  level: PropTypes.number.isRequired,
  currentLevelXP: PropTypes.number.isRequired,
  xpForNextLevel: PropTypes.number.isRequired,
  title: PropTypes.string,
  icon: PropTypes.string,
  color: PropTypes.string,
  showDetails: PropTypes.bool,
  compact: PropTypes.bool
};

LevelProgressBar.defaultProps = {
  title: 'Novato',
  icon: '🌱',
  color: 'text-gray-500',
  showDetails: true,
  compact: false
};

export default LevelProgressBar;
