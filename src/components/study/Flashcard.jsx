import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useLanguage } from '@/context/LanguageContext';

export default function Flashcard({ card, isFlipped, onFlip }) {
  const { t } = useLanguage();

  if (!card) {
    return (
      <div className="w-full max-w-2xl h-96 bg-gray-100 dark:bg-gray-800 rounded-2xl shadow-xl flex items-center justify-center transition-colors duration-300">
        <p className="text-gray-400 dark:text-gray-500 text-lg">No hay tarjeta para mostrar</p>
      </div>
    );
  }

  // ✅ CORRECCIÓN: Función restaurada y mejorada con traducciones
  const getDifficultyLabel = (difficulty) => {
    const key = difficulty?.toLowerCase() || 'basic';
    // Usamos las claves de traducción existentes o un fallback visual
    const labelMap = {
      basic: '⭐ ' + t('common.difficulty.basic'),
      intermediate: '⭐⭐ ' + t('common.difficulty.intermediate'),
      advanced: '⭐⭐⭐ ' + t('common.difficulty.advanced'),
      // Fallbacks para datos viejos
      basico: '⭐ ' + t('common.difficulty.basic'),
      intermedio: '⭐⭐ ' + t('common.difficulty.intermediate'),
      avanzado: '⭐⭐⭐ ' + t('common.difficulty.advanced')
    };
    return labelMap[key] || '⭐ Normal';
  };

  return (
    <div 
      className="w-full max-w-2xl h-96 cursor-pointer"
      onClick={onFlip}
      style={{ perspective: '1000px' }}
    >
      <motion.div
        key={card.id || 'card'} // Key estable para evitar re-renders innecesarios
        className="relative w-full h-full"
        initial={{ rotateY: 0 }}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 80 }}
        style={{ transformStyle: 'preserve-3d', position: 'relative' }}
      >
        {/* === FRENTE === */}
        <div 
          className="absolute w-full h-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center border-4 border-indigo-50 dark:border-indigo-900/30 transition-colors duration-300"
          style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div className="text-8xl mb-8 transform hover:scale-110 transition-transform cursor-pointer filter drop-shadow-sm">
            {card.front_emoji || '💡'}
          </div>
          
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white text-center leading-tight">
            {card.front || '...'}
          </h2>
          
          {/* ✅ TRADUCCIÓN APLICADA: "Tap to flip" */}
          <div className="mt-auto pt-6">
            <p className="text-xs text-indigo-400 dark:text-indigo-300 uppercase tracking-[0.2em] font-bold animate-pulse">
              👆 {t('study.ui.tapToFlip') || 'TAP TO FLIP'}
            </p>
          </div>
        </div>
        
        {/* === REVERSO === */}
        <div 
          className="absolute w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 text-white rounded-2xl shadow-2xl p-8 flex flex-col justify-between overflow-y-auto custom-scrollbar"
          style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
        >
          <div>
            <div className="flex items-center justify-between mb-6">
              <span className="text-xs font-bold px-3 py-1 bg-white/20 backdrop-blur-md rounded-full border border-white/10 shadow-sm">
                {getDifficultyLabel(card.difficulty)}
              </span>
            </div>

            <h3 className="text-2xl font-bold mb-4 leading-snug text-white/95">
              {card.back || '...'}
            </h3>
            
            {card.back_explanation && (
              <div className="bg-black/20 rounded-xl p-4 mb-4 border border-white/5">
                <p className="text-sm leading-relaxed opacity-90 font-medium">
                  {card.back_explanation}
                </p>
              </div>
            )}
          </div>

          {card.back_mnemonic && (
            <div className="mt-auto bg-yellow-400/20 border border-yellow-400/30 rounded-xl p-3 flex gap-3 items-start">
              <span className="text-lg">🧠</span>
              <p className="text-xs font-medium text-yellow-50 italic leading-relaxed">
                {card.back_mnemonic}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

Flashcard.propTypes = {
  card: PropTypes.object,
  isFlipped: PropTypes.bool,
  onFlip: PropTypes.func
};