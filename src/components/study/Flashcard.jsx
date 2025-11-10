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

  // Función auxiliar para formatear dificultad (podemos moverla a un utility si se usa mucho)
  const getDifficultyLabel = (difficulty) => {
    switch(difficulty) {
      case 'basic': return '⭐ Básico'; // Ajustado a los valores ENUM de DB si son en inglés
      case 'intermediate': return '⭐⭐ Intermedio';
      case 'advanced': return '⭐⭐⭐ Avanzado';
      case 'basico': return '⭐ Básico'; // Mantener compatibilidad por si acaso
      case 'intermedio': return '⭐⭐ Intermedio';
      case 'avanzado': return '⭐⭐⭐ Avanzado';
      default: return '⭐ Normal';
    }
  };

  return (
    <div 
      className="w-full max-w-2xl h-96 cursor-pointer"
      onClick={onFlip}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        // ✅ Key único usando la nueva propiedad plana
        key={card.front || card.id}
        className="relative w-full h-full"
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
            {/* ✅ CORREGIDO: Usar propiedad plana */}
            {card.front_emoji || '📚'}
          </div>
          <h2 className="text-3xl font-bold text-gray-800 dark:text-white text-center">
            {/* ✅ CORREGIDO: Usar propiedad plana */}
            {card.front || 'Sin texto'}
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
                {getDifficultyLabel(card.difficulty)}
              </span>
              {/* Si ya no usas tags, puedes quitar esto o adaptarlo si vienen de categories
              {card.category_id && (
                 <span className="text-xs opacity-75 bg-black/20 px-2 py-1 rounded">
                   {card.category_id}
                 </span>
              )} */}
            </div>

            <h3 className="text-2xl font-bold mb-4 leading-tight">
              {/* ✅ CORREGIDO: Usar propiedad plana */}
              {card.back || 'Sin respuesta'}
            </h3>
            
            {/* ✅ CORREGIDO: Usar propiedad plana */}
            {card.back_explanation && (
              <div className="bg-white/10 rounded-lg p-4 mb-4">
                <p className="text-sm leading-relaxed opacity-95">
                  {card.back_explanation}
                </p>
              </div>
            )}
          </div>

          {/* ✅ CORREGIDO: Usar propiedad plana */}
          {card.back_mnemonic && (
            <div className="bg-yellow-400/20 rounded-lg p-4 mt-auto">
              <p className="text-sm italic flex items-start">
                <span className="text-xl mr-2">💡</span>
                <span className="flex-1">{card.back_mnemonic}</span>
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
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    // ✅ Nuevas props planas
    front: PropTypes.string,
    front_emoji: PropTypes.string,
    back: PropTypes.string,
    back_explanation: PropTypes.string,
    back_mnemonic: PropTypes.string,
    difficulty: PropTypes.string,
    category_id: PropTypes.string
  }),
  isFlipped: PropTypes.bool.isRequired,
  onFlip: PropTypes.func.isRequired
};