import { useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Button } from '@/components/common';
import { useSoundContext } from '@/context/SoundContext';
import { dbManager } from '@/lib/indexedDB';
import { useLanguage } from '@/context/LanguageContext';
import { ImmersiveHeader } from '@/components/layout';
import MobileSettingsMenu from '@/components/layout/MobileSettingsMenu';

export default function Results() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const results = location.state?.results;
  
  const hasSavedRef = useRef(false);
  const { playExamCompleteSuccess, playExamCompleteFail, playClick } = useSoundContext();

  useEffect(() => {
    if (!results) { navigate('/'); return; }
    const passed = results.score >= results.passingScore;
    if (passed) { playExamCompleteSuccess(); } else { playExamCompleteFail(); }
  }, [results, navigate, playExamCompleteSuccess, playExamCompleteFail]);

  // ... (useEffects de guardado igual que antes) ...
  useEffect(() => {
    const saveExamResults = async () => {
      if (!results || hasSavedRef.current) return;
      hasSavedRef.current = true;
      try {
        const sessionData = {
          sessionId: `exam-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          subjectId: subjectId,
          subjectName: results.subjectName,
          totalQuestions: results.totalQuestions,
          correctAnswers: results.correctAnswers,
          incorrectAnswers: results.totalQuestions - results.correctAnswers,
          timeSpent: results.timeSpent,
          score: results.score,
          completed: true,
          passed: results.score >= results.passingScore,
          answers: results.answers || [],
          timestamp: Date.now()
        };
        await dbManager.saveExamSession(sessionData);
        // ... (resto de lógica igual)
        const xpPerCorrect = 10;
        const bonusXP = sessionData.passed ? 50 : 0;
        const totalXP = (results.correctAnswers * xpPerCorrect) + bonusXP;
        await dbManager.addXP(totalXP, 'Examen completado');
        const currentPoints = await dbManager.getUserPoints();
        await dbManager.updateUserPoints({
          ...currentPoints,
          totalCorrectAnswers: currentPoints.totalCorrectAnswers + results.correctAnswers,
          totalWrongAnswers: currentPoints.totalWrongAnswers + (results.totalQuestions - results.correctAnswers),
          totalExamsCompleted: currentPoints.totalExamsCompleted + 1
        });
        await dbManager.saveStats({
          type: 'exam',
          subjectId: subjectId,
          score: results.score,
          correctAnswers: results.correctAnswers,
          totalQuestions: results.totalQuestions,
          timeSpent: results.timeSpent,
          passed: sessionData.passed
        });
      } catch (error) {
        console.error('❌ Error guardando resultados:', error);
      }
    };
    saveExamResults();
  }, []);

  if (!results) return null;

  const passed = results.score >= results.passingScore;

  const handleReviewClick = () => { playClick(); navigate(`/review/${subjectId}`, { state: { results } }); };
  const handleHomeClick = () => { playClick(); navigate('/'); };
  const handleRetryClick = () => { playClick(); navigate(`/exam/${subjectId}?mode=exam`); };

  return (
    // ✅ Use min-h-screen y flex col para centrar verticalmente si sobra espacio
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 transition-colors duration-300 flex flex-col">
      
      <ImmersiveHeader showControls={false}>
         <div className="flex items-center gap-2">
            <MobileSettingsMenu />
         </div>
      </ImmersiveHeader>
      
      <div className="flex-1 flex flex-col justify-center w-full max-w-4xl mx-auto px-4 py-4">
        <motion.div
          className="text-center mb-4 lg:mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <motion.div
            className="text-6xl lg:text-8xl mb-2"
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 1 }}
          >
            {passed ? '🎉' : '📚'}
          </motion.div>
          <h1 className={`text-2xl lg:text-4xl font-bold mb-1 bg-clip-text text-transparent ${
            passed 
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400' 
              : 'bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400'
          }`}>
            {passed ? t('results.success') : t('results.fail')}
          </h1>
          <p className="text-sm lg:text-xl text-gray-600 dark:text-gray-300 px-2 line-clamp-1">
            {results.subjectName}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mb-4 lg:mb-8"
        >
          {/* ✅ CARD SUPER COMPACTA */}
          <Card className="p-4 lg:p-8 bg-white/80 dark:bg-gray-800/50 backdrop-blur-md border border-white/20 shadow-xl">
            <div className="text-center">
              <div className="text-5xl lg:text-7xl font-bold mb-1 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                {results.score.toFixed(0)}%
              </div>
              <p className="text-[10px] lg:text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">
                {t('results.scoreLabel')}
              </p>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-green-50/50 dark:bg-green-900/20 p-2 rounded-lg border border-green-200/30">
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">
                    {results.correctAnswers}
                  </div>
                  <div className="text-[9px] font-bold uppercase text-green-600/70">
                    {t('results.stats.correct')}
                  </div>
                </div>
                
                <div className="bg-red-50/50 dark:bg-red-900/20 p-2 rounded-lg border border-red-200/30">
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">
                    {results.totalQuestions - results.correctAnswers}
                  </div>
                  <div className="text-[9px] font-bold uppercase text-red-600/70">
                    {t('results.stats.incorrect')}
                  </div>
                </div>
                
                <div className="bg-blue-50/50 dark:bg-blue-900/20 p-2 rounded-lg border border-blue-200/30">
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {Math.floor(results.timeSpent / 60)}:{(results.timeSpent % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-[9px] font-bold uppercase text-blue-600/70">
                    {t('results.stats.time')}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div className="w-full space-y-2">
          <button
            onClick={handleReviewClick}
            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white py-3 px-6 rounded-xl font-bold text-base shadow-lg flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span>🔍</span> {t('results.actions.review')}
          </button>

          <div className="grid grid-cols-2 gap-2">
            <Button
                variant="outline"
                onClick={handleHomeClick}
                className="h-12 !bg-transparent border border-gray-400/30 text-gray-700 dark:text-gray-200 hover:bg-white/10 font-bold text-xs"
            >
                🏠 {t('results.actions.home')}
            </Button>
            
            <Button
                variant="primary"
                onClick={handleRetryClick}
                className="h-12 bg-blue-600 text-white border-0 font-bold text-xs shadow-md"
            >
                🔄 {t('results.actions.retry')}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}