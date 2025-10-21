import { memo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

// ✅ Componente memoizado para evitar re-renders innecesarios
export const QuestionCard = memo(function QuestionCard({ 
  question, 
  questionNumber,
  totalQuestions,
  onSelectAnswer,
  selectedAnswer,
  showFeedback = false,
  mode = 'exam'
}) {
  if (!question) return null;

  const isAnswered = selectedAnswer !== undefined;
  const isCorrect = isAnswered && selectedAnswer === question.correct;

  return (
    <motion.div 
      className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-gray-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header COMPACTO */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-100">
        <motion.span 
          className="text-xs font-bold text-gray-600 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1.5 rounded-full"
          whileHover={{ scale: 1.05 }}
        >
          🔍 Pregunta {questionNumber} de {totalQuestions}
        </motion.span>
        <div className="flex gap-2">
          {question.category && (
            <motion.span 
              className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-xs font-semibold shadow-md"
              whileHover={{ scale: 1.05, rotate: 2 }}
            >
              {question.category}
            </motion.span>
          )}
          {question.difficulty && (
            <motion.span 
              className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-md ${
                question.difficulty === 'basico' 
                  ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white' :
                question.difficulty === 'intermedio' 
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
                  'bg-gradient-to-r from-red-400 to-pink-400 text-white'
              }`}
              whileHover={{ scale: 1.05, rotate: -2 }}
            >
              {question.difficulty === 'basico' ? '⭐ Básico' :
               question.difficulty === 'intermedio' ? '⭐⭐ Intermedio' :
               '⭐⭐⭐ Avanzado'}
            </motion.span>
          )}
        </div>
      </div>

      {/* Question COMPACTA con scroll si es necesario */}
      <motion.div
        className="mb-6 max-h-[180px] overflow-y-auto pr-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h2 className="text-xl font-bold text-gray-800 leading-relaxed">
          {question.question}
        </h2>
      </motion.div>

      {/* Options COMPACTAS */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectOption = index === question.correct;
          const showCorrect = showFeedback && isCorrectOption;
          const showIncorrect = showFeedback && isSelected && !isCorrect;

          let optionStyles = 'border-2 border-gray-300 hover:border-indigo-400 hover:bg-indigo-50 bg-white';
          let iconBg = 'border-gray-300 bg-white';
          
          if (isSelected && !showFeedback) {
            optionStyles = 'border-indigo-500 bg-gradient-to-r from-blue-50 to-indigo-50 ring-4 ring-indigo-200';
            iconBg = 'border-indigo-500 bg-gradient-to-br from-blue-500 to-indigo-500';
          }
          
          if (showCorrect) {
            optionStyles = 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 ring-4 ring-green-200 shadow-lg';
            iconBg = 'border-green-500 bg-gradient-to-br from-green-500 to-emerald-500';
          }
          
          if (showIncorrect) {
            optionStyles = 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50 ring-4 ring-red-200 shadow-lg';
            iconBg = 'border-red-500 bg-gradient-to-br from-red-500 to-pink-500';
          }

          return (
            <motion.button
              key={index}
              onClick={() => !showFeedback && onSelectAnswer(index)}
              disabled={showFeedback}
              className={`w-full p-4 rounded-xl text-left transition-all duration-300 ${optionStyles} ${
                showFeedback ? 'cursor-default' : 'cursor-pointer transform hover:scale-[1.01]'
              }`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + (index * 0.05) }}
              whileHover={!showFeedback ? { scale: 1.01 } : {}}
              whileTap={!showFeedback ? { scale: 0.98 } : {}}
            >
              <div className="flex items-center gap-3">
                {/* Radio button o check/cross */}
                <motion.div 
                  className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-sm ${iconBg}`}
                  animate={showCorrect ? { scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] } : {}}
                  transition={{ duration: 0.5 }}
                >
                  {showCorrect && (
                    <motion.svg 
                      className="w-4 h-4 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </motion.svg>
                  )}
                  {showIncorrect && (
                    <motion.svg 
                      className="w-4 h-4 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </motion.svg>
                  )}
                  {isSelected && !showFeedback && (
                    <motion.div 
                      className="w-2.5 h-2.5 bg-white rounded-full"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring" }}
                    />
                  )}
                </motion.div>

                {/* Option text */}
                <span className={`flex-1 text-base ${
                  showCorrect ? 'text-green-900 font-bold' :
                  showIncorrect ? 'text-red-900 font-bold' :
                  isSelected ? 'text-indigo-900 font-semibold' :
                  'text-gray-700 font-medium'
                }`}>
                  {option}
                </span>

                {/* Iconos de feedback */}
                {showCorrect && (
                  <motion.span 
                    className="text-2xl"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    ✅
                  </motion.span>
                )}
                {showIncorrect && (
                  <motion.span 
                    className="text-2xl"
                    initial={{ scale: 0, rotate: 180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    ❌
                  </motion.span>
                )}
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Explanation COMPACTA */}
      {showFeedback && question.explanation && (
        <motion.div 
          className={`mt-6 p-5 rounded-xl border-l-4 shadow-lg ${
            isCorrect 
              ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500' 
              : 'bg-gradient-to-r from-orange-50 to-yellow-50 border-orange-500'
          }`}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <div className="flex items-start gap-3">
            <motion.div 
              className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center shadow-md ${
                isCorrect 
                  ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-br from-orange-500 to-yellow-500'
              }`}
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              {isCorrect ? (
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-white text-lg font-bold">💡</span>
              )}
            </motion.div>
            <div className="flex-1">
              <p className={`font-bold text-base mb-2 ${
                isCorrect ? 'text-green-900' : 'text-orange-900'
              }`}>
                {isCorrect ? '🎉 ¡Excelente! Respuesta correcta' : '📚 Respuesta incorrecta'}
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // ✅ Custom comparison para optimizar re-renders
  return (
    prevProps.question?.id === nextProps.question?.id &&
    prevProps.selectedAnswer === nextProps.selectedAnswer &&
    prevProps.showFeedback === nextProps.showFeedback &&
    prevProps.questionNumber === nextProps.questionNumber
  );
});

QuestionCard.propTypes = {
  question: PropTypes.shape({
    id: PropTypes.string.isRequired,
    question: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    correct: PropTypes.number.isRequired,
    explanation: PropTypes.string,
    category: PropTypes.string,
    difficulty: PropTypes.string
  }).isRequired,
  questionNumber: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  onSelectAnswer: PropTypes.func.isRequired,
  selectedAnswer: PropTypes.number,
  showFeedback: PropTypes.bool,
  mode: PropTypes.string
};

QuestionCard.displayName = 'QuestionCard';