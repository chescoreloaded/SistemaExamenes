import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  onSelectAnswer,
  selectedAnswer,
  showFeedback,
  mode
}) {
  if (!question) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border-4 border-gray-200 dark:border-gray-700 flex items-center justify-center min-h-[400px] transition-colors duration-300">
        <p className="text-gray-400 dark:text-gray-500 text-lg">No hay pregunta disponible</p>
      </div>
    );
  }

  // ✅ FIX: Handler que previene clicks cuando ya hay respuesta
  // Comprueba 'undefined' en lugar de 'null'
  const handleOptionClick = (index) => {
    if (selectedAnswer !== undefined) return; // ← FIX: Previene ejecución
    onSelectAnswer(index); // ← Llama correctamente solo con el índice
  };

  const getOptionStyles = (index) => {
    const baseStyles = "w-full text-left p-4 rounded-xl border-2 transition-all duration-200 font-medium";
    
    // ✅ FIX: Comprueba 'undefined' en lugar de 'null'
    if (selectedAnswer === undefined) {
      return `${baseStyles} bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:border-indigo-400 dark:hover:border-indigo-500 text-gray-700 dark:text-gray-200`;
    }
    
    // Si se muestra feedback (modo práctica)
    if (showFeedback) {
      if (index === question.correct) {
        // Respuesta correcta
        return `${baseStyles} bg-green-100 dark:bg-green-900/30 border-green-500 dark:border-green-600 text-green-800 dark:text-green-300`;
      } else if (index === selectedAnswer) {
        // Respuesta incorrecta seleccionada
        return `${baseStyles} bg-red-100 dark:bg-red-900/30 border-red-500 dark:border-red-600 text-red-800 dark:text-red-300`;
      } else {
        // Otras opciones
        return `${baseStyles} bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 opacity-50`;
      }
    }
    
    // Opción seleccionada (sin feedback aún)
    if (index === selectedAnswer) {
      return `${baseStyles} bg-indigo-100 dark:bg-indigo-900/40 border-indigo-500 dark:border-indigo-400 text-indigo-800 dark:text-indigo-300`;
    }
    
    // Otras opciones cuando ya hay una seleccionada
    return `${baseStyles} bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 opacity-60`;
  };

  const getOptionIcon = (index) => {
    if (showFeedback) {
      if (index === question.correct) {
        return '✓';
      } else if (index === selectedAnswer) {
        return '✗';
      }
    }
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  const getDifficultyBadge = () => {
    const difficulty = question.difficulty || 'basico';
    const badges = {
      basico: { text: '⭐ Básico', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300' },
      intermedio: { text: '⭐⭐ Intermedio', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300' },
      avanzado: { text: '⭐⭐⭐ Avanzado', color: 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' }
    };
    
    const badge = badges[difficulty] || badges.basico;
    return (
      <span className={`text-xs px-3 py-1 rounded-full ${badge.color} font-medium transition-colors duration-300`}>
        {badge.text}
      </span>
    );
  };

  return (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border-4 border-indigo-100 dark:border-indigo-900/50 transition-colors duration-300"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-3 py-1 rounded-full">
            Pregunta {currentIndex + 1} de {totalQuestions}
          </span>
          {getDifficultyBadge()}
        </div>
        
        {question.category && (
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            {question.category}
          </span>
        )}
      </div>

      {/* Question */}
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-8 leading-tight">
        {question.question}
      </h2>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleOptionClick(index)}
            className={getOptionStyles(index)}
            // ✅ FIX: Comprueba 'undefined' en lugar de 'null'
            style={{ cursor: selectedAnswer === undefined ? 'pointer' : 'not-allowed' }}
            whileHover={selectedAnswer === undefined ? { scale: 1.02 } : {}}
            whileTap={selectedAnswer === undefined ? { scale: 0.98 } : {}}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center gap-3">
              {/* Icon/Letter */}
              <span className={`
                flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                ${showFeedback && index === question.correct 
                  ? 'bg-green-500 dark:bg-green-600 text-white' 
                  : showFeedback && index === selectedAnswer 
                  ? 'bg-red-500 dark:bg-red-600 text-white'
                  : index === selectedAnswer
                  ? 'bg-indigo-500 dark:bg-indigo-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300'}
              `}>
                {getOptionIcon(index)}
              </span>
              
              {/* Option text */}
              <span className="flex-1 text-left">
                {option}
              </span>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Feedback in practice mode */}
      {showFeedback && mode === 'practice' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 transition-colors duration-300"
        >
          {selectedAnswer === question.correct ? (
            <div className="flex items-start gap-3">
              <span className="text-2xl">🎉</span>
              <div>
                <h3 className="font-bold text-green-700 dark:text-green-400 mb-2">
                  ¡Correcto!
                </h3>
                {question.explanation && (
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {question.explanation}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <h3 className="font-bold text-red-700 dark:text-red-400 mb-2">
                  Incorrecto
                </h3>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                  La respuesta correcta es: <strong className="text-green-700 dark:text-green-400">{question.options[question.correct]}</strong>
                </p>
                {question.explanation && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {question.explanation}
                  </p>
                )}
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Tags */}
      {question.tags && question.tags.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {question.tags.map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded transition-colors duration-300"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Hint for keyboard shortcuts */}
      {/* ✅ FIX: Comprueba 'undefined' en lugar de 'null' */}
      {selectedAnswer === undefined && (
        <div className="mt-6 text-center text-xs text-gray-400 dark:text-gray-500">
          💡 Tip: Usa las teclas 1-4 para seleccionar rápidamente
        </div>
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
    category: PropTypes.string,
    tags: PropTypes.arrayOf(PropTypes.string)
  }),
  currentIndex: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  onSelectAnswer: PropTypes.func.isRequired,
  selectedAnswer: PropTypes.number,
  showFeedback: PropTypes.bool,
  mode: PropTypes.string
};