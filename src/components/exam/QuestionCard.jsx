export function QuestionCard({ 
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
    <div className="bg-white rounded-lg shadow-lg p-6 animate-slideIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <span className="text-sm font-semibold text-gray-600">
          Pregunta {questionNumber} de {totalQuestions}
        </span>
        <div className="flex gap-2">
          {question.category && (
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              {question.category}
            </span>
          )}
          {question.difficulty && (
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              question.difficulty === 'basico' ? 'bg-green-100 text-green-700' :
              question.difficulty === 'intermedio' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {question.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Question */}
      <h2 className="text-2xl font-bold text-gray-800 mb-6 leading-relaxed">
        {question.question}
      </h2>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrectOption = index === question.correct;
          const showCorrect = showFeedback && isCorrectOption;
          const showIncorrect = showFeedback && isSelected && !isCorrect;

          let optionStyles = 'border-2 border-gray-200 hover:border-primary hover:bg-blue-50';
          
          if (isSelected && !showFeedback) {
            optionStyles = 'border-primary bg-blue-50 ring-2 ring-primary ring-opacity-50';
          }
          
          if (showCorrect) {
            optionStyles = 'border-green-500 bg-green-50 ring-2 ring-green-500 ring-opacity-50';
          }
          
          if (showIncorrect) {
            optionStyles = 'border-red-500 bg-red-50 ring-2 ring-red-500 ring-opacity-50';
          }

          return (
            <button
              key={index}
              onClick={() => !showFeedback && onSelectAnswer(index)}
              disabled={showFeedback}
              className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${optionStyles} ${
                showFeedback ? 'cursor-default' : 'cursor-pointer'
              }`}
            >
              <div className="flex items-center gap-3">
                {/* Radio button o check/cross */}
                <div className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                  showCorrect ? 'border-green-500 bg-green-500' :
                  showIncorrect ? 'border-red-500 bg-red-500' :
                  isSelected ? 'border-primary bg-primary' :
                  'border-gray-300'
                }`}>
                  {showCorrect && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {showIncorrect && (
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                  {isSelected && !showFeedback && (
                    <div className="w-2 h-2 bg-white rounded-full" />
                  )}
                </div>

                {/* Option text */}
                <span className={`flex-1 text-base ${
                  showCorrect ? 'text-green-900 font-semibold' :
                  showIncorrect ? 'text-red-900 font-semibold' :
                  isSelected ? 'text-primary font-semibold' :
                  'text-gray-700'
                }`}>
                  {option}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Explanation (solo en modo práctica) */}
      {showFeedback && question.explanation && (
        <div className={`mt-6 p-4 rounded-lg border-l-4 ${
          isCorrect 
            ? 'bg-green-50 border-green-500' 
            : 'bg-orange-50 border-orange-500'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
              isCorrect ? 'bg-green-500' : 'bg-orange-500'
            }`}>
              {isCorrect ? (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-white text-sm font-bold">i</span>
              )}
            </div>
            <div>
              <p className={`font-semibold mb-2 ${isCorrect ? 'text-green-900' : 'text-orange-900'}`}>
                {isCorrect ? '¡Correcto!' : 'Respuesta incorrecta'}
              </p>
              <p className="text-gray-700 text-sm leading-relaxed">
                {question.explanation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}