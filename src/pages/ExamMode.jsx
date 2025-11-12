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
import { Loading, Modal, Button as CommonButton, SkeletonLoader } from '../components/common';
import { SaveIndicator } from '../components/common/SaveIndicator';
import { AchievementToast, LevelProgressBar, StreakDisplay } from '../components/gamification';
import { ImmersiveHeader } from '@/components/layout';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ExamStats from '@/components/exam/ExamStats';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";


export default function ExamMode() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const mode = searchParams.get('mode') || 'exam';

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showNavigatorModal, setShowNavigatorModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const { canvasRef, showConfetti } = useConfetti();
  const { setCurrentSubject, addRecentSubject } = useExamStore();

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
      };
      const newAchievements = await checkAchievements(stats, { isCorrect, currentStreak: streakData ? streakData.current : 0 });
      if (newAchievements?.length > 0) setTimeout(() => playAchievement(), 500);

      setCurrentFeedback({
        question: question.question, userAnswer: question.options[answerIndex],
        correctAnswer: question.options[question.correct], isCorrect,
        explanation: question.explanation, relatedFlashcard: question.relatedFlashcard,
        xpGained: xpData.totalXP, streakMultiplier: getStreakMultiplier()
      });
      window.scrollTo(0, 0);
      setTimeout(() => { setShowFeedbackModal(true); if (isCorrect) showConfetti(); }, 600);
    }
  }, [currentIndex, questions, currentQuestion, selectAnswer, mode, playCorrect, playIncorrect, handleAnswer, playStreak, addAnswerXP, points, dailyStreak, checkAchievements, playAchievement, getStreakMultiplier, showConfetti]);

  useSwipe(
    () => { if (canGoNext) { playClick(); nextQuestion(); } },
    () => { if (canGoPrevious) { playClick(); previousQuestion(); } },
    null,
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
    
    const finalStats = {};
    const newAchievements = await checkAchievements(finalStats, { examScore: examResults.score, isPerfect: examResults.score === 100 });
    if (newAchievements?.length > 0) setTimeout(() => playAchievement(), 800);
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    navigate('/');
  };

  /**
   * Un componente que renderiza el navegador y las pestañas.
   * Lo usamos tanto en el Modal (móvil) como en el Sheet (desktop).
   */
  const TabbedNavigation = () => (
    <Tabs defaultValue="navigator" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="navigator">🗂️ {t('common.navigator')}</TabsTrigger>
        <TabsTrigger value="stats">📊 {t('common.stats')}</TabsTrigger>
      </TabsList>
      
      <TabsContent value="navigator" className="mt-4">
        <QuestionNavigator
          questions={questions}
          currentIndex={currentIndex}
          answers={answers}
          reviewedQuestions={reviewedQuestions}
          onGoToQuestion={(index) => {
            playClick();
            goToQuestion(index);
          }}
        />
      </TabsContent>
      
      <TabsContent value="stats" className="mt-4">
         <ExamStats
          formattedStats={formattedStats}
          dailyStreak={dailyStreak}
          correctStreak={correctStreak}
        />
      </TabsContent>
    </Tabs>
  );

  if (error) {
    return (
      <div className="min-h-screen ...">
        {/* ... JSX de Error ... */}
      </div>
    );
  }

  if (isLoading) return <SkeletonLoader type="exam-page" />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 overflow-x-hidden">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" style={{ width: '100%', height: '100%' }} />
      
      <ImmersiveHeader>
        {/* Botón Salir (usa 'Button' de shadcn) */}
        <Button variant="secondary" size="sm" onClick={() => { playClick(); setShowExitModal(true); }} className="hidden sm:flex">
          ← {t('exam.ui.exitBtn')}
        </Button>
        
        {/* Botón Navegador Móvil (Ahora es un DialogTrigger) */}
        <Dialog open={showNavigatorModal} onOpenChange={setShowNavigatorModal}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm" className="lg:hidden" onClick={playClick}>
              <span className="text-lg">🗂️</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg p-4 sm:p-6">
            {/* El contenido del modal ya es oscuro/claro y la "X" está arreglada */}
            <TabbedNavigation />
          </DialogContent>
        </Dialog>
      </ImmersiveHeader>

      <div className="relative">
        <div className="sticky top-16 md:top-20 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b-2 border-gray-200 dark:border-gray-700 shadow-md transition-colors duration-300">
          {/* ... (Cabecera de Contexto - sin cambios) ... */}
          <div className="max-w-7xl mx-auto px-4 py-4 space-y-4">
            
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
              <StreakDisplay current={correctStreak.current} best={correctStreak.best} type={t('gamification.streak.correct')} compact={true} />
            </div>

            {mode === 'practice' && correctStreak.current >= 3 && getStreakMessage() && (
              <div className="bg-gradient-to-r from-orange-500 to-red-500 ...">
                {/* ... Streak Banner ... */}
              </div>
            )}

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
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="lg:hidden flex justify-center">
              {typeof SaveIndicator !== 'undefined' && <SaveIndicator status={saveStatus} />}
            </div>
          </div>
        </div>

        {/* ✅ --- INICIO DE CAMBIOS --- */}
        {/* Panel Colapsable de Desktop (Sheet) con "Pestaña de Folder" */}
        <Sheet>
          <SheetTrigger asChild>
            {/* Esta es la nueva "Pestaña de Folder" que reemplaza al botón flotante */}
            <div
              className="hidden lg:flex items-center justify-center
                         fixed top-1/2 -translate-y-1/PERCENTR right-0 z-40
                         h-36 w-10 px-1 py-4
                         bg-card border-l border-t border-b border-border 
                         rounded-l-lg shadow-lg cursor-pointer
                         hover:bg-accent transition-colors group"
              aria-label={t('common.navigationAndStats')}
            >
              <span className="[writing-mode:vertical-rl] text-sm font-medium tracking-wide text-foreground group-hover:text-accent-foreground flex items-center gap-2">
                <span className="text-base">🗂️</span>
                {t('common.navigator')}
              </span>
            </div>
          </SheetTrigger>
          <SheetContent className="w-[380px] p-0 overflow-y-auto" side="right">
            {/* La "X" aquí ahora está arreglada gracias al PASO 1 */}
            <div className="p-6">
              <TabbedNavigation />
            </div>
          </SheetContent>
        </Sheet>
        {/* ✅ --- FIN DE CAMBIOS --- */}
        
        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 gap-6">
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
              />
              <div className="lg:hidden text-center text-sm text-gray-600 dark:text-gray-400 bg-blue-100 dark:bg-blue-900/30 rounded-lg p-3">
                💡 <strong>Tip:</strong> {t('exam.ui.tipMobile')}
              </div>
            </main>
          </div>
        </div>
      </div>

      {/* Modales de Salir/Terminar (Usando tu Modal y CommonButton) */}
      <Modal isOpen={showFinishModal} onClose={() => setShowFinishModal(false)} title={t('exam.modals.finish.title')} size="md">
        <div className="text-gray-700 dark:text-gray-300">
          <p>{t('exam.modals.finish.body', { count: totalQuestions - answeredCount })}</p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <CommonButton variant="secondary" onClick={() => setShowFinishModal(false)}>
            {t('common.cancel')}
          </CommonButton>
          <CommonButton variant="primary" className="bg-gradient-to-r from-red-500 to-pink-500" onClick={handleConfirmFinish}>
            {t('common.finish')}
          </CommonButton>
        </div>
      </Modal>
      
      <Modal isOpen={showExitModal} onClose={() => setShowExitModal(false)} title={t('exam.modals.exit.title')} size="md">
         <div className="text-gray-700 dark:text-gray-300">
          <p>{mode === 'exam' ? t('exam.modals.exit.examWarning') : t('exam.modals.exit.practiceWarning')}</p>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <CommonButton variant="secondary" onClick={() => setShowExitModal(false)}>
            {t('common.cancel')}
          </CommonButton>
          <CommonButton variant="primary" className="bg-gradient-to-r from-red-500 to-pink-500" onClick={handleConfirmExit}>
            {t('common.exit')}
          </CommonButton>
        </div>
      </Modal>

      {/* ... Atajos, FeedbackCard, Toasts ... */}
      <div className="fixed bottom-4 right-4 hidden md:block">
        <div className="bg-gray-900/90 dark:bg-gray-800/90 text-white text-xs rounded-lg p-3 shadow-xl max-w-xs">
          <div className="font-bold mb-2">⌨️ {t('exam.shortcuts.title')}:</div>
          <div className="space-y-1 text-gray-300 dark:text-gray-400">
            <div>← → : {t('exam.shortcuts.nav')}</div>
            <div>1-4 : {t('exam.shortcuts.select')}</div>
            <div>M : {t('exam.shortcuts.mark')}</div>
            <div>Enter : {t('exam.shortcuts.confirm')} (Practice)</div>
          </div>
        </div>
      </div>
      
      {showFeedbackModal && currentFeedback && mode === 'practice' && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
           {typeof FeedbackCard !== 'undefined' && <FeedbackCard
            {...currentFeedback}
            onClose={() => {
              window.scrollTo(0, 0);
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
           <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
            + {recentXPGain} XP ✨
          </div>
        </div>
      )}
    </div>
  );
}