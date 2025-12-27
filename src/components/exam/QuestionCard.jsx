import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

// ✅ Función auxiliar para renderizar negritas simples (**texto**)
const parseBoldText = (text) => {
  if (!text) return "";
  // Divide el texto buscando patrones **...**
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      // Retorna un elemento <strong> con estilo destacado
      return <strong key={index} className="text-indigo-600 dark:text-indigo-400 font-extrabold">{part.slice(2, -2)}</strong>;
    }
    return part;
  });
};

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
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-8 flex items-center justify-center min-h-[300px]">
        <p className="text-gray-400">No hay pregunta disponible</p>
      </div>
    );
  }

  const handleOptionClick = (index) => {
    if (selectedAnswer !== undefined) return; 
    onSelectAnswer(index);
  };

  const getOptionStyles = (index) => {
    // ✅ UX: Bordes más finos y estados visuales claros
    const baseStyles = "w-full text-left p-4 rounded-xl border transition-all duration-200 font-medium relative overflow-hidden active:scale-[0.98]";
    
    // Estado normal (sin seleccionar)
    if (selectedAnswer === undefined) {
      return `${baseStyles} bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-gray-700 dark:text-gray-200 shadow-sm`;
    }
    
    // Modo Práctica con Feedback
    if (showFeedback) {
      if (index === question.correct) {
        return `${baseStyles} bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-300 ring-1 ring-green-500`;
      } else if (index === selectedAnswer) {
        return `${baseStyles} bg-red-50 dark:bg-red-900/20 border-red-500 text-red-800 dark:text-red-300 ring-1 ring-red-500`;
      } else {
        return `${baseStyles} bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-400 opacity-50`;
      }
    }
    
    // Modo Examen (Seleccionado pero sin feedback inmediato)
    if (index === selectedAnswer) {
      return `${baseStyles} bg-indigo-50 dark:bg-indigo-900/30 border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-500`;
    }
    
    // No seleccionado (cuando hay otro seleccionado)
    return `${baseStyles} bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 text-gray-400 opacity-60`;
  };

  const getOptionIcon = (index) => {
    if (showFeedback) {
      if (index === question.correct) return '✓';
      if (index === selectedAnswer) return '✗';
    }
    return String.fromCharCode(65 + index);
  };

  const getDifficultyBadge = () => {
    const difficulty = question.difficulty || 'basico';
    const badges = {
      basico: { text: '⭐ Básico', color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' },
      intermedio: { text: '⭐⭐ Intermedio', color: 'bg-yellow-100 dark:bg-yellow-900/40 text-yellow-700 dark:text-yellow-300' },
      avanzado: { text: '⭐⭐⭐ Avanzado', color: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300' }
    };
    const badge = badges[difficulty] || badges.basico;
    return (
      <span className={`text-[10px] sm:text-xs px-2 py-0.5 sm:px-3 sm:py-1 rounded-full ${badge.color} font-medium tracking-wide`}>
        {badge.text}
      </span>
    );
  };

  return (
    <motion.div
      key={currentIndex}
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      // ✅ UX OPTIMIZACIÓN: Diseño plano en móvil para ganar ancho, tarjeta en desktop
      className="w-full bg-transparent sm:bg-white sm:dark:bg-gray-800 sm:rounded-2xl sm:shadow-2xl sm:p-8 sm:border-4 sm:border-indigo-50 sm:dark:border-indigo-900/20"
    >
      {/* Header Pregunta (Badges) - Margen aumentado para aire */}
      <div className="flex items-center justify-between mb-6 sm:mb-8 px-1 sm:px-0">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-1 sm:px-3 rounded-full">
            #{currentIndex + 1}
          </span>
          {getDifficultyBadge()}
        </div>
        
        {question.category && (
          <span className="hidden sm:inline-block text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
            {question.category}
          </span>
        )}
      </div>

      {/* Texto Pregunta - Fuente grande y Negritas parseadas */}
      <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-8 sm:mb-10 leading-snug px-1 sm:px-0">
        {parseBoldText(question.question)}
      </h2>

      {/* Opciones */}
      <div className="space-y-3">
        {question.options.map((option, index) => (
          <button
            key={index}
            onClick={() => handleOptionClick(index)}
            disabled={selectedAnswer !== undefined}
            className={getOptionStyles(index)}
          >
            <div className="flex items-start gap-3">
              {/* Icono/Letra */}
              <span className={`
                flex-shrink-0 w-7 h-7 mt-0.5 rounded-full flex items-center justify-center font-bold text-xs transition-colors
                ${showFeedback && index === question.correct 
                  ? 'bg-green-500 text-white' 
                  : showFeedback && index === selectedAnswer 
                  ? 'bg-red-500 text-white'
                  : index === selectedAnswer
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}
              `}>
                {getOptionIcon(index)}
              </span>
              
              {/* Texto Opción */}
              <span className="text-sm sm:text-base leading-relaxed">
                {parseBoldText(option)} {/* También parseamos negritas en opciones si las hay */}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Feedback Inline (Práctica) */}
      {showFeedback && mode === 'practice' && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-6 overflow-hidden"
        >
          <div className={`p-4 rounded-xl border-l-4 ${selectedAnswer === question.correct ? 'bg-green-50 dark:bg-green-900/10 border-green-500' : 'bg-red-50 dark:bg-red-900/10 border-red-500'}`}>
            <h3 className={`font-bold mb-1 ${selectedAnswer === question.correct ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'}`}>
              {selectedAnswer === question.correct ? '¡Correcto!' : 'Incorrecto'}
            </h3>
            {!selectedAnswer === question.correct && (
               <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                 Respuesta correcta: <strong>{question.options[question.correct]}</strong>
               </p>
            )}
            {question.explanation && (
              <p className="text-sm text-gray-600 dark:text-gray-400 italic border-t border-gray-200 dark:border-gray-700 pt-2 mt-2">
                {parseBoldText(question.explanation)}
              </p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

QuestionCard.propTypes = {
  question: PropTypes.object,
  currentIndex: PropTypes.number,
  totalQuestions: PropTypes.number,
  onSelectAnswer: PropTypes.func,
  selectedAnswer: PropTypes.number,
  showFeedback: PropTypes.bool,
  mode: PropTypes.string
};