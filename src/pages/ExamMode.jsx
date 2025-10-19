import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useExam } from '../hooks/useExam';
import { useExamStore } from '../store/examStore';
import { 
  QuestionCard, 
  QuestionNavigator, 
  ExamHeader, 
  NavigationControls 
} from '../components/exam';
import { Loading } from '../components/common/Loading';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';

export default function ExamMode() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') || 'exam';
  
  const [showFinishModal, setShowFinishModal] = useState(false);
  const { setCurrentSubject, addRecentSubject } = useExamStore();

  // ✅ TODOS LOS HOOKS AL INICIO (ANTES DE CUALQUIER IF/RETURN)
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

  // ✅ TODOS LOS useEffect AL INICIO
  // Guardar materia actual en store
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

  // Redirigir a resultados cuando termine
  useEffect(() => {
    if (isFinished && results) {
      navigate(`/results/${subjectId}`, { 
        state: { results },
        replace: true 
      });
    }
  }, [isFinished, results, navigate, subjectId]);

  // Keyboard navigation
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
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [canGoPrevious, canGoNext, currentQuestion, isCurrentAnswered, previousQuestion, nextQuestion, toggleReview]);

  // ✅ HANDLERS (después de hooks, antes de renders condicionales)
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

  // ✅ AHORA SÍ, LOS RETURNS CONDICIONALES
  // Manejo de errores
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Error al cargar el examen
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/subjects')}
          >
            Volver a materias
          </Button>
        </div>
      </div>
    );
  }

  // Loading
  if (isLoading) {
    return <Loading fullScreen text="Cargando examen..." />;
  }

  // ✅ RENDER PRINCIPAL
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Navigator (sidebar) */}
          <div className="lg:col-span-1 order-2 lg:order-1">
            <div className="sticky top-24">
              <QuestionNavigator
                questions={questions}
                currentIndex={currentIndex}
                answers={answers}
                reviewedQuestions={reviewedQuestions}
                onQuestionClick={goToQuestion}
              />
              
              {/* Keyboard shortcuts hint */}
              <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-blue-900 mb-2">
                  ⌨️ Atajos de teclado
                </p>
                <ul className="text-xs text-blue-700 space-y-1">
                  <li>← → : Navegar preguntas</li>
                  <li>1-4 : Seleccionar opción</li>
                  <li>M : Marcar para revisar</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Question Card (main) */}
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

      {/* Navigation Controls (bottom) */}
      <NavigationControls
        onPrevious={previousQuestion}
        onNext={nextQuestion}
        onToggleReview={toggleReview}
        onFinish={handleFinishClick}
        canGoPrevious={canGoPrevious}
        canGoNext={canGoNext}
        isReviewed={isCurrentReviewed}
        answeredCount={answeredCount}
        totalQuestions={totalQuestions}
      />

      {/* Finish Confirmation Modal */}
      <Modal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        title="⚠️ Confirmar finalización"
        size="md"
      >
        <div className="text-center">
          <p className="text-gray-700 mb-4">
            Tienes <strong className="text-danger">{totalQuestions - answeredCount} preguntas sin responder</strong>.
          </p>
          <p className="text-gray-600 mb-6">
            ¿Estás seguro de que deseas finalizar el examen?
          </p>
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowFinishModal(false)}
            >
              Continuar examen
            </Button>
            <Button 
              variant="danger" 
              onClick={handleConfirmFinish}
            >
              Finalizar de todas formas
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}