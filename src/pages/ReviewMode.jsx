import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSwipe } from '@/hooks/useSwipe';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Button, Loading } from '@/components/common';

export default function ReviewMode() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const results = location.state?.results;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterMode, setFilterMode] = useState('all');
  const [showNavigator, setShowNavigator] = useState(false);

  // ✅ Swipe gestures para mobile
  useSwipe(
    () => nextQuestion(),
    () => previousQuestion(),
    null,
    () => setShowNavigator(prev => !prev)
  );

  useEffect(() => {
    if (!results) {
      navigate('/');
    }
  }, [results, navigate]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          previousQuestion();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextQuestion();
          break;
        case 'Escape':
          e.preventDefault();
          navigate(`/results/${subjectId}`, { state: { results } });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, filterMode, results, navigate, subjectId]);

  if (!results) return <Loading fullScreen />;

  const questions = results.questions || [];
  const answers = results.answers || {};

  const filteredQuestions = questions.filter((q) => {
    const userAnswer = answers[q.id];
    const isAnswered = userAnswer !== undefined;
    const isCorrect = isAnswered && userAnswer === q.correct;

    switch(filterMode) {
      case 'correct':
        return isCorrect;
      case 'incorrect':
        return isAnswered && !isCorrect;
      case 'unanswered':
        return !isAnswered;
      default:
        return true;
    }
  });

  const currentQuestion = filteredQuestions[currentIndex];
  const userAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isAnswered = userAnswer !== undefined;
  const isCorrect = isAnswered && userAnswer === currentQuestion?.correct;

  const nextQuestion = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const goToQuestion = (index) => {
    setCurrentIndex(index);
    setShowNavigator(false);
  };

  const handleFilterChange = (mode) => {
    setFilterMode(mode);
    setCurrentIndex(0);
  };

  const breadcrumbItems = [
    { label: 'Inicio', href: '/', icon: '🏠' },
    { label: results.subjectName, href: '/', icon: '📚' },
    { label: 'Resultados', href: `/results/${subjectId}`, icon: '📊' },
    { label: 'Revisión Detallada', icon: '🔍' }
  ];

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <Breadcrumbs items={breadcrumbItems} />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No hay preguntas para mostrar
            </h2>
            <p className="text-gray-600 mb-6">
              Cambia el filtro para ver más preguntas
            </p>
            <Button onClick={() => handleFilterChange('all')}>
              Mostrar todas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 pb-20 lg:pb-0">
      <Breadcrumbs items={breadcrumbItems} />

      {/* Botones flotantes optimizados para mobile */}
      <div className="fixed top-14 left-2 lg:left-4 z-50 flex flex-col gap-2">
        <button
          onClick={() => navigate(`/results/${subjectId}`, { state: { results } })}
          className="bg-white hover:bg-blue-50 text-gray-700 px-3 py-2 lg:px-5 lg:py-2.5 rounded-lg lg:rounded-xl font-semibold shadow-lg border-2 border-blue-300 hover:border-blue-400 transform hover:scale-105 transition-all flex items-center gap-1 lg:gap-2 text-sm lg:text-base min-h-[44px]"
        >
          <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline">Resultados</span>
        </button>
        <button
          onClick={() => navigate('/')}
          className="bg-white hover:bg-gray-50 text-gray-700 px-3 py-2 lg:px-5 lg:py-2.5 rounded-lg lg:rounded-xl font-semibold shadow-lg border-2 border-gray-300 hover:border-gray-400 transform hover:scale-105 transition-all flex items-center gap-1 lg:gap-2 text-sm lg:text-base min-h-[44px]"
        >
          <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="hidden sm:inline">Inicio</span>
        </button>
      </div>

      {/* Header con filtros responsive */}
      <div className="bg-white shadow-sm border-b sticky top-[52px] z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 lg:py-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 lg:gap-0">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800 flex items-center gap-2">
                🔍 Revisión Detallada
              </h1>
              <p className="text-xs lg:text-sm text-gray-600 mt-1">
                {results.subjectName} • Calificación: {results.score.toFixed(1)}%
              </p>
            </div>

            {/* Filtros responsive con scroll horizontal */}
            <div className="flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap min-h-[44px] ${
                  filterMode === 'all'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-indigo-400'
                }`}
              >
                Todas ({questions.length})
              </button>
              <button
                onClick={() => handleFilterChange('correct')}
                className={`px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap min-h-[44px] ${
                  filterMode === 'correct'
                    ? 'bg-green-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-green-400'
                }`}
              >
                ✅ <span className="hidden sm:inline">Correctas</span> ({results.correctAnswers})
              </button>
              <button
                onClick={() => handleFilterChange('incorrect')}
                className={`px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap min-h-[44px] ${
                  filterMode === 'incorrect'
                    ? 'bg-red-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-red-400'
                }`}
              >
                ❌ <span className="hidden sm:inline">Incorrectas</span> ({results.totalQuestions - results.correctAnswers - (results.totalQuestions - Object.keys(answers).length)})
              </button>
              <button
                onClick={() => handleFilterChange('unanswered')}
                className={`px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap min-h-[44px] ${
                  filterMode === 'unanswered'
                    ? 'bg-gray-500 text-white shadow-md'
                    : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                }`}
              >
                ⚪ <span className="hidden sm:inline">Sin responder</span> ({results.totalQuestions - Object.keys(answers).length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Botón toggle navegador (solo mobile) */}
      <div className="lg:hidden px-4 mt-4">
        <button
          onClick={() => setShowNavigator(!showNavigator)}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
        >
          <span className="text-xl">🗂️</span>
          <span>{showNavigator ? 'Ocultar' : 'Ver'} Navegador</span>
          <svg 
            className={`w-5 h-5 transition-transform ${showNavigator ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigator colapsable */}
          <div className={`lg:col-span-1 order-2 lg:order-1 ${showNavigator ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-xl p-4 lg:p-6 border-2 border-gray-100 sticky top-32">
              <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2 text-base lg:text-lg">
                <span className="text-xl lg:text-2xl">🗂️</span>
                Navegación
              </h3>

              <div className="grid grid-cols-5 gap-2 mb-4 max-h-64 lg:max-h-96 overflow-y-auto">
                {filteredQuestions.map((q, index) => {
                  const answer = answers[q.id];
                  const answered = answer !== undefined;
                  const correct = answered && answer === q.correct;
                  
                  let bgColor = 'bg-white border-2 border-gray-300';
                  if (index === currentIndex) {
                    bgColor = 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg scale-110 ring-4 ring-indigo-300';
                  } else if (correct) {
                    bgColor = 'bg-gradient-to-br from-green-100 to-emerald-100 text-green-700 border-2 border-green-400';
                  } else if (answered && !correct) {
                    bgColor = 'bg-gradient-to-br from-red-100 to-pink-100 text-red-700 border-2 border-red-400';
                  } else {
                    bgColor = 'bg-gray-100 text-gray-500 border-2 border-gray-300';
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => goToQuestion(index)}
                      className={`aspect-square rounded-lg font-bold text-sm transition-all ${bgColor} hover:scale-105 min-h-[44px]`}
                    >
                      {questions.indexOf(q) + 1}
                    </button>
                  );
                })}
              </div>

              <div className="text-xs text-gray-600 space-y-2 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-400"></div>
                  <span>Correcta</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gradient-to-br from-red-100 to-pink-100 border-2 border-red-400"></div>
                  <span>Incorrecta</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-300"></div>
                  <span>Sin responder</span>
                </div>
              </div>

              {/* Hints de gestos (solo mobile) */}
              <div className="mt-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-3 lg:hidden">
                <p className="text-xs font-bold text-purple-900 mb-2 flex items-center gap-2">
                  <span className="text-base">👆</span> Gestos táctiles
                </p>
                <ul className="text-xs text-purple-700 space-y-1">
                  <li>← Desliza para siguiente</li>
                  <li>→ Desliza para anterior</li>
                  <li>↓ Desliza para navegador</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Question Card */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <motion.div 
              className="bg-white rounded-2xl shadow-2xl p-4 lg:p-6 border-2 border-gray-100"
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 pb-3 border-b-2 border-gray-100 gap-2">
                <span className="text-xs font-bold text-gray-600 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1.5 rounded-full whitespace-nowrap">
                  🔍 Pregunta {questions.indexOf(currentQuestion) + 1} de {questions.length}
                </span>
                <div className="flex gap-2 flex-wrap">
                  {currentQuestion.category && (
                    <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full text-xs font-semibold shadow-md">
                      {currentQuestion.category}
                    </span>
                  )}
                  {currentQuestion.difficulty && (
                    <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-md ${
                      currentQuestion.difficulty === 'basico' 
                        ? 'bg-gradient-to-r from-green-400 to-emerald-400 text-white' :
                      currentQuestion.difficulty === 'intermedio' 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' :
                        'bg-gradient-to-r from-red-400 to-pink-400 text-white'
                    }`}>
                      {currentQuestion.difficulty === 'basico' ? '⭐ Básico' :
                       currentQuestion.difficulty === 'intermedio' ? '⭐⭐ Intermedio' :
                       '⭐⭐⭐ Avanzado'}
                    </span>
                  )}
                </div>
              </div>

              {/* Question */}
              <div className="mb-6">
                <h2 className="text-lg lg:text-xl font-bold text-gray-800 leading-relaxed">
                  {currentQuestion.question}
                </h2>
              </div>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, index) => {
                  const isUserAnswer = userAnswer === index;
                  const isCorrectAnswer = index === currentQuestion.correct;
                  
                  let optionStyles = 'border-2 border-gray-300 bg-white';
                  let iconBg = 'border-gray-300 bg-white';
                  let icon = null;

                  if (isCorrectAnswer) {
                    optionStyles = 'border-green-500 bg-gradient-to-r from-green-50 to-emerald-50 ring-4 ring-green-200';
                    iconBg = 'border-green-500 bg-gradient-to-br from-green-500 to-emerald-500';
                    icon = (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    );
                  } else if (isUserAnswer && !isCorrectAnswer) {
                    optionStyles = 'border-red-500 bg-gradient-to-r from-red-50 to-pink-50 ring-4 ring-red-200';
                    iconBg = 'border-red-500 bg-gradient-to-br from-red-500 to-pink-500';
                    icon = (
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    );
                  }

                  return (
                    <div
                      key={index}
                      className={`w-full p-3 lg:p-4 rounded-xl ${optionStyles}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-7 h-7 rounded-full border-2 flex items-center justify-center shadow-sm ${iconBg}`}>
                          {icon}
                        </div>
                        <span className={`flex-1 text-sm lg:text-base ${
                          isCorrectAnswer ? 'text-green-900 font-bold' :
                          isUserAnswer ? 'text-red-900 font-bold' :
                          'text-gray-700 font-medium'
                        }`}>
                          {option}
                        </span>
                        {isCorrectAnswer && <span className="text-xl lg:text-2xl">✅</span>}
                        {isUserAnswer && !isCorrectAnswer && <span className="text-xl lg:text-2xl">❌</span>}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Status Banner */}
              <div className={`p-4 rounded-xl border-l-4 mb-6 ${
                !isAnswered
                  ? 'bg-gray-50 border-gray-400'
                  : isCorrect
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-500'
                    : 'bg-gradient-to-r from-red-50 to-orange-50 border-red-500'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    !isAnswered
                      ? 'bg-gray-400'
                      : isCorrect
                        ? 'bg-gradient-to-br from-green-500 to-emerald-500'
                        : 'bg-gradient-to-br from-red-500 to-orange-500'
                  }`}>
                    <span className="text-white text-xl font-bold">
                      {!isAnswered ? '⚪' : isCorrect ? '✓' : '✗'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-sm lg:text-base ${
                      !isAnswered ? 'text-gray-700' : isCorrect ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {!isAnswered 
                        ? '⚪ No respondiste esta pregunta'
                        : isCorrect 
                          ? '🎉 ¡Respuesta Correcta!' 
                          : '❌ Respuesta Incorrecta'}
                    </p>
                    {isAnswered && (
                      <p className="text-xs lg:text-sm text-gray-600 mt-1">
                        Tu respuesta: <strong>{currentQuestion.options[userAnswer]}</strong>
                        {!isCorrect && (
                          <> • Correcta: <strong className="text-green-600">{currentQuestion.options[currentQuestion.correct]}</strong></>
                        )}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Explanation */}
              {currentQuestion.explanation && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 lg:p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center">
                      <span className="text-white text-lg font-bold">💡</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-sm lg:text-base text-blue-900 mb-2">
                        📚 Explicación
                      </p>
                      <p className="text-gray-700 text-xs lg:text-sm leading-relaxed">
                        {currentQuestion.explanation}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="bg-white border-t-2 border-gray-200 fixed bottom-0 left-0 right-0 shadow-2xl z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 lg:py-4">
          <div className="flex items-center justify-between gap-2 lg:gap-4">
            <button
              onClick={previousQuestion}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 lg:gap-2 px-3 lg:px-6 py-2 lg:py-3 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 font-medium rounded-lg border-2 border-gray-200 hover:border-blue-300 disabled:border-gray-200 shadow hover:shadow-md transition-all disabled:cursor-not-allowed text-sm lg:text-base min-h-[44px]"
            >
              <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <div className="text-center flex-1">
              <div className="text-sm font-semibold text-gray-700">
                {currentIndex + 1} de {filteredQuestions.length}
              </div>
              <div className="text-xs text-gray-500 hidden lg:block">
                <kbd className="font-mono">←→</kbd> para navegar
              </div>
            </div>

            {currentIndex < filteredQuestions.length - 1 ? (
              <button
                onClick={nextQuestion}
                className="flex items-center gap-1 lg:gap-2 px-3 lg:px-6 py-2 lg:py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all text-sm lg:text-base min-h-[44px]"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <svg className="w-4 h-4 lg:w-5 lg:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <div className="flex gap-2 lg:gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/results/${subjectId}`, { state: { results } })}
                  className="text-xs lg:text-sm px-3 lg:px-4 py-2 min-h-[44px] hidden sm:flex"
                >
                  📊 Resultados
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('/')}
                  className="text-xs lg:text-sm px-3 lg:px-4 py-2 min-h-[44px]"
                >
                  🏠 Inicio
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}