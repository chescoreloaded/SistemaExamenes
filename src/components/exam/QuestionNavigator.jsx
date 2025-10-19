export function QuestionNavigator({ 
  questions,
  currentIndex,
  answers,
  reviewedQuestions = new Set(),
  onQuestionClick
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Navegación de Preguntas
      </h3>
      <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {questions.map((question, index) => {
          const isAnswered = answers.hasOwnProperty(question.id);
          const isReviewed = reviewedQuestions.has(question.id);
          const isCurrent = index === currentIndex;

          let buttonStyle = 'bg-gray-100 text-gray-600 hover:bg-gray-200';
          
          if (isCurrent) {
            buttonStyle = 'bg-primary text-white ring-2 ring-primary ring-offset-2';
          } else if (isReviewed) {
            buttonStyle = 'bg-orange-100 text-orange-700 border-2 border-orange-500';
          } else if (isAnswered) {
            buttonStyle = 'bg-green-100 text-green-700';
          }

          return (
            <button
              key={question.id}
              onClick={() => onQuestionClick(index)}
              className={`
                w-10 h-10 rounded-lg font-semibold text-sm
                transition-all duration-200
                ${buttonStyle}
              `}
              title={`Pregunta ${index + 1}${isAnswered ? ' (Respondida)' : ''}${isReviewed ? ' (Marcada)' : ''}`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-gray-200 space-y-2 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary rounded"></div>
          <span className="text-gray-600">Pregunta actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-100 border-2 border-green-200 rounded"></div>
          <span className="text-gray-600">Respondida</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-orange-100 border-2 border-orange-500 rounded"></div>
          <span className="text-gray-600">Marcada para revisar</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 rounded"></div>
          <span className="text-gray-600">Sin responder</span>
        </div>
      </div>
    </div>
  );
}