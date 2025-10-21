import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

// ✅ Componente memoizado con useMemo interno
export const QuestionNavigator = memo(function QuestionNavigator({ 
  questions, 
  currentIndex, 
  answers, 
  reviewedQuestions,
  onQuestionClick 
}) {
  // ✅ Memoizar funciones de utilidad
  const getQuestionStatus = useMemo(() => (index) => {
    const question = questions[index];
    const isAnswered = answers[question.id] !== undefined;
    const isReviewed = reviewedQuestions.has(question.id);
    const isCurrent = index === currentIndex;

    if (isCurrent) return 'current';
    if (isReviewed) return 'reviewed';
    if (isAnswered) return 'answered';
    return 'unanswered';
  }, [questions, answers, reviewedQuestions, currentIndex]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'current':
        return 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg scale-110 ring-4 ring-indigo-300';
      case 'reviewed':
        return 'bg-gradient-to-br from-yellow-400 to-orange-400 text-white border-2 border-yellow-500';
      case 'answered':
        return 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 border-2 border-green-300';
      default:
        return 'bg-white text-gray-600 border-2 border-gray-300 hover:border-indigo-400';
    }
  };

  // ✅ Contar respuestas una sola vez
  const answersCount = useMemo(() => Object.keys(answers).length, [answers]);

  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-gray-100">
      <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-lg">
        <span className="text-2xl">🗂️</span>
        Navegación de Preguntas
      </h3>

      {/* Grid de preguntas */}
      <div className="grid grid-cols-5 gap-2 mb-6">
        {questions.map((question, index) => {
          const status = getQuestionStatus(index);
          return (
            <motion.button
              key={question.id}
              onClick={() => onQuestionClick(index)}
              className={`
                aspect-square rounded-lg font-bold text-sm
                transition-all duration-200
                ${getStatusColor(status)}
              `}
              whileHover={{ scale: status === 'current' ? 1.1 : 1.05, rotate: status === 'current' ? 0 : 5 }}
              whileTap={{ scale: 0.95 }}
            >
              {index + 1}
            </motion.button>
          );
        })}
      </div>

      {/* Leyenda MEJORADA */}
      <div className="pt-4 border-t-2 border-gray-100 space-y-3 text-sm">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-indigo-500 to-purple-500 shadow-sm"></div>
          <span className="text-gray-700 font-medium">Pregunta actual</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300"></div>
          <span className="text-gray-700 font-medium">Respondida ({answersCount})</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-yellow-400 to-orange-400 shadow-sm"></div>
          <span className="text-gray-700 font-medium">Marcada ({reviewedQuestions.size})</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 rounded bg-white border-2 border-gray-300"></div>
          <span className="text-gray-700 font-medium">Sin responder</span>
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
  questions: PropTypes.array.isRequired,
  currentIndex: PropTypes.number.isRequired,
  answers: PropTypes.object.isRequired,
  reviewedQuestions: PropTypes.instanceOf(Set).isRequired,
  onQuestionClick: PropTypes.func.isRequired
};

QuestionNavigator.displayName = 'QuestionNavigator';