// src/components/exam/FeedbackCard.jsx
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSoundContext } from '@/context/SoundContext';
import { useLanguage } from '@/context/LanguageContext';

export function FeedbackCard({ 
  question,
  userAnswer,
  correctAnswer,
  isCorrect,
  explanation,
  relatedFlashcard,
  onClose,
  showConfetti
}) {
  const navigate = useNavigate();
  const [showExplanation, setShowExplanation] = useState(false);
  const { playCorrect, playIncorrect, playClick } = useSoundContext();
  const { t } = useLanguage();

  useEffect(() => {
    if (isCorrect) {
      playCorrect();
      if (showConfetti) showConfetti();
    } else {
      playIncorrect();
    }
  }, [isCorrect, showConfetti, playCorrect, playIncorrect]);

  const handleToggleExplanation = () => {
    playClick();
    setShowExplanation(!showExplanation);
  };

  const handleClose = () => {
    playClick();
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className={`
          relative w-full max-w-2xl mx-auto rounded-2xl shadow-2xl overflow-hidden
          flex flex-col
          ${isCorrect 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-4 border-green-500 dark:border-green-600' 
            : 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-4 border-red-500 dark:border-red-600'
          }
        `}
      >
        {/* ✅ 1. Header Fijo */}
        <div className={`
          p-4 md:p-6 text-white text-center flex-shrink-0
          ${isCorrect 
            ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
            : 'bg-gradient-to-r from-red-500 to-pink-600'
          }
        `}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex justify-center mb-2"
          >
            {isCorrect ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 md:h-20 md:w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 md:h-20 md:w-20 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
          </motion.div>
          <h3 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">
            {isCorrect ? t('exam.feedback.correct.title') : t('exam.feedback.incorrect.title')}
          </h3>
          <p className="text-white/90 text-sm md:text-lg">
            {isCorrect ? t('exam.feedback.correct.subtitle') : t('exam.feedback.incorrect.subtitle')}
          </p>
        </div>

        {/* ✅ 2. Contenido Scrollable */}
        <div className="p-4 md:p-6 space-y-4 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm overflow-y-auto max-h-[50vh] md:max-h-[60vh]">
          {/* Pregunta */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700">
            <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              {t('exam.feedback.labels.question')}
            </h4>
            <p className="text-gray-900 dark:text-white text-base md:text-lg font-medium leading-relaxed">
              {question || 'Texto de la pregunta no disponible'}
            </p>
          </div>

          {/* Tu respuesta (si incorrecta) */}
          {!isCorrect && (
            <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 rounded-r-xl p-4">
              <h4 className="text-sm font-bold text-red-700 dark:text-red-400 mb-1">
                {t('exam.feedback.labels.yourAnswer')}
              </h4>
              <p className="text-red-900 dark:text-red-200 font-medium">
                {userAnswer}
              </p>
            </div>
          )}

          {/* Respuesta correcta */}
          <div className="bg-green-100 dark:bg-green-900/30 border-l-4 border-green-500 rounded-r-xl p-4">
            <h4 className="text-sm font-bold text-green-700 dark:text-green-400 mb-1">
              {isCorrect ? t('exam.feedback.labels.yourCorrectAnswer') : t('exam.feedback.labels.correctAnswer')}
            </h4>
            <p className="text-green-900 dark:text-green-200 font-medium">
              {correctAnswer}
            </p>
          </div>

          {/* Explicación */}
          {explanation && (
            <div className="mt-4">
              <button
                onClick={handleToggleExplanation}
                className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:underline focus:outline-none"
              >
                {showExplanation ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3.586L7.707 9.293a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 10.586V7z" clipRule="evenodd" />
                  </svg>
                )}
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
                    <div className="bg-indigo-50 dark:bg-indigo-900/30 rounded-xl p-4 mt-2 text-indigo-900 dark:text-indigo-200 leading-relaxed border border-indigo-100 dark:border-indigo-800/50">
                      {explanation}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* ✅ 3. Footer Fijo */}
        <div className="p-4 md:p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700 flex-shrink-0 sticky bottom-0">
          <button
            onClick={handleClose}
            autoFocus // ✅ Añadimos autoFocus aquí para que el teclado/gamepad pueda usarlo
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
  relatedFlashcard: PropTypes.object,
  onClose: PropTypes.func.isRequired,
  showConfetti: PropTypes.func
};

export default FeedbackCard;