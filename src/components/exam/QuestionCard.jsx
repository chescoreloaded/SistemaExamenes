import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';
import { useState } from 'react';

export default function QuestionCard({ 
  question, 
  currentIndex, 
  onSelectAnswer, 
  selectedAnswer, 
  showFeedback,
  mode 
}) {
  const { t } = useLanguage();
  // Estado local para colapsar/expandir explicación si es muy larga
  const [expandExplanation, setExpandExplanation] = useState(false);

  if (!question) return null;

  const getDifficultyLabel = (level) => {
    if (!level) return t('common.difficulty.basic');
    const key = level.toLowerCase();
    if (key.includes('basic') || key.includes('básico') || key.includes('basico')) return t('common.difficulty.basic');
    if (key.includes('inter') || key.includes('medium')) return t('common.difficulty.intermediate');
    if (key.includes('advan') || key.includes('avanzad')) return t('common.difficulty.advanced');
    return level;
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

  const getOptionLabel = (index) => String.fromCharCode(65 + index);

  return (
    <div className="w-full pb-20 sm:pb-0"> {/* Padding bottom extra en móvil para el footer */}
      <AnimatePresence mode="wait">
        <motion.div
          key={question.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="bg-white dark:bg-gray-900 rounded-3xl p-5 md:p-8 shadow-xl shadow-gray-200/50 dark:shadow-none border border-white dark:border-gray-800"
        >
          {/* HEADER */}
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 rounded-lg text-xs font-bold uppercase tracking-wider">
              {t('common.question')} {currentIndex + 1}
            </span>
            {question.difficulty && (
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded-lg text-xs font-bold capitalize">
                {getDifficultyLabel(question.difficulty)}
              </span>
            )}
          </div>

          {/* PREGUNTA */}
          <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white mb-6 md:mb-8 leading-relaxed">
            {question.question}
          </h2>

          {/* OPCIONES */}
          <div className="space-y-3 mb-8">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => !showFeedback && onSelectAnswer(index)}
                disabled={showFeedback}
                className={getOptionStyles(index)}
              >
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border flex-shrink-0 transition-colors
                  ${selectedAnswer === index || (showFeedback && index === question.correct)
                    ? 'bg-current text-white border-transparent'
                    : 'bg-gray-50 dark:bg-gray-700 text-gray-500 border-gray-200 dark:border-gray-600 group-hover:border-indigo-300 group-hover:text-indigo-500'}
                `}>
                  <span className={selectedAnswer === index || (showFeedback && index === question.correct) ? 'text-white dark:text-gray-900' : ''}>
                    {getOptionLabel(index)}
                  </span>
                </div>

                <span className="font-medium text-sm md:text-base text-left flex-1 leading-snug">
                  {option}
                </span>

                {showFeedback && index === question.correct && (
                  <span className="text-green-600 text-xl">✓</span>
                )}
                {showFeedback && selectedAnswer === index && index !== question.correct && (
                  <span className="text-red-500 text-xl">✕</span>
                )}
              </button>
            ))}
          </div>

          {/* ✅ NUEVO: BLOQUE DE EXPLICACIÓN (Solo en Revisión) */}
          {showFeedback && question.explanation && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 rounded-r-xl p-4 md:p-6"
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl pt-1">💡</span>
                <div className="flex-1">
                  <h3 className="font-bold text-blue-900 dark:text-blue-100 text-sm uppercase tracking-wide mb-2">
                    {t('exam.feedback.explanationTitle') || 'Explicación Didáctica'}
                  </h3>
                  <div className={`text-blue-800 dark:text-blue-200 text-sm md:text-base leading-relaxed ${!expandExplanation && 'line-clamp-3'}`}>
                    {question.explanation}
                  </div>
                  {/* Botón Ver más si es muy largo (opcional, lógica simple) */}
                  {question.explanation.length > 200 && (
                    <button 
                      onClick={() => setExpandExplanation(!expandExplanation)}
                      className="mt-2 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {expandExplanation ? 'Ver menos' : 'Ver más'}
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
}