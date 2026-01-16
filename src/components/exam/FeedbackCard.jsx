import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export function FeedbackCard({ 
  question,
  userAnswer,
  correctAnswer,
  isCorrect,
  explanation,
  onClose
}) {
  const [showExplanation, setShowExplanation] = useState(false);
  const { t } = useLanguage();

  const handleToggleExplanation = () => {
    setShowExplanation(!showExplanation);
  };

  return (
    <AnimatePresence>
      <motion.div
        // 🚀 FÍSICA CARTOON (Pop & Bounce)
        initial={{ 
          opacity: 0, 
          scale: 0.5, // Empieza pequeño para explotar
          y: 100,     // Viene un poco desde abajo
          rotateX: 45 // Un poco de inclinación 3D inicial
        }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0, 
          rotateX: 0 
        }}
        exit={{ 
          opacity: 0, 
          scale: 0.9, 
          transition: { duration: 0.1 } // Salida ultra rápida
        }}
        transition={{ 
          type: "spring",
          damping: 12,    // Poca resistencia = mucho rebote (Jelly effect)
          stiffness: 500, // Mucha fuerza = velocidad explosiva
          mass: 0.8,      // Ligero = se mueve rápido
          restDelta: 0.001
        }}
        className={`
          relative w-full max-w-2xl mx-auto rounded-2xl shadow-2xl overflow-hidden
          flex flex-col max-h-[85vh] 
          ${isCorrect 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-4 border-green-500 dark:border-green-600' 
            : 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-4 border-red-500 dark:border-red-600'
          }
        `}
      >
        {/* Header con Animación del Icono independiente */}
        <div className={`
          p-4 md:p-6 text-white text-center flex-shrink-0
          ${isCorrect 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
            : 'bg-gradient-to-r from-red-500 to-pink-600'
          }
        `}>
          <motion.div 
            initial={{ scale: 0, rotate: -180 }} 
            animate={{ scale: 1, rotate: 0 }} 
            transition={{ type: "spring", stiffness: 200, delay: 0.1 }} // El icono llega un pelín después para dar ritmo
            className="flex justify-center mb-2"
          >
            {isCorrect ? (
              <span className="text-5xl md:text-6xl drop-shadow-md">🎉</span>
            ) : (
              <span className="text-5xl md:text-6xl drop-shadow-md">❌</span>
            )}
          </motion.div>
          
          <h3 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">
            {isCorrect ? t('exam.feedback.correct.title') : t('exam.feedback.incorrect.title')}
          </h3>
          <p className="text-white/90 text-sm md:text-lg">
            {isCorrect ? t('exam.feedback.correct.subtitle') : t('exam.feedback.incorrect.subtitle')}
          </p>
        </div>

        {/* Body Scrollable */}
        <div className="p-4 md:p-6 space-y-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm overflow-y-auto custom-scrollbar">
          {/* Pregunta */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              {t('exam.feedback.labels.question')}
            </h4>
            <p className="text-gray-900 dark:text-white text-base md:text-lg font-medium leading-relaxed">
              {question}
            </p>
          </div>

          {/* Respuesta Incorrecta */}
          {!isCorrect && (
            <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 rounded-r-xl p-4">
              <h4 className="text-xs font-bold text-red-700 dark:text-red-400 mb-1 uppercase">
                {t('exam.feedback.labels.yourAnswer')}
              </h4>
              <p className="text-red-900 dark:text-red-200 font-medium">
                {userAnswer}
              </p>
            </div>
          )}

          {/* Respuesta Correcta */}
          <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 rounded-r-xl p-4">
            <h4 className="text-xs font-bold text-green-700 dark:text-green-400 mb-1 uppercase">
              {isCorrect ? t('exam.feedback.labels.yourCorrectAnswer') : t('exam.feedback.labels.correctAnswer')}
            </h4>
            <p className="text-green-900 dark:text-green-200 font-medium">
              {correctAnswer}
            </p>
          </div>

          {/* Explicación Toggle */}
          {explanation && (
            <div className="mt-4">
              <button
                onClick={handleToggleExplanation}
                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm hover:underline focus:outline-none transition-colors"
              >
                <span>{showExplanation ? '▼' : '▶'}</span>
                <span>{showExplanation ? t('exam.feedback.actions.hideExplanation') : t('exam.feedback.actions.seeExplanation')}</span>
              </button>
              
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 mt-2 text-indigo-900 dark:text-indigo-200 leading-relaxed border border-indigo-100 dark:border-indigo-800/50 text-sm">
                      {explanation}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={onClose}
            autoFocus 
            className={`
              w-full py-3 md:py-4 rounded-xl font-bold text-white text-base md:text-lg shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98]
              ${isCorrect 
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-green-500/30' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:shadow-indigo-500/30'
              }
            `}
          >
            {t('exam.feedback.actions.continue')} →
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

FeedbackCard.propTypes = {
  question: PropTypes.string,
  userAnswer: PropTypes.string,
  correctAnswer: PropTypes.string,
  isCorrect: PropTypes.bool.isRequired,
  explanation: PropTypes.string,
  onClose: PropTypes.func.isRequired,
};

export default FeedbackCard;