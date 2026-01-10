import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export default function QuestionCard({ 
  question, 
  currentIndex, 
  totalQuestions, 
  onSelectAnswer, 
  selectedAnswer, 
  showFeedback,
  mode 
}) {
  const { t } = useLanguage();

  if (!question) return null;

  // Función auxiliar para traducir la dificultad que viene de la BD
  const getDifficultyLabel = (level) => {
    if (!level) return t('common.difficulty.basic');
    
    const key = level.toLowerCase();
    
    // Mapeo robusto para detectar inglés o español en los datos
    if (key.includes('basic') || key.includes('básico') || key.includes('basico')) 
      return t('common.difficulty.basic');
    if (key.includes('inter') || key.includes('medium')) 
      return t('common.difficulty.intermediate');
    if (key.includes('advan') || key.includes('avanzad')) 
      return t('common.difficulty.advanced');
      
    return level; // Fallback por si acaso
  };

  const getOptionStyles = (index) => {
    const baseStyles = "w-full p-4 rounded-xl text-left transition-all border-2 flex items-center gap-4 relative group";
    
    if (showFeedback) {
      if (index === question.correct) {
        return `${baseStyles} bg-green-50 border-green-500 text-green-800 dark:bg-green-900/30 dark:border-green-500 dark:text-green-300`;
      }
      if (selectedAnswer === index && index !== question.correct) {
        return `${baseStyles} bg-red-50 border-red-500 text-red-800 dark:bg-red-900/30 dark:border-red-500 dark:text-red-300`;
      }
      return `${baseStyles} bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400 opacity-50`;
    }

    if (selectedAnswer === index) {
      return `${baseStyles} bg-indigo-50 border-indigo-500 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-500 dark:text-indigo-300 shadow-sm`;
    }

    return `${baseStyles} bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-gray-50 dark:hover:bg-gray-750`;
  };

  const getOptionLabel = (index) => String.fromCharCode(65 + index); // A, B, C, D...

  return (
    <div className="w-full">
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-white dark:border-gray-800"
        >
          {/* HEADER DE LA TARJETA: Badges de Pregunta y Dificultad */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold uppercase tracking-wider">
              {/* ✅ CORRECCIÓN AQUÍ: Usar traducción */}
              {t('common.question')} {currentIndex + 1}
            </span>
            
            {question.difficulty && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg text-xs font-bold capitalize">
                {/* ✅ CORRECCIÓN AQUÍ: Traducir dificultad */}
                {getDifficultyLabel(question.difficulty)}
              </span>
            )}
          </div>

          {/* PREGUNTA */}
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-8 leading-relaxed">
            {question.question}
          </h2>

          {/* OPCIONES */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showFeedback && onSelectAnswer(index)}
                disabled={showFeedback}
                className={getOptionStyles(index)}
              >
                {/* Círculo de la letra A, B, C... */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border flex-shrink-0 transition-colors
                  ${selectedAnswer === index || (showFeedback && index === question.correct)
                    ? 'bg-current text-white border-transparent'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-500 border-gray-200 dark:border-gray-600 group-hover:border-indigo-300 group-hover:text-indigo-500'}
                `}>
                  {/* Si está seleccionado o es feedback, usamos el color de fondo para el texto */}
                  <span className={selectedAnswer === index || (showFeedback && index === question.correct) ? 'text-white dark:text-gray-900' : ''}>
                    {getOptionLabel(index)}
                  </span>
                </div>

                <span className="font-medium text-base text-left flex-1">
                  {option}
                </span>

                {/* Iconos de Feedback */}
                {showFeedback && index === question.correct && (
                  <span className="text-green-600 text-xl">✓</span>
                )}
                {showFeedback && selectedAnswer === index && index !== question.correct && (
                  <span className="text-red-500 text-xl">✕</span>
                )}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}