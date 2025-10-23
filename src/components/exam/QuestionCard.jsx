import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { shakeAnimation, bounceAnimation } from '@/utils/animations';

export function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  onSelectAnswer,
  selectedAnswer,
  showFeedback = false,
  mode = 'exam'
}) {
  const [animationKey, setAnimationKey] = useState(0);
  const [feedbackAnimation, setFeedbackAnimation] = useState(null);

  // Trigger animation when feedback is shown
  useEffect(() => {
    if (showFeedback && selectedAnswer !== undefined) {
      const isCorrect = selectedAnswer === question.correct;
      setFeedbackAnimation(isCorrect ? 'bounce' : 'shake');
      setAnimationKey(prev => prev + 1);
    } else {
      setFeedbackAnimation(null);
    }
  }, [showFeedback, selectedAnswer, question.correct]);

  const isAnswerCorrect = (optionIndex) => {
    return optionIndex === question.correct;
  };

  const isAnswerSelected = (optionIndex) => {
    return selectedAnswer === optionIndex;
  };

  const getOptionStyles = (optionIndex) => {
    const base = "w-full text-left p-4 rounded-lg border-2 transition-all duration-200 font-medium";
    
    if (!showFeedback) {
      // Antes de mostrar feedback
      if (isAnswerSelected(optionIndex)) {
        return `${base} bg-indigo-100 border-indigo-400 text-indigo-900`;
      }
      return `${base} bg-white border-gray-300 hover:border-indigo-300 hover:bg-indigo-50 text-gray-800`;
    }

    // Después de mostrar feedback
    if (isAnswerCorrect(optionIndex)) {
      return `${base} bg-green-100 border-green-400 text-green-900`;
    }
    
    if (isAnswerSelected(optionIndex) && !isAnswerCorrect(optionIndex)) {
      return `${base} bg-red-100 border-red-400 text-red-900`;
    }

    return `${base} bg-gray-100 border-gray-300 text-gray-600 opacity-50`;
  };

  const getOptionIcon = (optionIndex) => {
    if (!showFeedback) return null;

    if (isAnswerCorrect(optionIndex)) {
      return <span className="text-green-600 text-xl ml-2">✓</span>;
    }
    
    if (isAnswerSelected(optionIndex) && !isAnswerCorrect(optionIndex)) {
      return <span className="text-red-600 text-xl ml-2">✗</span>;
    }

    return null;
  };

  return (
    <motion.div
      key={animationKey}
      variants={feedbackAnimation === 'shake' ? shakeAnimation : feedbackAnimation === 'bounce' ? bounceAnimation : {}}
      animate={feedbackAnimation}
      className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 border-2 border-gray-200"
    >
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-semibold text-indigo-600 bg-indigo-100 px-3 py-1 rounded-full">
            Pregunta {currentIndex + 1} de {totalQuestions}
          </span>
          {question.difficulty && (
            <span className="text-xs px-2 py-1 bg-gray-100 rounded-full text-gray-600">
              {question.difficulty === 'basico' ? '⭐ Básico' : 
               question.difficulty === 'intermedio' ? '⭐⭐ Intermedio' : 
               '⭐⭐⭐ Avanzado'}
            </span>
          )}
        </div>

        {question.tags && question.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {question.tags.map((tag, index) => (
              <span
                key={index}
                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <h2 className="text-xl font-bold text-gray-800 leading-relaxed">
          {question.question}
        </h2>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => !showFeedback && onSelectAnswer(index)}
            disabled={showFeedback}
            className={getOptionStyles(index)}
            whileHover={!showFeedback ? { scale: 1.02 } : {}}
            whileTap={!showFeedback ? { scale: 0.98 } : {}}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className={`
                  flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm
                  ${!showFeedback && isAnswerSelected(index) 
                    ? 'bg-indigo-500 text-white' 
                    : showFeedback && isAnswerCorrect(index)
                    ? 'bg-green-500 text-white'
                    : showFeedback && isAnswerSelected(index) && !isAnswerCorrect(index)
                    ? 'bg-red-500 text-white'
                    : 'bg-gray-200 text-gray-600'
                  }
                `}>
                  {String.fromCharCode(65 + index)}
                </span>
                <span>{option}</span>
              </div>
              {getOptionIcon(index)}
            </div>
          </motion.button>
        ))}
      </div>

      {/* Feedback en modo práctica */}
      {showFeedback && mode === 'practice' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className={`
            mt-6 p-4 rounded-lg border-2
            ${selectedAnswer === question.correct
              ? 'bg-green-50 border-green-300'
              : 'bg-red-50 border-red-300'
            }
          `}
        >
          <p className={`
            font-semibold mb-2
            ${selectedAnswer === question.correct ? 'text-green-800' : 'text-red-800'}
          `}>
            {selectedAnswer === question.correct 
              ? '¡Correcto! 🎉' 
              : 'Incorrecto 😔'
            }
          </p>
          {question.explanation && (
            <p className="text-gray-700 text-sm">
              {question.explanation}
            </p>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

QuestionCard.propTypes = {
  question: PropTypes.shape({
    question: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    correct: PropTypes.number.isRequired,
    explanation: PropTypes.string,
    difficulty: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string)
  }).isRequired,
  currentIndex: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  onSelectAnswer: PropTypes.func.isRequired,
  selectedAnswer: PropTypes.number,
  showFeedback: PropTypes.bool,
  mode: PropTypes.oneOf(['exam', 'practice'])
};

export default QuestionCard;
