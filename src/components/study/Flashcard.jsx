import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export default function Flashcard({ card, isFlipped, onFlip }) {
  if (!card) {
    return (
      <div className="w-full max-w-2xl h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center transition-colors duration-300">
        <p className="text-gray-400 dark:text-gray-500 text-lg">No hay tarjeta para mostrar</p>
      </div>
    );
  }

  return (
    <div 
      className="w-full max-w-2xl h-96 cursor-pointer"
      onClick={onFlip}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        // ✅ Key único fuerza remount cuando cambia la tarjeta
        key={card.front?.text || card.id}
        className="relative w-full h-full"
        // ✅ SIEMPRE inicia en 0 (mostrando frente)
        initial={{ rotateY: 0 }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ 
          duration: 0.6,
          type: "spring",
          stiffness: 80
        }}
        style={{ 
          transformStyle: 'preserve-3d',
          position: 'relative'
        }}
      >
        {/* FRONT - Pregunta */}
        <div 
          className="absolute w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center border-4 border-indigo-100 dark:border-indigo-900/50 transition-colors duration-300"
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          <div className="text-7xl mb-6 animate-bounce">
            {card.front?.emoji || '📚'}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center">
            {card.front?.text || 'Sin texto'}
          </h2>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-8">
            💡 Click para ver la respuesta
          </p>
        </div>
        
        {/* BACK - Respuesta */}
        <div 
          className="absolute w-full h-full bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 text-white rounded-2xl shadow-2xl p-8 flex flex-col justify-between overflow-y-auto"
          style={{ 
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm px-3 py-1 bg-white/20 rounded-full">
                {card.difficulty === 'basico' ? '⭐ Básico' : 
                 card.difficulty === 'intermedio' ? '⭐⭐ Intermedio' : 
                 '⭐⭐⭐ Avanzado'}
              </span>
              <span className="text-xs opacity-75">
                {card.tags?.slice(0, 2).join(', ')}
              </span>
            </div>

            <h3 className="text-2xl font-bold mb-4 leading-tight">
              {card.back?.answer || 'Sin respuesta'}
            </h3>
            
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <p className="text-sm leading-relaxed opacity-95">
                {card.back?.explanation || 'Sin explicación'}
              </p>
            </div>
          </div>

          {card.back?.mnemonic && (
            <div className="bg-yellow-400/20 rounded-lg p-4 mt-auto">
              <p className="text-sm italic flex items-start">
                <span className="text-xl mr-2">💡</span>
                <span className="flex-1">{card.back.mnemonic}</span>
              </p>
            </div>
          )}

          <p className="text-xs text-center mt-4 opacity-60">
            Click para regresar a la pregunta
          </p>
        </div>
      </motion.div>
    </div>
  );
}

Flashcard.propTypes = {
  card: PropTypes.shape({
    id: PropTypes.string,
    front: PropTypes.shape({
      text: PropTypes.string.isRequired,
      emoji: PropTypes.string.isRequired
    }),
    back: PropTypes.shape({
      answer: PropTypes.string.isRequired,
      explanation: PropTypes.string.isRequired,
      mnemonic: PropTypes.string
    }),
    difficulty: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string)
  }),
  isFlipped: PropTypes.bool.isRequired,
  onFlip: PropTypes.func.isRequired
};