import { useEffect, useState, useCallback, useRef, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import confetti from 'canvas-confetti';
import { Howler } from 'howler'; 
import Lottie from 'lottie-react'; // ✅ Importamos Lottie

// --- HOOKS ---
import { useExam } from '../hooks/useExam';
import { useSwipe } from '../hooks/useSwipe';
import { useExamStore } from '../store/examStore';
import { usePoints } from '../hooks/usePoints';
import { useAchievements } from '../hooks/useAchievements';
import { useStreak } from '../hooks/useStreak';
import { useSoundContext } from '../context/SoundContext';
import { useLanguage } from '../context/LanguageContext';
import { calculateLevel } from '../utils/xpCalculator';

// --- COMPONENTS ---
import { QuestionNavigator, FeedbackCard } from '../components/exam';
import QuestionCard from '../components/exam/QuestionCard';
import ExamStats from '@/components/exam/ExamStats';
import { GamificationHUDLottie } from '../components/gamification/GamificationHUDLottie'; 
import { Loading, Modal, Button as CommonButton, SkeletonLoader } from '../components/common';
import { SaveIndicator } from '../components/common/SaveIndicator';
import { ImmersiveHeader } from '@/components/layout';
import MobileSettingsMenu from '@/components/layout/MobileSettingsMenu';

// --- UI LIB ---
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger, 
  SheetTitle,        
  SheetDescription   
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// --- 💎 ASSETS DE RECOMPENSA (Nombres Estandarizados) ---
import bioMatterAnim from '@/assets/lottie/bio-matter.json';
import dataShardAnim from '@/assets/lottie/data-shard.json';
import plasmaCoreAnim from '@/assets/lottie/plasma-core.json';
import quantumCubeAnim from '@/assets/lottie/quantum-cube.json';
import solarIsotopeAnim from '@/assets/lottie/solar-isotope.json';

export default function ExamMode() {
  const { subjectId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const mode = searchParams.get('mode') || 'exam';

  // --- ESTADOS DE MODALES ---
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  
  // 🎁 ESTADOS DE RECOMPENSA
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [rewardTier, setRewardTier] = useState(1); 

  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [isMobileNavigatorOpen, setIsMobileNavigatorOpen] = useState(false);

  // 🔒 CONTROL DE BLOQUEO
  const isProcessing = useRef(false);
  
  // 🎵 CONTROL DE AUDIO SESIÓN
  const sessionStreak = useRef(0);

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
  
  const { correctStreak, dailyStreak, handleAnswer, updateDailyStreak, getStreakMultiplier, resetStreak } = useStreak();
  
  const soundContext = useSoundContext();
  const { playStreak, playCorrect, playIncorrect, playExamCompleteSuccess, playExamCompleteFail, playClick } = soundContext;
  const playAchievement = soundContext.playAchievement || playStreak; 

  const userLevel = calculateLevel(points || 0).level;

  // --- EFECTOS DE INICIO ---
  useEffect(() => {
    if (Howler.ctx && Howler.ctx.state === 'suspended') {
        try { Howler.ctx.resume(); } catch(e) { console.warn(e); }
    }
    // Reiniciar racha al entrar en modo práctica (Clean Slate)
    if (mode === 'practice' && resetStreak) {
        resetStreak();
    }
    sessionStreak.current = 0;
    return () => {
       sessionStreak.current = 0;
       Howler.volume(localStorage.getItem('soundVolume') || 0.5); 
    };
  }, []); 

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  // --- CONFETTI ---
  const fireConfetti = useCallback(() => {
    const count = 200;
    const defaults = { origin: { y: 0.7 }, zIndex: 9999, gravity: 1.2, scalar: 1.2 };
    function fire(particleRatio, opts) {
      confetti({ ...defaults, ...opts, particleCount: Math.floor(count * particleRatio) });
    }
    fire(0.25, { spread: 26, startVelocity: 55 });
    fire(0.2, { spread: 60 });
    fire(0.35, { spread: 100, decay: 0.91, scalar: 0.8 });
    fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
    fire(0.1, { spread: 120, startVelocity: 45 });
  }, []);

  // --- 🎁 MANEJADORES DE RECOMPENSA (PUSH YOUR LUCK) ---
  
  // 1. Click en el cofre del HUD
  const handleChestClick = useCallback((tier) => {
      playClick();
      playAchievement();
      fireConfetti();

      setRewardTier(tier); // Guardamos el nivel actual para mostrar la animación correcta
      setShowRewardModal(true);
  }, [playClick, playAchievement, fireConfetti]);

  // 2. Usuario decide COBRAR el premio (Se reinicia la racha)
  const handleClaimReward = useCallback(() => {
      playClick();
      // Aquí iría la lógica futura de "Agregar item al inventario"
      
      if (resetStreak) resetStreak(); // Reiniciamos ciclo para que pueda ganar otro
      setShowRewardModal(false);
  }, [playClick, resetStreak]);

  // 3. Usuario decide ARRIESGARSE (Cierra modal, mantiene racha)
  const handleRiskIt = useCallback(() => {
      playClick();
      setShowRewardModal(false);
  }, [playClick]);

  // --- 🎨 MAPPING VISUAL DE RECOMPENSAS (LOTTIE) ---
const rewardVisuals = useMemo(() => {
      switch(rewardTier) {
          case 5: return { 
              // BIO MATTER (ADN)
              title: t('gamification.rewards.emerald_bio'),
              animation: bioMatterAnim, 
              bgGradient: 'from-slate-900 via-indigo-900 to-slate-900',
              border: 'border-indigo-500/50',
              btn: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/50',
              glow: 'shadow-[0_0_60px_rgba(99,102,241,0.6)]',
              textColor: 'text-indigo-300',
              lottieStyle: {} // Sin cambios
          };
          case 4: return { 
              // SOLAR ISOTOPE (SOL)
              title: t('gamification.rewards.gold_isotope'),
              animation: solarIsotopeAnim,
              bgGradient: 'from-orange-50 to-white dark:from-orange-950/40',
              border: 'border-orange-500/20',
              btn: 'bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-white shadow-orange-500/50',
              glow: 'shadow-[0_0_50px_rgba(249,115,22,0.6)]',
              textColor: 'text-orange-500',
              lottieStyle: { transform: 'scale(1.1)' } // Un poquito más grande
          };
          case 3: return { 
              // PLASMA CORE (ESFERA)
              title: t('gamification.rewards.red_core'),
              animation: plasmaCoreAnim,
              bgGradient: 'from-fuchsia-50 to-white dark:from-fuchsia-950/40',
              border: 'border-fuchsia-500/20',
              btn: 'bg-fuchsia-600 hover:bg-fuchsia-500 text-white shadow-fuchsia-500/50',
              glow: 'shadow-[0_0_40px_rgba(217,70,239,0.5)]',
              textColor: 'text-fuchsia-500',
              lottieStyle: { transform: 'scale(1.2)' } // Ajuste de escala para igualar impacto
          };
          case 2: return { 
              // QUANTUM CUBE (CUBO) - 🛠️ AJUSTE CRÍTICO DE COLOR Y TAMAÑO
              title: t('gamification.rewards.purple_cube'),
              animation: quantumCubeAnim,
              bgGradient: 'from-violet-50 to-white dark:from-violet-950/40',
              border: 'border-violet-500/20',
              btn: 'bg-violet-600 hover:bg-violet-500 text-white shadow-violet-500/40',
              glow: 'shadow-[0_0_30px_rgba(139,92,246,0.4)]',
              textColor: 'text-violet-400',
              // 🔥 TRUCO CSS: Rotamos 180 grados el color (Verde -> Morado) y aumentamos tamaño
              lottieStyle: { 
                  filter: 'hue-rotate(180deg) saturate(1.5)', 
                  transform: 'scale(1.4)' 
              }
          };
          default: return { 
              // DATA SHARD (CRISTAL)
              title: t('gamification.rewards.blue_shard'),
              animation: dataShardAnim,
              bgGradient: 'from-emerald-50 to-white dark:from-emerald-950/40', 
              border: 'border-emerald-500/20',
              btn: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/40',
              glow: 'shadow-[0_0_30px_rgba(16,185,129,0.4)]',
              textColor: 'text-emerald-400',
              lottieStyle: { transform: 'scale(1.1)' }
          };
      }
  }, [rewardTier, t]);

  // --- LÓGICA DE RESPUESTA ---
  const handleSelectAnswer = useCallback(async (answerIndex) => {
    if (!currentQuestion) return;
    if ((currentAnswer !== undefined && mode === 'practice') || isProcessing.current) return;

    isProcessing.current = true;

    const question = questions[currentIndex];
    selectAnswer(currentQuestion.id, answerIndex);

    if (mode === 'practice') {
      const isCorrect = answerIndex === question.correct;
      
      playClick(); 

      // Cálculos de racha local vs global
      const currentGlobalValue = typeof correctStreak === 'object' && correctStreak !== null
          ? (correctStreak.current ?? 0)
          : Number(correctStreak) || 0;
      
      const nextGlobalStreak = isCorrect ? currentGlobalValue + 1 : 0;

      // Audio Streak
      if (isCorrect) {
          sessionStreak.current += 1;
      } else {
          sessionStreak.current = 0;
      }

      if (isCorrect && nextGlobalStreak >= 3) {
          setTimeout(() => playStreak(), 400); 
      }

      // Persistencia
      handleAnswer(isCorrect); 
      addAnswerXP(isCorrect, question.difficulty || 'basico', nextGlobalStreak);
      checkAchievements({}, { isCorrect, currentStreak: nextGlobalStreak });

      // Feedback
      setCurrentFeedback({
        question: question.question, userAnswer: question.options[answerIndex],
        correctAnswer: question.options[question.correct], isCorrect,
        explanation: question.explanation, relatedFlashcard: question.relatedFlashcard,
        xpGained: isCorrect ? 10 : 0, 
        streakMultiplier: isCorrect && nextGlobalStreak >= 2 ? 1.5 : 1
      });
      
      setTimeout(() => { 
          if (isCorrect) {
              playCorrect(sessionStreak.current); 
          } else {
              playIncorrect();
          }

          setShowFeedbackModal(true); 
          
          if (isCorrect) {
             setTimeout(() => fireConfetti(), 200); 
          }
          
          isProcessing.current = false;
      }, 150); 

    } else {
        isProcessing.current = false;
    }
  }, [currentIndex, questions, currentQuestion, selectAnswer, mode, handleAnswer, playCorrect, playIncorrect, playStreak, addAnswerXP, points, checkAchievements, getStreakMultiplier, fireConfetti, currentAnswer, correctStreak]);

  // --- GESTOS Y TECLADO ---
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
        case 'Enter': e.preventDefault(); 
            if (showFeedbackModal) {
                 playClick();
                 setShowFeedbackModal(false);
                 setCurrentFeedback(null);
                 isProcessing.current = false; 
                 if (canGoNext) { nextQuestion(); }
            } else if (showRewardModal) {
                 // Enter en modal de recompensa: Cobra el premio
                 handleClaimReward();
            } else if (mode === 'practice' && currentAnswer !== undefined && canGoNext) { 
                playClick(); nextQuestion(); 
            } 
            break;
        case 'Escape': 
            e.preventDefault(); 
            if (showFeedbackModal) setShowFeedbackModal(false);
            else if (showRewardModal) setShowRewardModal(false); // Escape: Cierra sin cobrar (arriesgar)
            else setShowExitModal(true); 
            break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentQuestion, currentAnswer, canGoNext, canGoPrevious, mode, nextQuestion, previousQuestion, toggleReview, playClick, handleSelectAnswer, showFeedbackModal, showRewardModal, handleClaimReward]);

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
    checkAchievements({}, { examScore: examResults.score, isPerfect: examResults.score === 100 });
  };

  const formatTime = (seconds) => {
    if (seconds === undefined || seconds === null) return "00:00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

  const safeTime = timeRemaining ?? (config?.settings?.timeLimit ? config.settings.timeLimit * 60 : 0);
  const isUrgent = safeTime < 300 && timeRemaining !== null; 

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50 dark:bg-gray-950 transition-colors duration-300 overflow-hidden">
      
      <ImmersiveHeader showControls={false}>
        <div className="hidden sm:block"><SaveIndicator status={saveStatus} /></div>
        
        <Sheet open={isMobileNavigatorOpen} onOpenChange={setIsMobileNavigatorOpen}>
          <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800">
                  <span className="text-lg">🗂️</span>
              </Button>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 [&>button]:hidden flex flex-col gap-0 border-t-0">
              <SheetTitle className="hidden">Navegador de Preguntas</SheetTitle>
              <SheetDescription className="hidden">
                  Panel para navegar entre las preguntas del examen.
              </SheetDescription>
              <ExamSidePanel onClose={() => setIsMobileNavigatorOpen(false)} />
          </SheetContent>
        </Sheet>

        <MobileSettingsMenu onExit={() => setShowExitModal(true)} />

        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setShowExitModal(true)}
          className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 ml-1"
        >
          <span className="text-xl">✕</span>
        </Button>
      </ImmersiveHeader>

      <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 py-3 shadow-sm z-30">
         <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
               <span className="text-2xl flex-shrink-0">{config?.icon}</span>
               <div className="min-w-0">
                  <h2 className="text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">
                    {config?.name}
                  </h2>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                     <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                        {t('common.question')} {currentIndex + 1}
                     </span>
                     <span className="text-gray-300">|</span>
                     <span>{t('common.total')} {totalQuestions}</span>
                  </div>
               </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto mt-1 sm:mt-0">
                {mode === 'exam' && (
                  <div className={`
                      flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-bold border transition-colors min-w-[90px] justify-center
                      ${isUrgent
                          ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700'}
                  `}>
                      <span>⏱️</span>
                      {formatTime(safeTime)}
                  </div>
                )}
                
                <div className={`flex items-center gap-2 flex-1 sm:flex-none sm:w-32 ${mode === 'practice' ? 'hidden sm:flex' : ''}`}>
                   <div className="h-2 flex-1 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden border border-gray-100 dark:border-gray-700">
                      <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${progress}%` }} />
                   </div>
                   <span className="text-xs font-bold text-gray-400">{Math.round(progress)}%</span>
                </div>
            </div>
         </div>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-0 sm:px-4 flex flex-col items-center relative min-h-0 overflow-y-auto custom-scrollbar">
          
          {/* ✅ HUD GAMIFICADO conectado al Modal de Recompensa */}
          <div className="w-full px-4 pt-4 pb-2">
             <GamificationHUDLottie 
                streak={typeof correctStreak === 'object' ? (correctStreak.current || 0) : Number(correctStreak) || 0} 
                level={userLevel} 
                onChestClick={handleChestClick}
             />
          </div>

          <div className="w-full px-4 sm:px-0">
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

      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 p-4 z-30 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
         <div className="max-w-3xl mx-auto">
            <div className="grid grid-cols-5 gap-3 h-14">
                <Button 
                    onClick={() => { playClick(); previousQuestion(); }} 
                    disabled={!canGoPrevious} 
                    variant="outline" 
                    className="col-span-2 h-full rounded-2xl border-2 border-gray-200 dark:border-gray-700 text-gray-500 hover:text-indigo-600 hover:border-indigo-200 bg-white dark:bg-gray-800 disabled:opacity-40 p-0 flex items-center justify-center gap-2"
                >
                    <span className="text-xl">←</span>
                    <span className="text-sm font-bold">{t('common.back')}</span>
                </Button>

                <Button 
                    onClick={() => { playClick(); toggleReview(); }}
                    className={`col-span-1 h-full rounded-2xl border-2 font-bold transition-all p-0 flex flex-col items-center justify-center
                      ${isCurrentReviewed 
                        ? "bg-yellow-50 border-yellow-400 text-yellow-700 shadow-sm dark:bg-yellow-900/20 dark:border-yellow-600 dark:text-yellow-400" 
                        : "bg-white border-gray-200 text-gray-500 hover:border-yellow-300 hover:text-yellow-600 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"}
                    `}
                >
                    <span className="text-2xl leading-none mb-0.5">{isCurrentReviewed ? '★' : '☆'}</span>
                </Button>
                
                <Button 
                    onClick={canGoNext ? (() => { playClick(); nextQuestion(); }) : handleFinishClick} 
                    className={`col-span-2 h-full rounded-2xl text-sm font-bold shadow-lg transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2
                        ${canGoNext 
                          ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 dark:shadow-none' 
                          : 'bg-green-600 hover:bg-green-700 text-white shadow-green-200'}
                    `}
                >
                    {canGoNext ? (
                      <>
                        <span>{t('common.next')}</span> 
                        <span className="text-xl">→</span>
                      </>
                    ) : (
                      <>✨ {t('common.finish')}</>
                    )}
                </Button>
            </div>
         </div>
      </div>

      <Modal isOpen={showExitModal} onClose={() => setShowExitModal(false)} showCloseButton={false} title={null} size="sm">
        <div className="p-6 bg-white dark:bg-gray-900 rounded-xl">
            <div className="flex items-start gap-5">
                <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl 
                    ${mode === 'exam' ? 'bg-red-50 dark:bg-red-900/20 text-red-500' : 'bg-amber-50 dark:bg-amber-900/20 text-amber-500'}`}>
                    {mode === 'exam' ? '⛔' : '⏸️'}
                </div>
                <div className="flex-1 pt-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2">
                        {t('exam.modals.exit.title').replace('⚠️', '').trim()}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                        {mode === 'exam' ? t('exam.modals.exit.examWarning') : t('exam.modals.exit.practiceWarning')}
                    </p>
                </div>
            </div>
            <div className="flex justify-end gap-3 mt-8">
                <Button onClick={() => setShowExitModal(false)} variant="ghost" className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800">{t('common.cancel')}</Button>
                <Button onClick={() => { setShowExitModal(false); navigate('/'); }} className={`shadow-sm px-6 text-white ${mode === 'exam' ? 'bg-red-600 hover:bg-red-700' : 'bg-amber-500 hover:bg-amber-600'}`}>{t('common.exit')}</Button>
            </div>
        </div>
      </Modal>

      <Modal isOpen={showFinishModal} onClose={() => setShowFinishModal(false)} showCloseButton={false} title={null} size="sm">
        <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-5">
                <span className="text-3xl filter drop-shadow-sm">🏁</span> 
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('exam.modals.finish.title').replace('⚠️', '').trim()}</h3>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-8">
                {t('exam.modals.finish.body', { count: totalQuestions - answeredCount })}
            </p>
            <div className="flex gap-3 w-full">
                <Button onClick={() => setShowFinishModal(false)} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200 border-0 h-12 rounded-xl">{t('common.cancel')}</Button>
                <Button onClick={handleConfirmFinish} className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-md h-12 rounded-xl">{t('common.finish')}</Button>
            </div>
        </div>
      </Modal>

      {/* 🎁 MODAL DE RECOMPENSA EVOLUTIVA (ANIMADO CON LOTTIE) */}
      <Modal isOpen={showRewardModal} onClose={() => {}} showCloseButton={false} title={null} size="sm">
         <div className={`relative overflow-visible bg-gradient-to-b ${rewardVisuals.bgGradient} rounded-2xl p-6 text-center border-4 ${rewardVisuals.border} transition-all duration-500`}>
             
             {/* Fondo de luz ambiental */}
             <div className={`absolute top-0 left-0 right-0 h-48 bg-gradient-to-b from-white/20 to-transparent pointer-events-none opacity-50`} />
             
             <div className="relative z-10 flex flex-col items-center">
                 
                 {/* 🎥 LOTTIE CONTAINER */}
                 <div className={`w-40 h-40 mb-2 flex items-center justify-center relative`}>
                     {/* Glow trasero */}
                     <div className={`absolute inset-0 rounded-full blur-3xl opacity-60 ${rewardVisuals.glow} animate-pulse`} />
                     
                     {/* La Animación Lottie */}
                     <div className="relative z-10 w-full h-full drop-shadow-2xl filter hover:scale-110 transition-transform duration-300 cursor-pointer" onClick={() => fireConfetti()} style={rewardVisuals.lottieStyle}>
                        <Lottie 
                            animationData={rewardVisuals.animation} 
                            loop={true} 
                            autoplay={true}
                        />
                     </div>
                 </div>
                 
                 <h3 className={`text-2xl font-black ${rewardVisuals.textColor} mb-1 uppercase tracking-wide drop-shadow-sm`}>
                    {t('gamification.modal.title')}
                 </h3>
                 
                 {/* Nombre del Item Específico */}
                 <div className="mb-4 px-3 py-1 rounded-full bg-white/50 dark:bg-black/20 backdrop-blur-sm border border-black/5 dark:border-white/10 inline-block">
                    <span className={`text-sm font-bold ${rewardVisuals.textColor}`}>
                        {rewardVisuals.title}
                    </span>
                 </div>
                 
                 <p className="text-gray-600 dark:text-gray-300 mb-6 font-medium px-2 text-sm leading-relaxed">
                    {t(`gamification.modal.subtitle_tier_${rewardTier}`)}
                 </p>
                 
                 <div className="w-full flex flex-col gap-3">
                    <Button 
                        onClick={handleClaimReward}
                        className={`w-full py-6 rounded-xl font-black text-lg transform transition-all active:scale-[0.98] hover:scale-[1.02] shadow-xl border-t border-white/20 ${rewardVisuals.btn}`}
                    >
                        {t('gamification.modal.btn_claim')}
                    </Button>

                    {rewardTier < 5 && (
                        <Button
                            onClick={handleRiskIt}
                            variant="ghost"
                            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50 text-xs uppercase tracking-widest font-bold"
                        >
                            🎲 {t('gamification.modal.btn_risk')}
                        </Button>
                    )}
                 </div>
             </div>
         </div>
      </Modal>

      {showFeedbackModal && currentFeedback && mode === 'practice' && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <FeedbackCard {...currentFeedback} onClose={() => { playClick(); setShowFeedbackModal(false); setCurrentFeedback(null); isProcessing.current = false; if (canGoNext) nextQuestion(); }} />
        </div>
      )}

      {recentXPGain && (
        <div className="fixed top-20 right-4 z-[60] animate-in slide-in-from-top-5 fade-in duration-300">
           <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-white/20 ring-4 ring-purple-500/20 backdrop-blur-md">
            <span className="text-lg">✨</span><span className="text-sm">+ {recentXPGain.amount} XP</span>
          </div>
        </div>
      )}
    </div>
  );
}