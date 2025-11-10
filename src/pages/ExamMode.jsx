import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useExam } from '../hooks/useExam';
import { useSwipe } from '../hooks/useSwipe';
import { useExamStore } from '../store/examStore';
import { usePoints } from '../hooks/usePoints';
import { useAchievements } from '../hooks/useAchievements';
import { useStreak } from '../hooks/useStreak';
import { useSoundContext } from '../context/SoundContext';
import { useDarkMode } from '../hooks/useDarkMode';
import { useLanguage } from '../context/LanguageContext'; // ✅ Importar hook
import { useConfetti } from '../hooks/useConfetti';
import {
  QuestionNavigator, NavigationControls, FeedbackCard
} from '../components/exam';
import QuestionCard from '../components/exam/QuestionCard';
import { Loading, Modal, Button, Breadcrumbs, SoundControl, DarkModeToggle, SkeletonLoader } from '../components/common';
import { SaveIndicator } from '../components/common/SaveIndicator';
import { AchievementToast, LevelProgressBar, StreakDisplay } from '../components/gamification';
import HeaderControls from '@/components/layout/HeaderControls';


export default function ExamMode() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage(); // ✅ Usar hook
  const mode = searchParams.get('mode') || 'exam';

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const { canvasRef, showConfetti } = useConfetti();
  const { setCurrentSubject, addRecentSubject } = useExamStore();

  // Hook principal - Asumimos que useExam ya maneja internamente el idioma si fue actualizado,
  // pero si necesita el idioma explícitamente, sería: useExam(subjectId, mode, language);
const {
    questions, config, currentQuestion, currentIndex, answers, reviewedQuestions,
    isLoading, error, isFinished, results, timeRemaining, timerRunning, progress,
    answeredCount, totalQuestions, currentAnswer, isCurrentCorrect,
    isCurrentReviewed, canGoNext, canGoPrevious, saveStatus,
    selectAnswer, nextQuestion, previousQuestion, goToQuestion, toggleReview, finishExam
  } = useExam(subjectId, mode, language); // ✅ ¡IMPORTANTE! Pasar 'language' aquí

  // ... (hooks de gamificación y UX se mantienen igual) ...
  const { points, formattedStats, addAnswerXP, addExamXP, recentXPGain, clearRecentXPGain } = usePoints();
  const { recentlyUnlocked, checkAchievements, clearRecentlyUnlocked } = useAchievements();
  const { correctStreak, dailyStreak, handleAnswer, updateDailyStreak, getStreakMultiplier, getStreakMessage } = useStreak();
  const { playCorrect, playIncorrect, playAchievement, playStreak, playExamCompleteSuccess, playExamCompleteFail, playClick, isMuted, volume, toggleMute, changeVolume, playTest } = useSoundContext();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();

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
      
      // Check achievements...
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

  // ... (useSwipe, useEffects se mantienen igual) ...
  useSwipe(
    () => { if (canGoNext) { playClick(); nextQuestion(); } },
    () => { if (canGoPrevious) { playClick(); previousQuestion(); } },
    null,
    () => setShowNavigator(prev => !prev)
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

  // ... (handleKeyPress se mantiene igual) ...
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

  // ✅ Breadcrumbs traducidos
  const breadcrumbItems = [
    { label: t('common.home'), href: '/', icon: '🏠' },
    { label: config?.name || t('common.subjects'), href: '/', icon: config?.icon || '📚' },
    { label: mode === 'exam' ? t('exam.modes.exam') : t('exam.modes.practice'), icon: mode === 'exam' ? '📝' : '🎯' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" style={{ width: '100%', height: '100%' }} />
      <Breadcrumbs items={breadcrumbItems} />

      <div className="relative">
        {/* Header */}
        <div className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b-2 border-gray-200 dark:border-gray-700 shadow-md transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 py-4">
            {/* Gamification Header */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <StreakDisplay current={correctStreak.current} best={correctStreak.best} type="correct" compact={true} />
            </div>

            {/* Streak Banner */}
            {mode === 'practice' && correctStreak.current >= 3 && getStreakMessage() && (
              <div className="mb-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-3 text-center shadow-lg animate-pulse">
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
                      {/* ✅ Modo traducido */}
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
              <div className="flex items-center gap-2">
                <HeaderControls />
                <div className="h-5 w-px bg-gray-300 dark:bg-gray-700 hidden sm:block ml-1"></div>
                {/* ✅ Botones traducidos */}
                <Button variant="secondary" size="sm" onClick={() => { playClick(); setShowExitModal(true); }} className="hidden sm:flex">
                  ← {t('exam.ui.exitBtn')}
                </Button>
                <Button variant="secondary" size="sm" onClick={() => { playClick(); setShowNavigator(!showNavigator); }} className="lg:hidden">
                  🗂️ {showNavigator ? t('exam.ui.hide') : t('exam.ui.navigator')}
                </Button>
              </div>
            </div>
            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            <div className="lg:hidden mt-2 flex justify-center">
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
              />
              {/* ✅ Tip traducido */}
              <div className="lg:hidden text-center text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                💡 <strong>Tip:</strong> {t('exam.ui.tipMobile')}
              </div>
            </main>

            <aside className={`${showNavigator ? 'block' : 'hidden'} lg:block`}>
              <div className="sticky top-24 space-y-4">
                 {typeof QuestionNavigator !== 'undefined' && <QuestionNavigator
                  questions={questions} currentIndex={currentIndex} answers={answers}
                  reviewedQuestions={reviewedQuestions}
                  onGoToQuestion={(index) => { playClick(); goToQuestion(index); }}
                />}
                {/* ✅ Stats traducidas */}
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
            </aside>
          </div>
        </div>
      </div>

      {/* Modals traducidos */}
      <Modal isOpen={showFinishModal} onClose={() => setShowFinishModal(false)} title={t('exam.modals.finish.title')} size="md">
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            {t('exam.modals.finish.prefix')} <strong>{totalQuestions - answeredCount}</strong> {t('exam.modals.finish.suffix')}
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            {t('exam.modals.finish.confirm')}
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowFinishModal(false)}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={handleConfirmFinish} className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
              {t('exam.modals.finish.btn')}
            </Button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={showExitModal} onClose={() => setShowExitModal(false)} title={t('exam.modals.exit.title')} size="md">
        <div className="space-y-4">
           <p className="text-gray-700 dark:text-gray-300">
             {mode === 'exam' ? t('exam.modals.exit.examWarning') : t('exam.modals.exit.practiceWarning')}
           </p>
           <p className="text-gray-600 dark:text-gray-400">
             {t('exam.modals.exit.confirm')}
           </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowExitModal(false)}>{t('common.cancel')}</Button>
            <Button variant="primary" onClick={handleConfirmExit} className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600">
              {t('exam.modals.exit.btn')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* ✅ Atajos traducidos */}
      <div className="fixed bottom-4 right-4 hidden md:block">
        <div className="bg-gray-900/90 dark:bg-gray-800/90 text-white text-xs rounded-lg p-3 shadow-xl max-w-xs">
          <div className="font-bold mb-2">⌨️ {t('exam.shortcuts.title')}:</div>
          <div className="space-y-1 text-gray-300 dark:text-gray-400">
            <div>← → : {t('exam.shortcuts.nav')}</div>
            <div>1-4 : {t('exam.shortcuts.select')}</div>
            <div>M : {t('exam.shortcuts.mark')}</div>
            {mode === 'practice' && <div>Enter : {t('exam.shortcuts.next')}</div>}
          </div>
        </div>
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
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 border-2 border-green-400 dark:border-green-500">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✨</span>
              <div>
                <div className="font-bold text-green-600 dark:text-green-400 text-lg">+{recentXPGain.amount} XP</div>
                {recentXPGain.reason && <div className="text-xs text-gray-600 dark:text-gray-400">{recentXPGain.reason}</div>}
                {recentXPGain.leveledUp && <div className="text-xs text-purple-600 dark:text-purple-400 font-bold mt-1">⬆️ Level {recentXPGain.newLevel}!</div>}
              </div>
              <button onClick={clearRecentXPGain} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2">✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}