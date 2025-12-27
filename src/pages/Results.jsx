import { useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, Button } from '@/components/common';
import { useSoundContext } from '@/context/SoundContext';
import { dbManager } from '@/lib/indexedDB';
import { useLanguage } from '@/context/LanguageContext';
import { ImmersiveHeader } from '@/components/layout';
// ✅ IMPORTANTE: Menú de ajustes
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
        // Lógica de XP
        const xpPerCorrect = 10;
        const bonusXP = sessionData.passed ? 50 : 0;
        const totalXP = (results.correctAnswers * xpPerCorrect) + bonusXP;
        await dbManager.addXP(totalXP, 'Examen completado');
        
        // Actualizar estadísticas globales
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 transition-colors duration-300">
      
      {/* ✅ HEADER FIXED: Usamos showControls={false} para limpiar y ponemos el engrane manualmente */}
      <ImmersiveHeader showControls={false}>
         <div className="flex items-center gap-2">
            {/* Menú de Ajustes Limpio */}
            <MobileSettingsMenu />
         </div>
      </ImmersiveHeader>
      
      <div className="max-w-4xl mx-auto px-4 py-8 lg:py-12">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-8xl mb-6"
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 1, repeat: 3 }}
          >
            {passed ? '🎉' : '📚'}
          </motion.div>
          <h1 className={`text-4xl font-bold mb-4 transition-colors duration-300 ${
            passed 
              ? 'bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-400 dark:to-emerald-400' 
              : 'bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-400 dark:to-red-400'
          } bg-clip-text text-transparent`}>
            {passed ? t('results.success') : t('results.fail')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 transition-colors duration-300 px-4">
            {results.subjectName}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-8 mb-8 bg-white/80 dark:bg-gray-800/50 backdrop-blur-md border-2 border-white/50 dark:border-white/10 shadow-2xl">
            <div className="text-center">
              <div className="text-7xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent transition-colors duration-300">
                {results.score.toFixed(0)}%
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 transition-colors duration-300 font-medium tracking-wide uppercase text-xs opacity-70">
                {t('results.scoreLabel')}
              </p>
              
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="bg-green-50/50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200/50 dark:border-green-700/30 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {results.correctAnswers}
                  </div>
                  <div className="text-[10px] lg:text-xs font-bold uppercase text-green-600/70 dark:text-green-400/70 mt-1">
                    {t('results.stats.correct')}
                  </div>
                </div>
                
                <div className="bg-red-50/50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200/50 dark:border-red-700/30 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {results.totalQuestions - results.correctAnswers}
                  </div>
                  <div className="text-[10px] lg:text-xs font-bold uppercase text-red-600/70 dark:text-red-400/70 mt-1">
                    {t('results.stats.incorrect')}
                  </div>
                </div>
                
                <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-700/30 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 font-mono">
                    {Math.floor(results.timeSpent / 60)}:{(results.timeSpent % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-[10px] lg:text-xs font-bold uppercase text-blue-600/70 dark:text-blue-400/70 mt-1">
                    {t('results.stats.time')}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="w-full space-y-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={handleReviewClick}
            className="w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:via-indigo-700 hover:to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all transform active:scale-[0.98] flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🔍</span>
            <span>{t('results.actions.review')}</span>
          </button>

          <div className="grid grid-cols-2 gap-3">
{/* ✅ CORRECCIÓN CRÍTICA: !bg-transparent fuerza la transparencia */}
            <Button
                variant="outline"
                onClick={handleHomeClick}
                className="h-14 !bg-transparent border-2 border-white/20 dark:border-white/20 text-gray-800 dark:text-white hover:bg-white/10 transition-colors font-bold text-sm backdrop-blur-md"
            >
                🏠 {t('results.actions.home')}
            </Button>
            
            <Button
                variant="primary"
                onClick={handleRetryClick}
                className="h-14 bg-blue-600 hover:bg-blue-700 text-white border-0 font-bold text-sm shadow-md"
            >
                🔄 {t('results.actions.retry')}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}