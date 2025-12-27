import { memo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { useLanguage } from '@/context/LanguageContext';

export const QuestionNavigator = memo(function QuestionNavigator({
  questions,
  currentIndex,
  answers,
  reviewedQuestions,
  onGoToQuestion,
  variant = 'default' // 'default' | 'sidebar'
}) {
  const { t } = useLanguage();

  if (!questions || questions.length === 0) return null;

  const getQuestionStatus = (question, index) => {
    const isAnswered = answers && answers[question.id] !== undefined;
    const isReviewed = reviewedQuestions && reviewedQuestions.has(question.id);
    const isCurrent = index === currentIndex;

    if (isCurrent) return 'current';
    if (isReviewed) return 'reviewed';
    if (isAnswered) return 'answered';
    return 'unanswered';
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'current':
        return 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white ring-2 ring-indigo-300 dark:ring-indigo-500 shadow-md scale-105 z-10';
      case 'reviewed':
        return 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-sm';
      case 'answered':
        return 'bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-sm';
      case 'unanswered':
      default:
        return 'bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'current': return '📍';
      case 'reviewed': return '⭐';
      case 'answered': return '✓';
      default: return '';
    }
  };

  // Ajustes visuales según variante
  const isSidebar = variant === 'sidebar';
  const containerClasses = isSidebar 
    ? "w-full bg-transparent p-0" 
    : "bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border-2 border-gray-200 dark:border-gray-700";
  
  const gridClasses = isSidebar
    ? "grid-cols-4 gap-2" // 4 columnas en panel lateral para mejor espacio
    : "grid-cols-5 gap-2";

  return (
    <div className={`${containerClasses} transition-colors duration-300`}>
      {/* Header del Navegador */}
      <div className={`flex items-center justify-between mb-4 pb-2 ${isSidebar ? 'border-b border-border' : 'border-b-2 border-gray-100 dark:border-gray-700'}`}>
        <h3 className="font-bold text-gray-800 dark:text-white flex items-center gap-2">
          {!isSidebar && <span>🗂️</span>}
          {t('exam.ui.navigator')}
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full font-mono">
          {Object.keys(answers).length} / {questions.length}
        </span>
      </div>

      <div className={`grid ${gridClasses} max-h-[60vh] overflow-y-auto pr-1 custom-scrollbar pb-2`}>
        {questions.map((question, index) => {
          const status = getQuestionStatus(question, index);
          return (
            <motion.button
              key={question.id}
              onClick={() => onGoToQuestion(index)}
              className={`
                relative h-10 rounded-md font-bold text-sm
                transition-all duration-200 flex flex-col items-center justify-center
                ${getStatusStyles(status)}
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {status !== 'unanswered' && status !== 'current' && (
                 <span className="absolute -top-1 -right-1 text-[8px] leading-none">{getStatusIcon(status)}</span>
              )}
              <span>{index + 1}</span>
            </motion.button>
          );
        })}
      </div>

      <div className={`mt-4 pt-3 ${isSidebar ? 'border-t border-border' : 'border-t-2 border-gray-100 dark:border-gray-700'} space-y-2 text-xs`}>
        <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
            <span className="text-gray-600 dark:text-gray-400 truncate">{t('exam.ui.legend.current')}</span>
            </div>
            <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-green-500 to-emerald-500" />
            <span className="text-gray-600 dark:text-gray-400 truncate">{t('exam.ui.legend.answered')}</span>
            </div>
            <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400" />
            <span className="text-gray-600 dark:text-gray-400 truncate">{t('exam.ui.legend.marked')}</span>
            </div>
            <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 border border-gray-300 dark:border-gray-600" />
            <span className="text-gray-600 dark:text-gray-400 truncate">{t('exam.ui.legend.unanswered')}</span>
            </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.currentIndex === nextProps.currentIndex &&
    prevProps.questions.length === nextProps.questions.length &&
    Object.keys(prevProps.answers).length === Object.keys(nextProps.answers).length &&
    prevProps.reviewedQuestions.size === nextProps.reviewedQuestions.size &&
    prevProps.variant === nextProps.variant
  );
});

QuestionNavigator.displayName = 'QuestionNavigator';
// PropTypes omitidos para brevedad, pero deberían incluir 'variant'
export default QuestionNavigator;