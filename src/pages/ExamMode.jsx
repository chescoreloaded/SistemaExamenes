import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useExam } from '../hooks/useExam';
import { useSwipe } from '../hooks/useSwipe';
import { useExamStore } from '../store/examStore';
import { 
  QuestionCard, 
  QuestionNavigator, 
  ExamHeader, 
  NavigationControls 
} from '../components/exam';
import { Loading, Modal, Button, Breadcrumbs } from '../components/common';

export default function ExamMode() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') || 'exam';
  
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false); // ✅ NUEVO: Navegador colapsable en mobile
  const { setCurrentSubject, addRecentSubject } = useExamStore();

  const {
    questions,
    config,
    currentQuestion,
    currentIndex,
    answers,
    reviewedQuestions,
    isLoading,
    error,
    isFinished,
    results,
    timeRemaining,
    timerRunning,
    progress,
    answeredCount,
    totalQuestions,
    currentAnswer,
    isCurrentAnswered,
    isCurrentCorrect,
    isCurrentReviewed,
    canGoNext,
    canGoPrevious,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    toggleReview,
    finishExam
  } = useExam(subjectId, mode);

  // ✅ NUEVO: Swipe gestures para mobile
  useSwipe(
    () => canGoNext && nextQuestion(),      // Swipe left → Siguiente
    () => canGoPrevious && previousQuestion(), // Swipe right → Anterior
    null,
    () => setShowNavigator(prev => !prev)    // Swipe down → Toggle navegador
  );

  useEffect(() => {
    if (config) {
      setCurrentSubject({
        id: subjectId,
        name: config.name,
        icon: config.icon
      });
      addRecentSubject(subjectId);
    }
  }, [config, subjectId, setCurrentSubject, addRecentSubject]);

  useEffect(() => {
    if (isFinished && results) {
      navigate(`/results/${subjectId}`, { 
        state: { results },
        replace: true 
      });
    }
  }, [isFinished, results, navigate, subjectId]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (canGoPrevious) previousQuestion();
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (canGoNext) nextQuestion();
          break;
        case '1':
        case '2':
        case '3':
        case '4':
          e.preventDefault();
          const optionIndex = parseInt(e.key) - 1;
          if (currentQuestion?.options[optionIndex] && !isCurrentAnswered) {
            handleSelectAnswer(optionIndex);
          }
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleReview();
          break;
        case 'Escape':
          e.preventDefault();
          setShowExitModal(true);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canGoPrevious, canGoNext, currentQuestion, isCurrentAnswered, previousQuestion, nextQuestion, toggleReview]);

  const handleSelectAnswer = (answerIndex) => {
    selectAnswer(currentQuestion.id, answerIndex);
    
    if (mode === 'practice' && canGoNext) {
      setTimeout(() => {
        nextQuestion();
      }, 1500);
    }
  };

  const handleFinishClick = () => {
    const unanswered = totalQuestions - answeredCount;
    
    if (unanswered > 0) {
      setShowFinishModal(true);
    } else {
      finishExam();
    }
  };

  const handleConfirmFinish = () => {
    setShowFinishModal(false);
    finishExam();
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    navigate('/');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-bounce-in">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Error al cargar el examen
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            ← Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <Loading fullScreen text="Cargando examen..." />;
  }

  const breadcrumbItems = [
    { label: 'Inicio', href: '/', icon: '🏠' },
    { label: config?.name || 'Materia', href: '/', icon: config?.icon || '📚' },
    { label: mode === 'exam' ? 'Modo Examen' : 'Modo Práctica', icon: mode === 'exam' ? '📝' : '🎯' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="relative">
        <ExamHeader
          subjectName={config?.name || 'Examen'}
          subjectIcon={config?.icon}
          mode={mode}
          timeRemaining={timeRemaining}
          showTimer={mode === 'exam' && config?.settings?.timeLimit > 0}
          answeredCount={answeredCount}
          totalQuestions={totalQuestions}
          progress={progress}
        />
        
        {/* ✅ MEJORADO: Botón salir más grande para mobile */}
        <button
          onClick={() => setShowExitModal(true)}
          className="fixed top-16 left-4 z-50 bg-white hover:bg-gray-50 text-gray-700 px-5 py-3 rounded-xl font-semibold shadow-lg hover:shadow-2xl border-2 border-gray-300 hover:border-gray-400 transform hover:scale-105 transition-all duration-200 flex items-center gap-2 animate-fadeIn min-h-[44px]"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="hidden sm:inline">Salir</span>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ✅ NUEVO: Botón para mostrar navegador en mobile */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowNavigator(!showNavigator)}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
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

          {/* Question Navigator */}
          <div className={`lg:col-span-1 order-2 lg:order-1 ${showNavigator ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-24">
              <QuestionNavigator
                questions={questions}
                currentIndex={currentIndex}
                answers={answers}
                reviewedQuestions={reviewedQuestions}
                onQuestionClick={(index) => {
                  goToQuestion(index);
                  setShowNavigator(false); // Cerrar navegador en mobile al seleccionar
                }}
              />
              
              {/* Keyboard shortcuts - ocultar en mobile */}
              <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-4 shadow-sm hidden lg:block">
                <p className="text-xs font-bold text-blue-900 mb-3 flex items-center gap-2">
                  <span className="text-base">⌨️</span> Atajos de teclado
                </p>
                <ul className="text-xs text-blue-700 space-y-2">
                  <li className="flex items-center gap-2">
                    <kbd className="bg-white px-2 py-1 rounded shadow-sm font-mono font-bold">←→</kbd>
                    <span>Navegar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <kbd className="bg-white px-2 py-1 rounded shadow-sm font-mono font-bold">1-4</kbd>
                    <span>Responder</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <kbd className="bg-white px-2 py-1 rounded shadow-sm font-mono font-bold">M</kbd>
                    <span>Marcar</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <kbd className="bg-white px-2 py-1 rounded shadow-sm font-mono font-bold text-red-600">Esc</kbd>
                    <span>Salir</span>
                  </li>
                </ul>
              </div>

              {/* ✅ NUEVO: Hint de swipe en mobile */}
              <div className="mt-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 shadow-sm lg:hidden">
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
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={totalQuestions}
              onSelectAnswer={handleSelectAnswer}
              selectedAnswer={currentAnswer}
              showFeedback={mode === 'practice' && isCurrentAnswered}
              mode={mode}
            />
          </div>
        </div>
      </div>

      {/* ✅ MEJORADO: Navigation Controls con botones más grandes */}
      <div className="bg-gradient-to-r from-white via-blue-50 to-white border-t-2 border-blue-100 sticky bottom-0 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-2 md:gap-4">
            <button
              onClick={previousQuestion}
              disabled={!canGoPrevious}
              className="flex items-center gap-1 md:gap-2 px-4 md:px-6 py-3 md:py-3 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 font-medium rounded-lg border-2 border-gray-200 hover:border-blue-300 disabled:border-gray-200 shadow hover:shadow-md transition-all disabled:cursor-not-allowed transform hover:scale-105 disabled:transform-none min-h-[44px] text-sm md:text-base"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Anterior</span>
            </button>

            <button
              onClick={toggleReview}
              className={`px-3 md:px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-105 shadow-md hover:shadow-lg min-h-[44px] text-xs md:text-base ${
                isCurrentReviewed
                  ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white border-2 border-yellow-500'
                  : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-yellow-400 hover:bg-yellow-50'
              }`}
            >
              <span className="hidden md:inline">
                {isCurrentReviewed ? '⭐ Marcada para revisar' : '☆ Marcar para revisar'}
              </span>
              <span className="md:hidden text-xl">
                {isCurrentReviewed ? '⭐' : '☆'}
              </span>
            </button>

            {canGoNext ? (
              <button
                onClick={nextQuestion}
                className="flex items-center gap-1 md:gap-2 px-4 md:px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 min-h-[44px] text-sm md:text-base"
              >
                <span className="hidden sm:inline">Siguiente</span>
                <span className="sm:hidden">→</span>
                <svg className="w-5 h-5 hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <button
                onClick={handleFinishClick}
                className="px-4 md:px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:shadow-xl transition-all transform hover:scale-105 flex items-center gap-2 min-h-[44px] text-sm md:text-base"
              >
                <span className="text-xl">✅</span>
                <span>
                  Finalizar
                  <span className="hidden md:inline">
                    {answeredCount < totalQuestions && ` (${totalQuestions - answeredCount})`}
                  </span>
                </span>
              </button>
            )}
          </div>

          <div className="mt-3 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-full transition-all duration-500 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        title="⚠️ Confirmar finalización"
        size="md"
      >
        <div className="text-center">
          <div className="text-6xl mb-4">⏰</div>
          <p className="text-gray-700 mb-4">
            Tienes <strong className="text-orange-600 text-xl">{totalQuestions - answeredCount} preguntas sin responder</strong>.
          </p>
          <p className="text-gray-600 mb-6">
            ¿Estás seguro de que deseas finalizar el {mode === 'exam' ? 'examen' : 'práctica'}?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowFinishModal(false)}
              className="bg-white hover:bg-gray-50 border-2 border-gray-300 min-h-[44px]"
            >
              Continuar {mode === 'exam' ? 'examen' : 'práctica'}
            </Button>
            <Button 
              variant="danger" 
              onClick={handleConfirmFinish}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 min-h-[44px]"
            >
              Finalizar de todas formas
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="🚪 ¿Salir del examen?"
        size="md"
      >
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">⚠️</div>
          <p className="text-gray-700 mb-4">
            Has respondido <strong className="text-indigo-600 text-xl">{answeredCount} de {totalQuestions}</strong> preguntas.
          </p>
          <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-semibold mb-2">
              {mode === 'exam' 
                ? '⚠️ Si sales ahora, perderás todo tu progreso y no se guardará tu calificación.'
                : '⚠️ Si sales ahora, perderás tu progreso actual.'
              }
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowExitModal(false)}
              className="bg-white hover:bg-gray-50 border-2 border-gray-300 px-6 min-h-[44px]"
            >
              Continuar {mode === 'exam' ? 'examen' : 'práctica'}
            </Button>
            <Button 
              variant="danger" 
              onClick={handleConfirmExit}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 px-6 min-h-[44px]"
            >
              Salir de todas formas
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}