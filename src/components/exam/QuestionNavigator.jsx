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
        return 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white ring-2 ring-indigo-300 dark:ring-indigo-600 scale-110 shadow-lg z-10';
      case 'reviewed':
        return 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white shadow-md';
      case 'answered':
        return 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-800 dark:text-green-300 border border-green-300 dark:border-green-600';
      case 'unanswered':
      default:
        return 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600';
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

  // ✅ SOLUCIÓN DOBLE SCROLL:
  // Si es 'sidebar', quitamos el borde contenedor, la sombra y el scroll interno.
  // Dejamos que el contenedor padre maneje el layout.
  const isSidebar = variant === 'sidebar';

  return (
    <div className={`
      transition-colors duration-300
      ${isSidebar ? 'w-full' : 'bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border-2 border-gray-200 dark:border-gray-700'}
    `}>
      {/* Header solo si NO es sidebar (el sidebar ya tiene su propio título) */}
      {!isSidebar && (
        <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-100 dark:border-gray-700">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
            🗂️ {t('exam.ui.navigator')}
          </h3>
          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
            {Object.keys(answers).length} / {questions.length}
          </span>
        </div>
      )}

      {/* ✅ Grid de Preguntas:
         - Si es 'sidebar': NO ponemos max-h ni overflow. Se expande full.
         - Si es 'default': Ponemos scroll interno.
      */}
      <div className={`
        grid grid-cols-5 gap-2 pr-1
        ${isSidebar ? '' : 'max-h-[500px] overflow-y-auto custom-scrollbar'}
      `}>
        {questions.map((question, index) => {
          const status = getQuestionStatus(question, index);
          return (
            <motion.button
              key={question.id}
              onClick={() => onGoToQuestion(index)}
              className={`
                relative h-10 rounded-lg font-bold text-sm
                transition-all duration-200 flex flex-col items-center justify-center
                ${getStatusStyles(status)}
              `}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-[10px] leading-none absolute top-1 right-1 opacity-70">{getStatusIcon(status)}</span>
              <span>{index + 1}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className={`mt-4 pt-3 ${isSidebar ? 'border-t border-gray-200 dark:border-gray-700' : 'border-t-2 border-gray-100 dark:border-gray-700'} space-y-2 text-xs`}>
        <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500" />
            <span className="text-gray-600 dark:text-gray-400 truncate">{t('exam.ui.legend.current')}</span>
            </div>
            <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-green-100 to-emerald-100 border border-green-400" />
            <span className="text-gray-600 dark:text-gray-400 truncate">{t('exam.ui.legend.answered')}</span>
            </div>
            <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-orange-400" />
            <span className="text-gray-600 dark:text-gray-400 truncate">{t('exam.ui.legend.marked')}</span>
            </div>
            <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-white dark:bg-gray-700 border border-gray-400" />
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
QuestionNavigator.propTypes = {
  // ... props existing
  variant: PropTypes.oneOf(['default', 'sidebar'])
};

export default QuestionNavigator;