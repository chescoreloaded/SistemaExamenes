// src/pages/ExamMode.jsx
import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useExam } from '../hooks/useExam';
import { useSwipe } from '../hooks/useSwipe';
import { useExamStore } from '../store/examStore';
import { usePoints } from '../hooks/usePoints';
import { useAchievements } from '../hooks/useAchievements';
import { useStreak } from '../hooks/useStreak';
import { useSoundContext } from '../context/SoundContext';
import { useLanguage } from '../context/LanguageContext';
import { useConfetti } from '../hooks/useConfetti';
import {
  QuestionNavigator, NavigationControls, FeedbackCard
} from '../components/exam';
import QuestionCard from '../components/exam/QuestionCard';
import { Loading, Modal, Button, SkeletonLoader } from '../components/common';
import { SaveIndicator } from '../components/common/SaveIndicator';
import { AchievementToast, LevelProgressBar, StreakDisplay } from '../components/gamification';
import { ImmersiveHeader } from '@/components/layout';


export default function ExamMode() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const mode = searchParams.get('mode') || 'exam';

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false); // Para desktop
  const [showNavigatorModal, setShowNavigatorModal] = useState(false); // ✅ Para modal móvil
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const { canvasRef, showConfetti } = useConfetti();
  const { setCurrentSubject, addRecentSubject } = useExamStore();

  // ✅ ARREGLO DE SCROLL: Forzar el scroll al inicio al montar
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const {
    questions, config, currentQuestion, currentIndex, answers, reviewedQuestions,
    isLoading, error, isFinished, results, timeRemaining, timerRunning, progress,
    answeredCount, totalQuestions, currentAnswer, isCurrentCorrect,
    isCurrentReviewed, canGoNext, canGoPrevious, saveStatus,
    selectAnswer, nextQuestion, previousQuestion, goToQuestion, toggleReview, finishExam
  } = useExam(subjectId, mode, language);

  const { points, formattedStats, addAnswerXP, addExamXP, recentXPGain, clearRecentXPGain } = usePoints();
  const { recentlyUnlocked, checkAchievements, clearRecentlyUnlocked } = useAchievements();
  const { correctStreak, dailyStreak, handleAnswer, updateDailyStreak, getStreakMultiplier, getStreakMessage } = useStreak();
  const { playCorrect, playIncorrect, playAchievement, playStreak, playExamCompleteSuccess, playExamCompleteFail, playClick } = useSoundContext();

  const handleSelectAnswer = useCallback(async (answerIndex) => {
    if (!currentQuestion) return;
    const question = questions[currentIndex];
    selectAnswer(currentQuestion.id, answerIndex);

    if (mode === 'practice') {
      const isCorrect = answerIndex === question.correct;
      isCorrect ? playCorrect() : playIncorrect();
      const streakData = await handleAnswer(isCorrect);
      if (isCorrect && streakData?.current >= 3) setTimeout(() => playStreak(), 300);

      const xpData = await addAnswerXP(isCorrect, question.difficulty || 'basico', streakData ? streakData.current : 0);
      
      const stats = {
        totalCorrectAnswers: points.totalCorrectAnswers + (isCorrect ? 1 : 0),
        totalWrongAnswers: points.totalWrongAnswers + (!isCorrect ? 1 : 0),
        totalExamsCompleted: points.totalExamsCompleted,
        totalStudySessions: points.totalStudySessions,
        perfectExamsCount: points.perfectExamsCount,
        dailyStreak: dailyStreak.current,
        level: points.level
      };
      const newAchievements = await checkAchievements(stats, { isCorrect, currentStreak: streakData ? streakData.current : 0 });
      if (newAchievements?.length > 0) setTimeout(() => playAchievement(), 500);

      setCurrentFeedback({
        question: question.question, userAnswer: question.options[answerIndex],
        correctAnswer: question.options[question.correct], isCorrect,
        explanation: question.explanation, relatedFlashcard: question.relatedFlashcard,
        xpGained: xpData.totalXP, streakMultiplier: getStreakMultiplier()
      });
      setTimeout(() => { setShowFeedbackModal(true); if (isCorrect) showConfetti(); }, 600);
    }
  }, [currentIndex, questions, currentQuestion, selectAnswer, mode, playCorrect, playIncorrect, handleAnswer, playStreak, addAnswerXP, points, dailyStreak, checkAchievements, playAchievement, getStreakMultiplier, showConfetti]);

  useSwipe(
    () => { if (canGoNext) { playClick(); nextQuestion(); } },
    () => { if (canGoPrevious) { playClick(); previousQuestion(); } },
    null,
    // ✅ ARREGLO DE GESTOS: Quitamos el swipe-down para el navegador, ahora es un botón
    () => {} 
  );

  useEffect(() => {
    if (config) {
      setCurrentSubject({ id: subjectId, name: config.name, icon: config.icon });
      addRecentSubject(subjectId);
    }
  }, [config, subjectId, setCurrentSubject, addRecentSubject]);

  useEffect(() => {
    if (isFinished && results) {
      navigate(`/results/${subjectId}`, { state: { results }, replace: true });
    }
  }, [isFinished, results, navigate, subjectId]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch(e.key) {
        case 'ArrowLeft': e.preventDefault(); if (canGoPrevious) { playClick(); previousQuestion(); } break;
        case 'ArrowRight': e.preventDefault(); if (canGoNext) { playClick(); nextQuestion(); } break;
        case '1': case '2': case '3': case '4':
          if (currentQuestion && currentAnswer === undefined) {
            const optionIndex = parseInt(e.key) - 1;
            if (optionIndex < currentQuestion.options.length) handleSelectAnswer(optionIndex);
          } break;
        case 'm': case 'M': e.preventDefault(); playClick(); toggleReview(); break;
        case 'Enter': e.preventDefault(); if (mode === 'practice' && currentAnswer !== undefined && canGoNext) { playClick(); nextQuestion(); } break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestion, currentAnswer, canGoNext, canGoPrevious, mode, nextQuestion, previousQuestion, toggleReview, playClick, handleSelectAnswer]);

  const handleFinishClick = () => {
    playClick();
    const unanswered = totalQuestions - answeredCount;
    if (unanswered > 0 && mode === 'exam') {
      setShowFinishModal(true);
    } else {
      handleConfirmFinish();
    }
  };

  const handleConfirmFinish = async () => {
    setShowFinishModal(false);
    const examResults = await finishExam();
    if (!examResults) return;
    examResults.passed ? playExamCompleteSuccess() : playExamCompleteFail();
    await updateDailyStreak();
    await addExamXP(examResults);
    
    const finalStats = {
      totalCorrectAnswers: points.totalCorrectAnswers + examResults.correctCount,
      totalWrongAnswers: points.totalWrongAnswers + examResults.incorrectCount,
      totalExamsCompleted: points.totalExamsCompleted + (mode === 'exam' ? 1 : 0),
      totalStudySessions: points.totalStudySessions,
      perfectExamsCount: examResults.score === 100 ? points.perfectExamsCount + (mode === 'exam' ? 1 : 0) : points.perfectExamsCount,
      dailyStreak: dailyStreak.current,
      level: points.level
    };
    const newAchievements = await checkAchievements(finalStats, { examScore: examResults.score, isPerfect: examResults.score === 100 });
    if (newAchievements?.length > 0) setTimeout(() => playAchievement(), 800);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    navigate('/');
  };

  // Componente interno para el navegador (para reutilizar en Modal y Aside)
  const NavigatorContent = () => (
    <div className="space-y-4">
      {typeof QuestionNavigator !== 'undefined' && <QuestionNavigator
        questions={questions} currentIndex={currentIndex} answers={answers}
        reviewedQuestions={reviewedQuestions}
        onGoToQuestion={(index) => {
          playClick();
          goToQuestion(index);
          setShowNavigatorModal(false); // Cerrar modal al seleccionar
        }}
      />}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-2 border-gray-100 dark:border-gray-700 transition-colors duration-300">
        <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
          📊 {t('exam.stats.title')}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('exam.stats.accuracy')}:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400">{formattedStats.accuracy}%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('exam.stats.streak')}:</span>
            <span className="font-bold text-orange-600 dark:text-orange-400">🔥 {dailyStreak.current} {t('exam.stats.days')}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">{t('exam.stats.totalXp')}:</span>
            <span className="font-bold text-purple-600 dark:text-purple-400">✨ {formattedStats.totalXP}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-bounce-in">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('common.error')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button variant="primary" onClick={() => navigate('/')} className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600">
            ← {t('results.actions.home')}
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading) return <SkeletonLoader type="exam-page" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" style={{ width: '100%', height: '100%' }} />
      
      {/* 2. Usar el nuevo Header Inmersivo */}
      <ImmersiveHeader>
        {/* Pasamos los botones de acción como children (rightSlot) */}
        <Button variant="secondary" size="sm" onClick={() => { playClick(); setShowExitModal(true); }} className="hidden sm:flex">
          ← {t('exam.ui.exitBtn')}
        </Button>
        {/* ✅ ARREGLO DE NAVEGADOR MÓVIL: Este botón ahora abre el Modal */}
        <Button variant="secondary" size="sm" onClick={() => { playClick(); setShowNavigatorModal(true); }} className="lg:hidden">
          🗂️ {t('exam.ui.navigator')}
        </Button>
      </ImmersiveHeader>

      <div className="relative">
        {/* 3. Nueva "Cabecera de Contexto" Sticky */}
        <div className="sticky top-16 md:top-20 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b-2 border-gray-200 dark:border-gray-700 shadow-md transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            
            {/* Gamification Header */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <LevelProgressBar
                  level={points.level}
                  currentLevelXP={points.currentLevelXP}
                  xpForNextLevel={points.xpForNextLevel}
                  title={formattedStats.title}
                  icon={formattedStats.icon}
                  color={formattedStats.color}
                  progressPercentage={points.progressPercentage}
                  compact={true}
                />
              </div>
              {/* ✅ ARREGLO i18n: Corregido 'type' hardcodeado */}
              <StreakDisplay current={correctStreak.current} best={correctStreak.best} type={t('gamification.streak.correct')} compact={true} />
            </div>

            {/* Streak Banner */}
            {mode === 'practice' && correctStreak.current >= 3 && getStreakMessage() && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-3 text-center shadow-lg animate-pulse">
                <span className="text-2xl mr-2">{getStreakMessage().emoji}</span>
                <span className="font-bold">{getStreakMessage().text}</span>
                <span className="ml-2 text-sm opacity-90">(×{getStreakMultiplier()} XP)</span>
              </div>
            )}

            {/* Controls Header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{config?.icon || '📚'}</span>
                  <div className="min-w-0">
                    <h1 className="text-lg font-bold text-gray-800 dark:text-white truncate">{config?.name || 'Exam'}</h1>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {mode === 'exam' ? `📝 ${t('exam.modes.exam')}` : `🎯 ${t('exam.modes.practice')}`}
                    </p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-4">
                  <div className="text-sm">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">{answeredCount}</span>
                    <span className="text-gray-500 dark:text-gray-400"> / {totalQuestions}</span>
                  </div>
                  {mode === 'exam' && config?.settings?.timeLimit > 0 && (
                    <div className="flex items-center gap-2 text-sm font-mono">
                      <span>⏱️</span>
                      <span className={timeRemaining < 300 ? 'text-red-600 dark:text-red-400 font-bold' : 'text-gray-700 dark:text-gray-300'}>
                        {Math.floor(timeRemaining / 60)}:{String(timeRemaining % 60).padStart(2, '0')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <div className="hidden lg:block">
                 {typeof SaveIndicator !== 'undefined' && <SaveIndicator status={saveStatus} />}
              </div>
            </div>
            
            {/* Barra de Progreso */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="lg:hidden flex justify-center">
              {typeof SaveIndicator !== 'undefined' && <SaveIndicator status={saveStatus} />}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6">
            <main className="space-y-6">
              <QuestionCard
                question={currentQuestion}
                currentIndex={currentIndex}
                totalQuestions={totalQuestions}
                onSelectAnswer={handleSelectAnswer}
                selectedAnswer={currentAnswer}
                showFeedback={mode === 'practice' && currentAnswer !== undefined}
                mode={mode}
              />
              <NavigationControls
                currentIndex={currentIndex} totalQuestions={totalQuestions}
                onPrevious={() => { playClick(); previousQuestion(); }}
                onNext={() => { playClick(); nextQuestion(); }}
                onToggleReview={() => { playClick(); toggleReview(); }}
                canGoPrevious={canGoPrevious} canGoNext={canGoNext}
                isReviewed={isCurrentReviewed}
                onFinish={handleFinishClick}
                mode={mode}
                // ✅ ARREGLO DE SCROLL: Quitado autoFocus de los botones
              />
              <div className="lg:hidden text-center text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                💡 <strong>Tip:</strong> {t('exam.ui.tipMobile')}
              </div>
            </main>

            {/* ✅ ARREGLO DE NAVEGADOR MÓVIL: El aside ahora es solo para desktop */}
            <aside className="hidden lg:block">
              <div className="sticky top-28 space-y-4"> {/* Ajustado para clemencia (5rem + ~2rem gap) */}
                 <NavigatorContent />
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* ... Modals (Finish, Exit) ... */}
      <Modal isOpen={showFinishModal} onClose={() => setShowFinishModal(false)} title={t('exam.modals.finish.title')} size="md">
        {/* ... contenido del modal ... */}
      </Modal>
      <Modal isOpen={showExitModal} onClose={() => setShowExitModal(false)} title={t('exam.modals.exit.title')} size="md">
        {/* ... contenido del modal ... */}
      </Modal>

      {/* ✅ ARREGLO DE NAVEGADOR MÓVIL: Modal del Navegador */}
      <Modal 
        isOpen={showNavigatorModal} 
        onClose={() => setShowNavigatorModal(false)} 
        title={t('exam.ui.navigator')}
        size="lg"
      >
        <NavigatorContent />
      </Modal>

      {/* ... Atajos, FeedbackCard, Toasts ... */}
      <div className="fixed bottom-4 right-4 hidden md:block">
        {/* ... contenido de atajos ... */}
      </div>
      {showFeedbackModal && currentFeedback && mode === 'practice' && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
           {typeof FeedbackCard !== 'undefined' && <FeedbackCard
            {...currentFeedback}
            onClose={() => {
              setShowFeedbackModal(false);
              setCurrentFeedback(null);
              if (canGoNext) { playClick(); nextQuestion(); }
            }}
            showConfetti={showConfetti}
          />}
        </div>
      )}
      {recentlyUnlocked && <AchievementToast achievement={recentlyUnlocked} onClose={clearRecentlyUnlocked} />}
      {recentXPGain && (
        <div className="fixed bottom-20 right-4 z-50 animate-bounce">
          {/* ... contenido de XP gain ... */}
        </div>
      )}
    </div>
  );
}