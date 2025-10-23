import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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

  // Auto-show confetti on correct answer
  useEffect(() => {
    if (isCorrect && showConfetti) {
      showConfetti();
    }
  }, [isCorrect, showConfetti]);

  const handleFlashcardClick = () => {
    if (relatedFlashcard) {
      navigate(`/study/${relatedFlashcard.subjectId}`);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ 
          type: "spring",
          stiffness: 300,
          damping: 25
        }}
        className={`
          relative w-full max-w-2xl mx-auto rounded-2xl shadow-2xl overflow-hidden
          ${isCorrect 
            ? 'bg-gradient-to-br from-green-50 to-emerald-50 border-4 border-green-400' 
            : 'bg-gradient-to-br from-red-50 to-pink-50 border-4 border-red-400'
          }
        `}
      >
        {/* Header con resultado */}
        <div className={`
          p-6 text-white text-center
          ${isCorrect 
            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
            : 'bg-gradient-to-r from-red-500 to-pink-500'
          }
        `}>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ 
              delay: 0.2,
              type: "spring",
              stiffness: 200
            }}
            className="text-6xl mb-2"
          >
            {isCorrect ? '✓' : '✗'}
          </motion.div>
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-2xl font-bold"
          >
            {isCorrect ? '¡Correcto!' : 'Incorrecto'}
          </motion.h3>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm opacity-90 mt-1"
          >
            {isCorrect 
              ? '¡Excelente trabajo! 🎉' 
              : 'No te preocupes, sigue practicando 💪'
            }
          </motion.p>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Pregunta */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-lg p-4 shadow-md"
          >
            <h4 className="text-sm font-semibold text-gray-500 mb-2">Pregunta:</h4>
            <p className="text-gray-800">{question}</p>
          </motion.div>

          {/* Tu respuesta (si incorrecta) */}
          {!isCorrect && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-red-100 border-2 border-red-300 rounded-lg p-4"
            >
              <h4 className="text-sm font-semibold text-red-700 mb-2">Tu respuesta:</h4>
              <p className="text-red-900">{userAnswer}</p>
            </motion.div>
          )}

          {/* Respuesta correcta */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: isCorrect ? 0.6 : 0.7 }}
            className="bg-green-100 border-2 border-green-300 rounded-lg p-4"
          >
            <h4 className="text-sm font-semibold text-green-700 mb-2">
              {isCorrect ? 'Tu respuesta:' : 'Respuesta correcta:'}
            </h4>
            <p className="text-green-900 font-medium">{correctAnswer}</p>
          </motion.div>

          {/* Explicación (expandible) */}
          {explanation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="w-full bg-indigo-100 hover:bg-indigo-200 rounded-lg p-4 text-left transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-indigo-700 font-semibold flex items-center gap-2">
                    💡 Explicación
                  </span>
                  <motion.span
                    animate={{ rotate: showExplanation ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="text-indigo-500"
                  >
                    ▼
                  </motion.span>
                </div>
              </button>
              
              <AnimatePresence>
                {showExplanation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-indigo-50 rounded-b-lg p-4 mt-2 border-2 border-indigo-200">
                      <p className="text-gray-700 leading-relaxed">{explanation}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Link a flashcard relacionada */}
          {relatedFlashcard && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
            >
              <button
                onClick={handleFlashcardClick}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg p-4 flex items-center justify-between transition-all transform hover:scale-105 shadow-lg"
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-2xl">{relatedFlashcard.emoji}</span>
                    <span className="font-semibold">Estudiar este tema</span>
                  </div>
                  <p className="text-sm opacity-90">{relatedFlashcard.title}</p>
                </div>
                <span className="text-2xl">→</span>
              </button>
            </motion.div>
          )}
        </div>

        {/* Botón de cerrar */}
        <div className="p-6 pt-0">
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            onClick={onClose}
            className={`
              w-full py-3 rounded-lg font-semibold text-white transition-all transform hover:scale-105 shadow-lg
              ${isCorrect 
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600' 
                : 'bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600'
              }
            `}
          >
            Continuar →
          </motion.button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

FeedbackCard.propTypes = {
  question: PropTypes.string.isRequired,
  userAnswer: PropTypes.string.isRequired,
  correctAnswer: PropTypes.string.isRequired,
  isCorrect: PropTypes.bool.isRequired,
  explanation: PropTypes.string,
  relatedFlashcard: PropTypes.shape({
    subjectId: PropTypes.string.isRequired,
    emoji: PropTypes.string,
    title: PropTypes.string.isRequired
  }),
  onClose: PropTypes.func.isRequired,
  showConfetti: PropTypes.func
};

export default FeedbackCard;
