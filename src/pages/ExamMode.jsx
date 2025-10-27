import { useEffect, useState, useCallback } from 'react'; // Added useCallback
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useExam } from '../hooks/useExam';
import { useSwipe } from '../hooks/useSwipe';
import { useExamStore } from '../store/examStore';

// Hooks de gamificación
import { usePoints } from '../hooks/usePoints';
import { useAchievements } from '../hooks/useAchievements';
import { useStreak } from '../hooks/useStreak';

// Hooks de UX
import { useSoundContext } from '../context/SoundContext'; // Usar contexto
import { useDarkMode } from '../hooks/useDarkMode';

// Componentes
import {
  QuestionNavigator,
  ExamHeader, // Assuming this exists
  NavigationControls,
  FeedbackCard // Assuming this exists
} from '../components/exam';
import QuestionCard from '../components/exam/QuestionCard'; // Use the regular QuestionCard
import { useConfetti } from '../hooks/useConfetti';
import { Loading, Modal, Button, Breadcrumbs, SoundControl, DarkModeToggle, SkeletonLoader } from '../components/common';
import { SaveIndicator } from '../components/common/SaveIndicator'; // Assuming this exists
import {
  AchievementToast,
  LevelProgressBar,
  StreakDisplay
} from '../components/gamification';

// Specific Skeleton (if you have one)
// import { ExamPageSkeleton } from '../components/common'; // Uncomment if it exists

export default function ExamMode() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const mode = searchParams.get('mode') || 'exam'; // 'exam' or 'practice'

  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const { canvasRef, showConfetti } = useConfetti();
  const { setCurrentSubject, addRecentSubject } = useExamStore();

  // Exam hook
  const {
    questions, config, currentQuestion, currentIndex, answers, reviewedQuestions,
    isLoading, error, isFinished, results, timeRemaining, timerRunning, progress,
    answeredCount, totalQuestions, currentAnswer, isCurrentAnswered, isCurrentCorrect,
    isCurrentReviewed, canGoNext, canGoPrevious, saveStatus, isSaving, isSaved, forceSave,
    selectAnswer, nextQuestion, previousQuestion, goToQuestion, toggleReview, finishExam
  } = useExam(subjectId, mode);

  // Gamification hooks
  const {
    points, formattedStats, addAnswerXP, addExamXP, recentXPGain, clearRecentXPGain
  } = usePoints();
  const {
    recentlyUnlocked, checkAchievements, clearRecentlyUnlocked
  } = useAchievements();
  const {
    correctStreak, dailyStreak, handleAnswer, updateDailyStreak, getStreakMultiplier, getStreakMessage
  } = useStreak();

  // UX Hooks
  const {
    playCorrect, playIncorrect, playAchievement, playStreak, // playLevelUp called from usePoints
    playExamCompleteSuccess, playExamCompleteFail, playClick, // New sounds
    isMuted, volume, toggleMute, changeVolume, playTest
  } = useSoundContext();
  const { isDark, toggle: toggleDarkMode } = useDarkMode();

  // --- Handlers ---

  // ✅ DEFINE handleSelectAnswer FIRST
  const handleSelectAnswer = useCallback(async (answerIndex) => {
    // Ensure currentQuestion is available before proceeding
    if (!currentQuestion) {
      console.warn("handleSelectAnswer called but currentQuestion is not available yet.");
      return;
    }
    const question = questions[currentIndex]; // Use questions[currentIndex] for safety

    // 1. Save answer (Always)
    selectAnswer(currentQuestion.id, answerIndex);

    // 2. Gamification and feedback ONLY for practice mode
    if (mode === 'practice') {
      const isCorrect = answerIndex === question.correct;

      // Sound
      if (isCorrect) playCorrect(); else playIncorrect();

      // Streak
      const streakData = await handleAnswer(isCorrect);
      if (isCorrect && streakData && streakData.current >= 3) {
        setTimeout(() => playStreak(), 300);
      }

      // XP (this might now return leveledUp)
      const xpData = await addAnswerXP(
        isCorrect,
        question.difficulty || 'basico', // Use question.difficulty
        streakData ? streakData.current : 0
      );

      // Achievements
      const stats = {
        totalCorrectAnswers: points.totalCorrectAnswers + (isCorrect ? 1 : 0),
        totalWrongAnswers: points.totalWrongAnswers + (!isCorrect ? 1 : 0),
        totalExamsCompleted: points.totalExamsCompleted,
        totalStudySessions: points.totalStudySessions,
        perfectExamsCount: points.perfectExamsCount,
        dailyStreak: dailyStreak.current,
        level: points.level
      };
      const newAchievements = await checkAchievements(stats, {
        isCorrect,
        currentStreak: streakData ? streakData.current : 0
      });
      if (newAchievements && newAchievements.length > 0) {
        setTimeout(() => playAchievement(), 500);
      }
      // Level Up sound handled in usePoints

      // Feedback Modal
      setCurrentFeedback({
        question: question.question, userAnswer: question.options[answerIndex],
        correctAnswer: question.options[question.correct], isCorrect,
        explanation: question.explanation, relatedFlashcard: question.relatedFlashcard,
        xpGained: xpData.totalXP, streakMultiplier: getStreakMultiplier()
      });
      setTimeout(() => {
        setShowFeedbackModal(true);
        if (isCorrect) showConfetti();
      }, 600);
    }
  }, [
    currentIndex, questions, currentQuestion, selectAnswer, mode, playCorrect, playIncorrect,
    handleAnswer, playStreak, addAnswerXP, points, dailyStreak, checkAchievements,
    playAchievement, getStreakMultiplier, showConfetti // Updated dependencies
  ]);


  // Swipe gestures for mobile
  useSwipe(
    () => { if (canGoNext) { playClick(); nextQuestion(); } },
    () => { if (canGoPrevious) { playClick(); previousQuestion(); } },
    null, // Swipe up
    () => setShowNavigator(prev => !prev) // Swipe down
  );

  // Effects
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

  // ✅ THEN, DEFINE the useEffect that USES handleSelectAnswer
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (canGoPrevious) { playClick(); previousQuestion(); }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (canGoNext) { playClick(); nextQuestion(); }
          break;
        case '1': case '2': case '3': case '4':
          // Ensure currentQuestion exists before accessing its properties
          if (currentQuestion && currentAnswer === undefined) { // Check undefined
            const optionIndex = parseInt(e.key) - 1;
            if (optionIndex < currentQuestion.options.length) {
              handleSelectAnswer(optionIndex); // Now it's accessible
            }
          }
          break;
        case 'm': case 'M':
          e.preventDefault();
          playClick();
          toggleReview();
          break;
        case 'Enter':
          e.preventDefault();
          if (mode === 'practice' && currentAnswer !== undefined && canGoNext) { // Check undefined
            playClick();
            nextQuestion();
          }
          break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [
    currentQuestion, currentAnswer, canGoNext, canGoPrevious, mode,
    nextQuestion, previousQuestion, toggleReview, playClick, handleSelectAnswer // Add handleSelectAnswer dependency
  ]);

  const handleFinishClick = () => {
    playClick();
    const unanswered = totalQuestions - answeredCount;
    if (unanswered > 0 && mode === 'exam') { // Only show modal in exam mode
      setShowFinishModal(true);
    } else {
      handleConfirmFinish();
    }
  };

  const handleConfirmFinish = async () => {
    setShowFinishModal(false);

    const examResults = await finishExam();
    if (!examResults) return;

    // Conditional sound
    if (examResults.passed) playExamCompleteSuccess(); else playExamCompleteFail();

    // Update daily streak
    await updateDailyStreak();

    // Add exam XP (no longer returns leveledUp)
    await addExamXP(examResults); // We don't need the result here

    // Check final achievements
    const finalStats = { // Use updated 'points' data + results
      totalCorrectAnswers: points.totalCorrectAnswers + examResults.correctCount,
      totalWrongAnswers: points.totalWrongAnswers + examResults.incorrectCount,
      totalExamsCompleted: points.totalExamsCompleted + (mode === 'exam' ? 1 : 0), // Only count real exams
      totalStudySessions: points.totalStudySessions,
      perfectExamsCount: examResults.score === 100 ? points.perfectExamsCount + (mode === 'exam' ? 1 : 0) : points.perfectExamsCount,
      dailyStreak: dailyStreak.current,
      level: points.level // Use current level
    };
    const newAchievements = await checkAchievements(finalStats, {
      examScore: examResults.score,
      isPerfect: examResults.score === 100
    });
    if (newAchievements && newAchievements.length > 0) {
      setTimeout(() => playAchievement(), 800);
    }
    // Level Up sound handled in usePoints
  };

  const handleConfirmExit = () => {
    setShowExitModal(false);
    navigate('/');
  };

  // --- Rendering ---

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 flex items-center justify-center p-4">
        {/* ... (error code) ... */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-md w-full text-center animate-bounce-in">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
            Error loading exam
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button
            variant="primary"
            onClick={() => navigate('/')}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    );
  }

  // Use generic SkeletonLoader if ExamPageSkeleton doesn't exist
  if (isLoading) {
    return <SkeletonLoader type="exam-page" />; // Adjust 'type' if needed
    // return <ExamPageSkeleton />; // If you have this component
  }

  const breadcrumbItems = [
    { label: 'Inicio', href: '/', icon: '🏠' },
    { label: config?.name || 'Materia', href: '/', icon: config?.icon || '📚' },
    { label: mode === 'exam' ? 'Modo Examen' : 'Modo Práctica', icon: mode === 'exam' ? '📝' : '🎯' }
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
                 {/* Pass necessary props */}
                <LevelProgressBar
                  level={points.level}
                  currentLevelXP={points.currentLevelXP}
                  xpForNextLevel={points.xpForNextLevel}
                  title={formattedStats.title}
                  icon={formattedStats.icon}
                  color={formattedStats.color}
                  progressPercentage={points.progressPercentage} // Make sure this is passed if needed
                  compact={true}
                />
              </div>
              <StreakDisplay
                current={correctStreak.current}
                best={correctStreak.best}
                type="correct"
                compact={true}
              />
            </div>

            {/* Streak Banner (ONLY PRACTICE MODE) */}
            {mode === 'practice' && correctStreak.current >= 3 && getStreakMessage() && (
              <div className="mb-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg p-3 text-center shadow-lg animate-pulse">
                <span className="text-2xl mr-2">{getStreakMessage().emoji}</span>
                <span className="font-bold">{getStreakMessage().text}</span>
                <span className="ml-2 text-sm opacity-90">(×{getStreakMultiplier()} XP)</span>
              </div>
            )}

            {/* Rest of Header (Title, Progress, Controls) */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              {/* Left: Title & Progress */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{config?.icon || '📚'}</span>
                  <div className="min-w-0">
                    <h1 className="text-lg font-bold text-gray-800 dark:text-white truncate">
                      {config?.name || 'Exam'}
                    </h1>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {mode === 'exam' ? '📝 Exam Mode' : '🎯 Practice Mode'}
                    </p>
                  </div>
                </div>
                {/* Progress & Timer (Desktop) */}
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
              {/* Center: SaveIndicator */}
              <div className="hidden lg:block">
                 {/* Conditionally render SaveIndicator if it exists */}
                 {typeof SaveIndicator !== 'undefined' && <SaveIndicator status={saveStatus} />}
              </div>
              {/* Right: Controls */}
              <div className="flex items-center gap-2">
                <SoundControl {...{ isMuted, volume, toggleMute, changeVolume, playTest }} compact />
                <DarkModeToggle {...{ isDark, toggle: toggleDarkMode }} />
                <Button variant="secondary" size="sm" onClick={() => { playClick(); setShowExitModal(true); }} className="hidden sm:flex"> ← Exit </Button>
                <Button variant="secondary" size="sm" onClick={() => { playClick(); setShowNavigator(!showNavigator); }} className="lg:hidden"> 🗂️ {showNavigator ? 'Hide' : 'Navigator'} </Button>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
            {/* Mobile SaveIndicator */}
            <div className="lg:hidden mt-2 flex justify-center">
              {typeof SaveIndicator !== 'undefined' && <SaveIndicator status={saveStatus} />}
            </div>
          </div>
        </div>

        {/* Main Content */}
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
                showFeedback={mode === 'practice' && currentAnswer !== undefined} // Use currentAnswer
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
              <div className="lg:hidden text-center text-sm text-gray-500 dark:text-gray-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                💡 <strong>Tip:</strong> Swipe ← → to navigate, ↓ for navigator
              </div>
            </main>

            {/* Sidebar (Navigator & Stats) */}
            <aside className={`${showNavigator ? 'block' : 'hidden'} lg:block`}>
              <div className="sticky top-24 space-y-4">
                 {/* Conditionally render QuestionNavigator */}
                 {typeof QuestionNavigator !== 'undefined' && <QuestionNavigator
                  questions={questions} currentIndex={currentIndex} answers={answers}
                  reviewedQuestions={reviewedQuestions}
                  onGoToQuestion={(index) => { playClick(); goToQuestion(index); }}
                />}
                {/* Stats Sidebar */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border-2 border-gray-100 dark:border-gray-700 transition-colors duration-300">
                  <h3 className="font-bold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">📊 Statistics</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"> <span className="text-gray-600 dark:text-gray-400">Accuracy:</span> <span className="font-bold text-indigo-600 dark:text-indigo-400">{formattedStats.accuracy}%</span> </div>
                    <div className="flex justify-between"> <span className="text-gray-600 dark:text-gray-400">Daily Streak:</span> <span className="font-bold text-orange-600 dark:text-orange-400">🔥 {dailyStreak.current} days</span> </div>
                    <div className="flex justify-between"> <span className="text-gray-600 dark:text-gray-400">Total XP:</span> <span className="font-bold text-purple-600 dark:text-purple-400">✨ {formattedStats.totalXP}</span> </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* Modals */}
      <Modal isOpen={showFinishModal} onClose={() => setShowFinishModal(false)} title="⚠️ Confirm Submission" size="md">
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            You have <strong>{totalQuestions - answeredCount} unanswered question(s)</strong>.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Are you sure you want to submit the exam?
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowFinishModal(false)}> Cancel </Button>
            <Button variant="primary" onClick={handleConfirmFinish} className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"> Yes, Submit </Button>
          </div>
        </div>
      </Modal>
      <Modal isOpen={showExitModal} onClose={() => setShowExitModal(false)} title="⚠️ Exit Exam" size="md">
        <div className="space-y-4">
           <p className="text-gray-700 dark:text-gray-300">
             {mode === 'exam'
               ? 'If you exit now, your progress will be saved locally, but you cannot resume this exam.'
               : 'If you exit now, your practice progress will be lost.'}
           </p>
           <p className="text-gray-600 dark:text-gray-400">
             Are you sure you want to exit?
           </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowExitModal(false)}> Cancel </Button>
            <Button variant="primary" onClick={handleConfirmExit} className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"> Yes, Exit </Button>
          </div>
        </div>
      </Modal>

      {/* Keyboard Shortcuts Hint */}
      <div className="fixed bottom-4 right-4 hidden md:block">
        <div className="bg-gray-900/90 dark:bg-gray-800/90 text-white text-xs rounded-lg p-3 shadow-xl max-w-xs">
          <div className="font-bold mb-2">⌨️ Keyboard Shortcuts:</div>
          <div className="space-y-1 text-gray-300 dark:text-gray-400">
            <div>← → : Navigate</div>
            <div>1-4 : Select Option</div>
            <div>M : Mark for Review</div>
            {mode === 'practice' && <div>Enter : Next (Practice)</div>}
          </div>
        </div>
      </div>

      {/* Feedback Modal (Practice) */}
      {showFeedbackModal && currentFeedback && mode === 'practice' && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm flex items-center justify-center z-40 p-4">
           {/* Conditionally render FeedbackCard */}
           {typeof FeedbackCard !== 'undefined' && <FeedbackCard
            {...currentFeedback}
            onClose={() => {
              setShowFeedbackModal(false);
              setCurrentFeedback(null);
              if (canGoNext) { playClick(); nextQuestion(); } // Auto-advance if possible
            }}
            showConfetti={showConfetti} // Pass showConfetti if FeedbackCard uses it
          />}
        </div>
      )}

      {/* Achievement Toast */}
      {recentlyUnlocked && (
        <AchievementToast achievement={recentlyUnlocked} onClose={clearRecentlyUnlocked} />
      )}

      {/* XP Gain Notification */}
      {recentXPGain && (
        <div className="fixed bottom-20 right-4 z-50 animate-bounce">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-4 border-2 border-green-400 dark:border-green-500">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✨</span>
              <div>
                <div className="font-bold text-green-600 dark:text-green-400 text-lg">
                  +{recentXPGain.amount} XP
                </div>
                {recentXPGain.reason && (
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {recentXPGain.reason}
                  </div>
                )}
                {recentXPGain.leveledUp && (
                  <div className="text-xs text-purple-600 dark:text-purple-400 font-bold mt-1">
                    ⬆️ Level {recentXPGain.newLevel}!
                  </div>
                )}
              </div>
              <button
                onClick={clearRecentXPGain}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 ml-2"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}