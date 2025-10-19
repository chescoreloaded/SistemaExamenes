import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export default function Flashcard({ card, isFlipped, onFlip }) {
  if (!card) {
    return (
      <div className="w-full max-w-2xl h-96 bg-gray-100 rounded-2xl shadow-xl flex items-center justify-center">
        <p className="text-gray-400 text-lg">No hay tarjeta para mostrar</p>
      </div>
    );
  }

  return (
    <motion.div
      key={card.id} // Solo cambia cuando la tarjeta es diferente
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-2xl"
    >
      <div 
        className="w-full h-96 cursor-pointer perspective-1000 group"
        onClick={onFlip}
        style={{ perspective: '1000px' }}
      >
        <motion.div
          className="relative w-full h-full hover:scale-[1.02] transition-transform duration-200"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          transition={{ 
            duration: 0.25,
            ease: [0.4, 0, 0.2, 1]
          }}
          style={{ 
            transformStyle: 'preserve-3d',
            position: 'relative'
          }}
        >
        {/* FRONT - Pregunta con mejor feedback visual */}
        <div 
          className="absolute w-full h-full bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center border-4 border-indigo-100 group-hover:border-indigo-300 group-hover:shadow-3xl transition-all duration-300"
          style={{ 
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          <div className="text-7xl mb-6 animate-bounce">
            {card.front.emoji}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">
            {card.front.text}
          </h2>
          
          {/* Hint más visible y animado */}
          <div className="mt-8 flex flex-col items-center gap-3 animate-pulse">
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-lg">
              <span className="text-3xl">💡</span>
              <span>Click para ver la respuesta</span>
            </div>
            <div className="text-sm text-gray-400">
              o presiona <kbd className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">Espacio</kbd>
            </div>
          </div>
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
              {card.back.answer}
            </h3>
            
            <div className="bg-white/10 rounded-lg p-4 mb-4">
              <p className="text-sm leading-relaxed opacity-95">
                {card.back.explanation}
              </p>
            </div>
          </div>

          {card.back.mnemonic && (
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
    </motion.div>
  );
}

Flashcard.propTypes = {
  card: PropTypes.shape({
    front: PropTypes.shape({
      text: PropTypes.string.isRequired,
      emoji: PropTypes.string.isRequired
    }).isRequired,
    back: PropTypes.shape({
      answer: PropTypes.string.isRequired,
      explanation: PropTypes.string.isRequired,
      mnemonic: PropTypes.string
    }).isRequired,
    difficulty: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string)
  }),
  isFlipped: PropTypes.bool.isRequired,
  onFlip: PropTypes.func.isRequired
};