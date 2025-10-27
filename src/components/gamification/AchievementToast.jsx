import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { getRarityColor, getRarityLabel } from '@/data/achievements';

/**
 * Toast animado para mostrar logro desbloqueado
 */
export function AchievementToast({ achievement, onClose }) {
  if (!achievement) return null;

  const rarityColors = getRarityColor(achievement.rarity);
  const rarityLabel = getRarityLabel(achievement.rarity);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -100, scale: 0.8 }}
        animate={{ 
          opacity: 1, 
          y: 0, 
          scale: 1,
          transition: {
            type: "spring",
            stiffness: 300,
            damping: 20
          }
        }}
        exit={{ 
          opacity: 0, 
          y: -100, 
          scale: 0.8,
          transition: { duration: 0.2 }
        }}
        className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 pointer-events-auto"
      >
        <div className={`
          relative bg-white rounded-2xl shadow-2xl overflow-hidden
          border-4 ${rarityColors.border}
          max-w-md w-full mx-4
        `}>
          {/* Efecto de brillo animado */}
          <motion.div
            className={`absolute inset-0 bg-gradient-to-r ${rarityColors.bg} opacity-10`}
            animate={{
              opacity: [0.1, 0.2, 0.1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />

          {/* Header con badge "LOGRO DESBLOQUEADO" */}
          <div className={`
            relative bg-gradient-to-r ${rarityColors.bg} 
            px-6 py-3 text-white
          `}>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="flex items-center justify-center gap-2"
            >
              <span className="text-2xl">🏆</span>
              <span className="font-bold text-lg tracking-wide">
                ¡LOGRO DESBLOQUEADO!
              </span>
            </motion.div>
          </div>

          {/* Contenido */}
          <div className="relative p-6 bg-white">
            {/* Icono del logro */}
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ 
                scale: 1, 
                rotate: 0,
                transition: {
                  delay: 0.3,
                  type: "spring",
                  stiffness: 200
                }
              }}
              className="flex justify-center mb-4"
            >
              <div className={`
                text-7xl
                drop-shadow-lg
                animate-bounce
              `}>
                {achievement.icon}
              </div>
            </motion.div>

            {/* Nombre del logro */}
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`
                text-2xl font-bold text-center mb-2
                ${rarityColors.text}
              `}
            >
              {achievement.name}
            </motion.h3>

            {/* Descripción */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-gray-600 text-center text-sm mb-4"
            >
              {achievement.description}
            </motion.p>

            {/* Rareza y XP */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center justify-center gap-4 mb-4"
            >
              {/* Rareza */}
              <div className={`
                px-3 py-1 rounded-full text-xs font-semibold
                bg-gradient-to-r ${rarityColors.bg} text-white
                shadow-lg ${rarityColors.glow}
              `}>
                {rarityLabel}
              </div>

              {/* XP ganado */}
              <div className="flex items-center gap-1 px-3 py-1 bg-yellow-100 rounded-full">
                <span className="text-yellow-600 font-bold text-sm">
                  +{achievement.xpReward}
                </span>
                <span className="text-yellow-600 text-xs font-medium">XP</span>
              </div>
            </motion.div>

            {/* Subiste de nivel? */}
            {achievement.leveledUp && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: 1, 
                  scale: 1,
                  transition: { delay: 0.7, type: "spring" }
                }}
                className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-lg p-3 text-center mb-4"
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-2xl">⬆️</span>
                  <div>
                    <div className="font-bold">¡Subiste de nivel!</div>
                    <div className="text-sm opacity-90">
                      Ahora eres nivel {achievement.newLevel}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Botón cerrar */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              onClick={onClose}
              className={`
                w-full py-2 rounded-lg font-semibold text-white
                bg-gradient-to-r ${rarityColors.bg}
                hover:opacity-90 transition-opacity
                shadow-lg
              `}
            >
              ¡Genial! 🎉
            </motion.button>
          </div>

          {/* Partículas decorativas */}
          <motion.div
            className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className={`absolute w-2 h-2 rounded-full bg-gradient-to-r ${rarityColors.bg}`}
                initial={{
                  x: '50%',
                  y: '50%',
                  scale: 0,
                  opacity: 0
                }}
                animate={{
                  x: `${Math.random() * 100}%`,
                  y: `${Math.random() * 100}%`,
                  scale: [0, 1, 0],
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 1.5,
                  delay: 0.5 + (i * 0.1),
                  ease: "easeOut"
                }}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

AchievementToast.propTypes = {
  achievement: PropTypes.shape({
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    rarity: PropTypes.string.isRequired,
    xpReward: PropTypes.number.isRequired,
    leveledUp: PropTypes.bool,
    newLevel: PropTypes.number
  }),
  onClose: PropTypes.func.isRequired
};

export default AchievementToast;
