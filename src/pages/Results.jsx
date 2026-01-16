import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Card, Button } from '@/components/common';
import { useSoundContext } from '@/context/SoundContext';
import { useLanguage } from '@/context/LanguageContext';
import { ImmersiveHeader } from '@/components/layout';
import MobileSettingsMenu from '@/components/layout/MobileSettingsMenu';
import { calculateExamCompletionXP, formatXP } from '@/utils/xpCalculator';

// Componente para animar números (CountUp)
const AnimatedCounter = ({ value, duration = 2 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = value;
    if (start === end) return;

    const range = end - start;
    let current = start;
    const increment = end > start ? 1 : -1;
    const stepTime = Math.abs(Math.floor((duration * 1000) / range));
    
    // Si el paso es muy rápido, ajustamos el incremento para mantener el rendimiento
    const safeStepTime = Math.max(stepTime, 20);
    const safeIncrement = safeStepTime === 20 ? Math.ceil(range / (duration * 50)) : increment;

    const timer = setInterval(() => {
      current += safeIncrement;
      if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
        setDisplayValue(end);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, safeStepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

export default function Results() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { playClick, playExamCompleteSuccess, playExamCompleteFail, playStreak } = useSoundContext();

  const results = location.state?.results;
  
  // Calcular XP basado en la lógica real (no hardcoded)
  const xpData = useMemo(() => {
    if (!results) return { totalXP: 0, breakdown: {} };
    return calculateExamCompletionXP(results);
  }, [results]);

  useEffect(() => {
    if (!results) { navigate('/'); return; }
    
    // Sonido inicial
    if (results.passed) {
      playExamCompleteSuccess();
      // Confetti lateral
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#10B981', '#3B82F6', '#F59E0B']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#10B981', '#3B82F6', '#F59E0B']
        });

        if (Date.now() < end) requestAnimationFrame(frame);
      };
      frame();

    } else {
      playExamCompleteFail();
    }
    
    // Sonido de "puntos sumando" a los 1.5s
    const timer = setTimeout(() => {
        if(results.passed) playStreak();
    }, 1500);
    
    return () => clearTimeout(timer);

  }, [results, navigate, playExamCompleteSuccess, playExamCompleteFail, playStreak]);

  if (!results) return null;

  const passed = results.score >= results.passingScore;

  const handleReviewClick = () => { playClick(); navigate(`/review/${subjectId}`, { state: { results } }); };
  const handleHomeClick = () => { playClick(); navigate('/'); };
  const handleRetryClick = () => { playClick(); navigate(`/exam/${subjectId}?mode=exam`); };

  return (
    <div className="min-h-[100dvh] bg-slate-50 dark:bg-gray-950 flex flex-col overflow-hidden">
      
      <ImmersiveHeader showControls={false}>
         <div className="flex items-center gap-2">
            <MobileSettingsMenu />
         </div>
      </ImmersiveHeader>
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 w-full max-w-lg mx-auto pb-safe">
        
        {/* 1. Header Animado */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", damping: 15 }}
          className="mb-6 relative"
        >
            <div className={`w-32 h-32 rounded-full flex items-center justify-center text-7xl shadow-2xl border-4 ${
                passed 
                ? 'bg-gradient-to-br from-green-400 to-emerald-600 border-green-200 text-white' 
                : 'bg-gradient-to-br from-red-400 to-pink-600 border-red-200 text-white'
            }`}>
                {passed ? '🏆' : '😿'}
            </div>
            {/* Badge de Nuevo Nivel (Simulado visualmente por ahora) */}
            {passed && (
                <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} delay={1}
                    className="absolute -bottom-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-full shadow-lg border-2 border-white"
                >
                    LEVEL UP!
                </motion.div>
            )}
        </motion.div>

        {/* 2. Título y Subtítulo */}
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-8"
        >
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-2">
                {passed ? t('results.success') : t('results.fail')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
                {results.subjectName}
            </p>
        </motion.div>

        {/* 3. Card de Stats (Glassmorphism) */}
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="w-full"
        >
            <Card className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-0 shadow-2xl overflow-hidden relative">
                
                {/* Score Big Display */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50" />
                
                <div className="p-8 pb-4 text-center border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-baseline justify-center gap-1">
                        <span className={`text-6xl font-black tracking-tighter ${
                            passed ? 'text-green-600 dark:text-green-400' : 'text-red-500 dark:text-red-400'
                        }`}>
                            <AnimatedCounter value={Math.round(results.score)} />
                        </span>
                        <span className="text-2xl text-gray-400 font-bold">%</span>
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">
                        {t('results.scoreLabel')}
                    </p>
                </div>

                {/* Grid de Detalles */}
                <div className="grid grid-cols-3 divide-x divide-gray-100 dark:divide-gray-800 bg-gray-50/50 dark:bg-black/20">
                    <div className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                            {results.correctAnswers}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-gray-400">{t('results.stats.correct')}</div>
                    </div>
                    <div className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-500 dark:text-red-400 mb-1">
                            {results.totalQuestions - results.correctAnswers}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-gray-400">{t('results.stats.incorrect')}</div>
                    </div>
                    <div className="p-4 text-center">
                        <div className="text-xl font-bold text-indigo-500 dark:text-indigo-400 mb-1 font-mono pt-1">
                            {Math.floor(results.timeSpent / 60)}:{(results.timeSpent % 60).toString().padStart(2, '0')}
                        </div>
                        <div className="text-[10px] uppercase font-bold text-gray-400">{t('results.stats.time')}</div>
                    </div>
                </div>

                {/* XP Gained Strip */}
                {xpData.totalXP > 0 && (
                     <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        transition={{ delay: 1.5 }}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 flex items-center justify-between px-6"
                     >
                        <span className="text-white/90 text-sm font-bold flex items-center gap-2">
                           <span>✨</span> XP Ganado
                        </span>
                        <span className="text-white font-black text-xl flex items-center gap-1">
                           +<AnimatedCounter value={xpData.totalXP} />
                           <span className="text-xs font-normal opacity-70">XP</span>
                        </span>
                     </motion.div>
                )}
            </Card>
        </motion.div>

        {/* 4. Botones de Acción */}
        <motion.div 
            className="w-full mt-8 space-y-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
        >
          <button
            onClick={handleReviewClick}
            className="w-full bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-2 border-gray-200 dark:border-gray-700 hover:border-indigo-500 dark:hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 py-4 rounded-xl font-bold text-lg shadow-sm transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
          >
            <span className="group-hover:scale-110 transition-transform">🔍</span> 
            {t('results.actions.review')}
          </button>

          <div className="grid grid-cols-2 gap-3">
             <Button
                variant="ghost"
                onClick={handleHomeClick}
                className="h-14 rounded-xl text-gray-500 hover:text-gray-900 dark:hover:text-white"
             >
                🏠 {t('results.actions.home')}
             </Button>
            
             <button
                onClick={handleRetryClick}
                className="h-14 rounded-xl font-bold text-white shadow-lg bg-gradient-to-r from-blue-600 to-indigo-600 active:scale-[0.98] transition-transform flex items-center justify-center gap-2"
             >
                🔄 {t('results.actions.retry')}
             </button>
          </div>
        </motion.div>

      </main>
    </div>
  );
}