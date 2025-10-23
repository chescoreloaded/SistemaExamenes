import { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useExam } from '../hooks/useExam';
import { useSwipe } from '../hooks/useSwipe';
import { useExamStore } from '../store/examStore';
import { 
  QuestionNavigator, 
  ExamHeader, 
  NavigationControls 
} from '../components/exam';
import QuestionCard from '../components/exam/QuestionCard'; // ← NUEVO: Import directo
import FeedbackCard from '../components/exam/FeedbackCard'; // ← NUEVO
import { useConfetti } from '../hooks/useConfetti'; // ← NUEVO
import { Loading, Modal, Button, Breadcrumbs } from '../components/common';
import { SaveIndicator } from '../components/common/SaveIndicator';

export default function ExamMode() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') || 'exam';
  
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  // ✅ NUEVO: Estados para feedback visual
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const { canvasRef, showConfetti } = useConfetti(); // ✅ NUEVO: Confetti hook
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
    // ✅ NUEVO: Estados de autosave
    saveStatus,
    isSaving,
    isSaved,
    forceSave,
    // Acciones
    selectAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    toggleReview,
    finishExam
  } = useExam(subjectId, mode);

  // Swipe gestures para mobile
  useSwipe(
    () => canGoNext && nextQuestion(),
    () => canGoPrevious && previousQuestion(),
    null,
    () => setShowNavigator(prev => !prev)
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
          if (currentQuestion && !isCurrentAnswered) {
            const optionIndex = parseInt(e.key) - 1;
            if (optionIndex < currentQuestion.options.length) {
              handleSelectAnswer(optionIndex);
            }
          }
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleReview();
          break;
        case 'Enter':
          e.preventDefault();
          if (mode === 'practice' && isCurrentAnswered && canGoNext) {
            nextQuestion();
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    currentQuestion,
    isCurrentAnswered,
    canGoNext,
    canGoPrevious,
    mode,
    nextQuestion,
    previousQuestion,
    toggleReview
  ]);

  const handleSelectAnswer = (answerIndex) => {
    const question = questions[currentIndex];
    const isCorrect = answerIndex === question.correct;
    
    // Guardar respuesta
    selectAnswer(currentQuestion.id, answerIndex);
    
    // En modo práctica, mostrar feedback
    if (mode === 'practice') {
      // Preparar datos de feedback
      setCurrentFeedback({
        question: question.question,
        userAnswer: question.options[answerIndex],
        correctAnswer: question.options[question.correct],
        isCorrect,
        explanation: question.explanation,
        relatedFlashcard: question.relatedFlashcard
      });
      
      // Mostrar modal después de un breve delay para que se vea la animación
      setTimeout(() => {
        setShowFeedbackModal(true);
        
        // Si es correcta, mostrar confetti
        if (isCorrect) {
          showConfetti();
        }
      }, 600); // Delay para que se vea el bounce/shake primero
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
      {/* ✅ Canvas de confetti */}
      <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-50"
        style={{ width: '100%', height: '100%' }}
      />
      
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="relative">
        {/* ✅ Header mejorado */}
        <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-gray-200 shadow-md">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Sección izquierda: Título y progreso */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{config?.icon || '📚'}</span>
                  <div className="min-w-0">
                    <h1 className="text-lg font-bold text-gray-800 truncate">
                      {config?.name || 'Examen'}
                    </h1>
                    <p className="text-xs text-gray-600">
                      {mode === 'exam' ? '📝 Modo Examen' : '🎯 Modo Práctica'}
                    </p>
                  </div>
                </div>

                {/* Progress y Timer */}
                <div className="hidden md:flex items-center gap-4">
                  <div className="text-sm">
                    <span className="font-bold text-indigo-600">{answeredCount}</span>
                    <span className="text-gray-500"> / {totalQuestions}</span>
                  </div>
                  
                  {mode === 'exam' && config?.settings?.timeLimit > 0 && (
                    <div className="flex items-center gap-2 text-sm font-mono">
                      <span>⏱️</span>
                      <span className={timeRemaining < 300 ? 'text-red-600 font-bold' : 'text-gray-700'}>
                        {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Sección centro: SaveIndicator */}
              <div className="hidden lg:block">
                <SaveIndicator status={saveStatus} />
              </div>
              
              {/* Sección derecha: Botones */}
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowExitModal(true)}
                  className="hidden sm:flex"
                >
                  ← Salir
                </Button>
                
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowNavigator(!showNavigator)}
                  className="lg:hidden"
                >
                  🗂️ {showNavigator ? 'Ocultar' : 'Navegador'}
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Mobile: SaveIndicator debajo */}
            <div className="lg:hidden mt-2 flex justify-center">
              <SaveIndicator status={saveStatus} />
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6">
            {/* Question Area */}
            <main className="space-y-6">
              <QuestionCard
                question={currentQuestion}
                currentIndex={currentIndex}
                totalQuestions={totalQuestions}
                onSelectAnswer={handleSelectAnswer}
                selectedAnswer={currentAnswer}
                showFeedback={mode === 'practice' && isCurrentAnswered}
                mode={mode}
              />

              <NavigationControls
                currentIndex={currentIndex}
                totalQuestions={totalQuestions}
                onPrevious={previousQuestion}
                onNext={nextQuestion}
                onToggleReview={toggleReview}
                canGoPrevious={canGoPrevious}
                canGoNext={canGoNext}
                isReviewed={isCurrentReviewed}
                onFinish={handleFinishClick}
                mode={mode}
              />

              {/* Mobile hint */}
              <div className="lg:hidden text-center text-sm text-gray-500 bg-blue-50 rounded-lg p-3">
                💡 <strong>Tip:</strong> Desliza ← → para navegar, ↓ para ver navegador
              </div>
            </main>

            {/* Navigator Sidebar */}
            <aside 
              className={`${
                showNavigator ? 'block' : 'hidden'
              } lg:block`}
            >
              <div className="sticky top-24">
                <QuestionNavigator
                  questions={questions}
                  currentIndex={currentIndex}
                  answers={answers}
                  reviewedQuestions={reviewedQuestions}
                  onGoToQuestion={goToQuestion}
                />
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Finish Modal */}
      <Modal
        isOpen={showFinishModal}
        onClose={() => setShowFinishModal(false)}
        title="⚠️ Confirmar entrega"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Tienes <strong>{totalQuestions - answeredCount} pregunta(s) sin responder</strong>.
          </p>
          <p className="text-gray-600">
            ¿Estás seguro de que quieres entregar el examen?
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowFinishModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmFinish}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
            >
              Sí, entregar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Exit Modal */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="⚠️ Salir del examen"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            {mode === 'exam' 
              ? 'Si sales ahora, tu progreso se guardará localmente pero no podrás continuar este examen.'
              : 'Si sales ahora, tu progreso se perderá.'}
          </p>
          <p className="text-gray-600">
            ¿Estás seguro de que quieres salir?
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowExitModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleConfirmExit}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
            >
              Sí, salir
            </Button>
          </div>
        </div>
      </Modal>

      {/* Keyboard shortcuts hint */}
      <div className="fixed bottom-4 right-4 hidden md:block">
        <div className="bg-gray-900/90 text-white text-xs rounded-lg p-3 shadow-xl max-w-xs">
          <div className="font-bold mb-2">⌨️ Atajos de teclado:</div>
          <div className="space-y-1 text-gray-300">
            <div>← → : Navegar</div>
            <div>1-4 : Seleccionar opción</div>
            <div>M : Marcar para revisión</div>
            {mode === 'practice' && <div>Enter : Siguiente (en práctica)</div>}
          </div>
        </div>
      </div>

      {/* ✅ Feedback Modal en modo práctica */}
      {showFeedbackModal && currentFeedback && mode === 'practice' && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-40 p-4">
          <FeedbackCard
            {...currentFeedback}
            onClose={() => {
              setShowFeedbackModal(false);
              setCurrentFeedback(null);
              nextQuestion(); // Avanzar a la siguiente pregunta
            }}
            showConfetti={showConfetti}
          />
        </div>
      )}
    </div>
  );
}
