import { memo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

// ✅ Componente memoizado con dark mode
export const QuestionNavigator = memo(function QuestionNavigator({
  questions,
  currentIndex,
  answers,
  reviewedQuestions,
  onGoToQuestion
}) {
  if (!questions || questions.length === 0) return null;

  const getQuestionStatus = (question, index) => {
    const isAnswered = answers && answers[question.id] !== undefined;
    const isReviewed = reviewedQuestions && reviewedQuestions.has(question.id);
    const isCurrent = index === currentIndex;

    if (isCurrent) {
      return 'current';
    }
    if (isReviewed) {
      return 'reviewed';
    }
    if (isAnswered) {
      return 'answered';
    }
    return 'unanswered';
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case 'current':
        return 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white ring-4 ring-indigo-300 dark:ring-indigo-600 scale-110 shadow-lg';
      case 'reviewed':
        return 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white hover:scale-105 shadow-md';
      case 'answered':
        return 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 text-green-800 dark:text-green-300 hover:bg-green-200 dark:hover:bg-green-800/50 hover:scale-105';
      case 'unanswered':
      default:
        return 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 hover:scale-105 border-2 border-gray-300 dark:border-gray-600';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'current':
        return '📍';
      case 'reviewed':
        return '⭐';
      case 'answered':
        return '✓';
      case 'unanswered':
      default:
        return '';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border-2 border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-100 dark:border-gray-700">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          🗂️ Navegador
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
          {Object.keys(answers).length} / {questions.length}
        </span>
      </div>

      <div className="grid grid-cols-5 gap-2 max-h-[500px] overflow-y-auto pr-2">
        {questions.map((question, index) => {
          const status = getQuestionStatus(question, index);
          const styles = getStatusStyles(status);
          const icon = getStatusIcon(status);

          return (
            <motion.button
              key={question.id}
              onClick={() => onGoToQuestion(index)}
              className={`
                relative min-h-[44px] rounded-lg font-bold text-sm
                transition-all duration-200 flex flex-col items-center justify-center
                ${styles}
              `}
              whileHover={{ scale: status === 'current' ? 1.1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: status === 'current' ? 1.1 : 1 }}
              transition={{ duration: 0.2 }}
            >
              <span className="text-xs mb-0.5">{icon}</span>
              <span>{index + 1}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Leyenda */}
      <div className="mt-4 pt-3 border-t-2 border-gray-100 dark:border-gray-700 space-y-1 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-indigo-500 to-purple-500" />
          <span className="text-gray-600 dark:text-gray-400">Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-900/40 dark:to-emerald-900/40 border-2 border-green-300 dark:border-green-600" />
          <span className="text-gray-600 dark:text-gray-400">Respondida</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-gradient-to-br from-yellow-400 to-orange-400" />
          <span className="text-gray-600 dark:text-gray-400">Marcada</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600" />
          <span className="text-gray-600 dark:text-gray-400">Sin responder</span>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) => {
  // ✅ Custom comparison
  return (
    prevProps.currentIndex === nextProps.currentIndex &&
    prevProps.questions.length === nextProps.questions.length &&
    Object.keys(prevProps.answers).length === Object.keys(nextProps.answers).length &&
    prevProps.reviewedQuestions.size === nextProps.reviewedQuestions.size
  );
});

QuestionNavigator.propTypes = {
  questions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired
    })
  ).isRequired,
  currentIndex: PropTypes.number.isRequired,
  answers: PropTypes.object.isRequired,
  reviewedQuestions: PropTypes.instanceOf(Set).isRequired,
  onGoToQuestion: PropTypes.func.isRequired
};

QuestionNavigator.displayName = 'QuestionNavigator';

export default QuestionNavigator;