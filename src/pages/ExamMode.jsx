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
import { QuestionNavigator, FeedbackCard } from '../components/exam';
import QuestionCard from '../components/exam/QuestionCard';
import ExamStats from '@/components/exam/ExamStats';
import { Loading, Modal, Button as CommonButton, SkeletonLoader } from '../components/common';
import { SaveIndicator } from '../components/common/SaveIndicator';
import { AchievementToast } from '../components/gamification';
import { ImmersiveHeader } from '@/components/layout';
import { HeaderControls } from '@/components/layout/HeaderControls';
import MobileSettingsMenu from '@/components/layout/MobileSettingsMenu';

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function ExamMode() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const mode = searchParams.get('mode') || 'exam';

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isMobileNavigatorOpen, setIsMobileNavigatorOpen] = useState(false);

  const { canvasRef, showConfetti } = useConfetti();
  const { setCurrentSubject, addRecentSubject } = useExamStore();

  const {
    questions, config, currentQuestion, currentIndex, answers, reviewedQuestions,
    isLoading, error, isFinished, results, timeRemaining, timerRunning, progress,
    answeredCount, totalQuestions, currentAnswer, isCurrentCorrect,
    isCurrentReviewed, canGoNext, canGoPrevious, saveStatus,
    selectAnswer, nextQuestion, previousQuestion, goToQuestion, toggleReview, finishExam
  } = useExam(subjectId, mode, language);

  const { points, formattedStats, addAnswerXP, addExamXP, recentXPGain } = usePoints();
  const { recentlyUnlocked, checkAchievements, clearRecentlyUnlocked } = useAchievements();
  const { correctStreak, dailyStreak, handleAnswer, updateDailyStreak, getStreakMultiplier } = useStreak();
  const { playCorrect, playIncorrect, playAchievement, playStreak, playExamCompleteSuccess, playExamCompleteFail, playClick } = useSoundContext();

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

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
        xpGained: xpData.amount, 
        streakMultiplier: getStreakMultiplier()
      });
      
      setTimeout(() => { setShowFeedbackModal(true); if (isCorrect) showConfetti(); }, 600);
    }
  }, [currentIndex, questions, currentQuestion, selectAnswer, mode, playCorrect, playIncorrect, handleAnswer, playStreak, addAnswerXP, points, checkAchievements, playAchievement, getStreakMultiplier, showConfetti]);

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
  }, [config, subjectId]);

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
        case 'Escape': e.preventDefault(); setShowExitModal(true); break;
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

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const ExamSidePanel = ({ onClose }) => (
    <div className="flex flex-col h-full w-full p-6 bg-background">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
           <span className="text-xl">🗂️</span>
           <h3 className="font-bold text-lg text-foreground">
             {mode === 'exam' ? t('exam.modes.exam') : t('exam.modes.practice')}
           </h3>
        </div>
        <Button variant="ghost" size="icon" onClick={() => { playClick(); if (onClose) onClose(); }} className="h-9 w-9 rounded-full text-foreground hover:bg-destructive/10 hover:text-destructive">
          <span className="text-2xl font-light leading-none">×</span>
        </Button>
      </div>

      <Tabs defaultValue="navigator" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 p-1">
          <TabsTrigger value="navigator">{t('common.navigator')}</TabsTrigger>
          <TabsTrigger value="stats">{t('common.stats')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="navigator" className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2 -mr-2">
          <QuestionNavigator
            questions={questions}
            currentIndex={currentIndex}
            answers={answers}
            reviewedQuestions={reviewedQuestions}
            onGoToQuestion={(index) => {
              playClick();
              goToQuestion(index);
              if (onClose) onClose();
            }}
            variant="sidebar"
          />
        </TabsContent>
        
        <TabsContent value="stats" className="space-y-4 overflow-y-auto custom-scrollbar pr-2">
           <ExamStats
            formattedStats={formattedStats}
            dailyStreak={dailyStreak}
            correctStreak={correctStreak}
            variant="sidebar"
          />
        </TabsContent>
      </Tabs>
    </div>
  );

  if (error) return <div className="h-screen flex items-center justify-center bg-background"><p>{error}</p></div>;
  if (isLoading) return <SkeletonLoader type="exam-page" />;

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 overflow-hidden">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" style={{ width: '100%', height: '100%' }} />
      
      {/* 1. HEADER GLOBAL */}
      <ImmersiveHeader showControls={false}>
        <div className="flex items-center gap-1 sm:gap-2">
            <div className="hidden lg:flex"><HeaderControls /></div>
            
            <Sheet open={isMobileNavigatorOpen} onOpenChange={setIsMobileNavigatorOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden text-foreground">
                    <span className="text-xl">🗂️</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 [&>button]:hidden flex flex-col gap-0 border-t-0">
                    <ExamSidePanel onClose={() => setIsMobileNavigatorOpen(false)} />
                </SheetContent>
            </Sheet>

            <div className="lg:hidden">
              <MobileSettingsMenu onExit={() => setShowExitModal(true)} />
            </div>

            <Button variant="secondary" size="sm" onClick={() => setShowExitModal(true)} className="hidden sm:flex gap-2 ml-2">
               ← {t('common.exit')}
            </Button>
        </div>
      </ImmersiveHeader>

      {/* 2. CONTEXT BAR (Sticky) */}
{/* 2. CONTEXT BAR (Sticky) */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur-md border-b border-border shadow-sm z-30 px-4 py-3">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
             {/* Info Izquierda */}
             <div className="flex items-center gap-2 sm:gap-3 min-w-0 overflow-hidden">
                <span className="text-xl sm:text-2xl flex-shrink-0 filter drop-shadow-sm">{config?.icon || '📚'}</span>
                
                <div className="min-w-0 flex flex-col justify-center">
                    {/* ✅ UX FIX 1: Permitimos 2 líneas de texto para nombres largos (line-clamp-2) */}
                    <h1 className="text-sm font-extrabold text-gray-900 dark:text-white leading-tight line-clamp-2">
                      {config?.name || 'Exam'}
                    </h1>
                    
                    {/* ✅ UX FIX 2: Info visible siempre (quitamos 'hidden') y añadimos Porcentaje */}
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-300 mt-0.5">
                        <span className="hidden xs:inline">{mode === 'exam' ? '📝' : '🎯'}</span>
                        
                        {/* Contador Numérico */}
                        <span>{answeredCount} / {totalQuestions}</span>
                        
                        {/* Separador sutil */}
                        <span className="text-gray-300 dark:text-gray-600">|</span>
                        
                        {/* Porcentaje Explícito */}
                        <span>{Math.round(progress)}%</span>
                    </div>
                </div>
             </div>

             {/* Timer & Save */}
             <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                {mode === 'exam' && config?.settings?.timeLimit > 0 && (
                    <div className={`
                        flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-mono font-bold transition-all border
                        ${timeRemaining < 300 
                            ? 'bg-red-100 text-red-600 border-red-200 animate-pulse' 
                            : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white border-gray-200 dark:border-gray-700'}
                    `}>
                        <span>⏱️</span>
                        {formatTime(timeRemaining)}
                    </div>
                )}
                <div className="hidden lg:block"><SaveIndicator status={saveStatus} /></div>
             </div>
          </div>
          {/* Progress Line */}
          <div className="mt-3 w-full bg-secondary rounded-full h-1 sm:h-1.5 overflow-hidden">
             <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
      </div>

      {/* 3. MAIN AREA */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-0 sm:px-4 flex flex-col items-center relative min-h-0 overflow-y-auto custom-scrollbar">
          <div className="w-full py-4 px-4 sm:px-0">
              <QuestionCard
                question={currentQuestion}
                currentIndex={currentIndex}
                totalQuestions={totalQuestions}
                onSelectAnswer={handleSelectAnswer}
                selectedAnswer={currentAnswer}
                showFeedback={mode === 'practice' && currentAnswer !== undefined}
                mode={mode}
              />
          </div>
      </main>

      {/* 4. FOOTER FIJO (Navegación Simétrica) */}
      <div className="flex-shrink-0 bg-background border-t border-border p-3 pb-6 sm:pb-3 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
         <div className="max-w-3xl mx-auto flex items-center gap-3">
            
            {/* ✅ UX FIX: Botón "Anterior" con fondo claro (no transparente) para contraste */}
            <Button 
                onClick={() => { playClick(); previousQuestion(); }} 
                disabled={!canGoPrevious} 
                variant="outline" 
                className="flex-1 h-12 text-base font-semibold border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
                ← {t('common.back')}
            </Button>

            {/* Botón Central: Marcar */}
            <Button 
                onClick={() => { playClick(); toggleReview(); }}
                variant={isCurrentReviewed ? "default" : "outline"}
                className={`flex-1 h-12 text-base font-semibold transition-colors ${
                  isCurrentReviewed 
                    ? "bg-yellow-500 text-white hover:bg-yellow-600 border-yellow-500 shadow-md" 
                    : "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-foreground"
                }`}
            >
                {isCurrentReviewed ? '★' : '☆'} <span className="ml-1">{t('exam.shortcuts.mark')}</span>
            </Button>
            
            {/* Botón Siguiente/Terminar */}
            {canGoNext ? (
                <Button 
                    onClick={() => { playClick(); nextQuestion(); }} 
                    className="flex-1 h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                >
                    {t('common.next')} →
                </Button>
            ) : (
                <Button 
                    onClick={handleFinishClick} 
                    className="flex-1 h-12 text-base font-bold bg-green-600 hover:bg-green-700 text-white shadow-md shadow-green-500/20"
                >
                    ✨ {t('common.finish')}
                </Button>
            )}
         </div>
      </div>

      {/* 5. SHEET DESKTOP (Lateral) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
           <div className="hidden lg:flex items-center justify-center fixed top-1/2 -translate-y-1/2 right-0 z-40 h-36 w-10 px-1 py-4 bg-card border-l border-y border-border rounded-l-lg shadow-lg cursor-pointer hover:bg-accent hover:w-12 transition-all group">
            <span className="[writing-mode:vertical-rl] text-sm font-medium tracking-wide flex items-center gap-2 group-hover:text-primary">
                <span className="text-base rotate-90">🗂️</span> {t('common.navigator')}
            </span>
          </div>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] p-0 [&>button]:hidden flex flex-col gap-0 border-l border-border">
            <ExamSidePanel onClose={() => setIsSheetOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* --- MODALES --- */}
      
      {/* Salir (Clean Alert) */}
      <Modal isOpen={showExitModal} onClose={() => setShowExitModal(false)} showCloseButton={false} title={null} size="sm">
        <div className="flex flex-col items-center text-center p-3">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-5 ring-8 ring-amber-50 dark:ring-amber-900/10">
                <span className="text-3xl filter drop-shadow-sm">⚠️</span> 
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('exam.modals.exit.title').replace('⚠️', '').trim()}</h3>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-8 leading-relaxed px-4">
                {mode === 'exam' ? t('exam.modals.exit.examWarning') : t('exam.modals.exit.practiceWarning')}
            </p>
            <div className="flex gap-3 w-full">
                <Button onClick={() => setShowExitModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200 border-0">{t('common.cancel')}</Button>
                <Button onClick={() => { setShowExitModal(false); navigate('/'); }} className="flex-1 bg-red-600 hover:bg-red-700 text-white">{t('common.exit')}</Button>
            </div>
        </div>
      </Modal>

      {/* Terminar (Clean Alert) */}
      <Modal isOpen={showFinishModal} onClose={() => setShowFinishModal(false)} showCloseButton={false} title={null} size="sm">
        <div className="flex flex-col items-center text-center p-3">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-5 ring-8 ring-blue-50 dark:ring-blue-900/10">
                <span className="text-3xl filter drop-shadow-sm">🏁</span> 
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('exam.modals.finish.title').replace('⚠️', '').trim()}</h3>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-8 px-2">
                {t('exam.modals.finish.body', { count: totalQuestions - answeredCount })}
            </p>
            <div className="flex gap-3 w-full">
                <Button onClick={() => setShowFinishModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200 border-0">{t('common.cancel')}</Button>
                <Button onClick={handleConfirmFinish} className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-md">{t('common.finish')}</Button>
            </div>
        </div>
      </Modal>

      {/* Feedback (Práctica) */}
      {showFeedbackModal && currentFeedback && mode === 'practice' && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <FeedbackCard
            {...currentFeedback}
            onClose={() => {
              setShowFeedbackModal(false);
              setCurrentFeedback(null);
              if (canGoNext) { playClick(); nextQuestion(); }
            }}
            showConfetti={showConfetti}
          />
        </div>
      )}

{/* ✅ CORRECCIÓN XP: Posición SUPERIOR DERECHA (top-20) */}
      {recentXPGain && (
        <div className="fixed top-20 right-4 z-[60] animate-in slide-in-from-top-5 fade-in duration-300">
           <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-white/20 ring-4 ring-purple-500/20 backdrop-blur-md">
            <span className="text-lg">✨</span> 
            <span className="text-sm">+ {recentXPGain.amount} XP</span>
          </div>
        </div>
      )}
    </div>
  );
}