// src/pages/Results.jsx
import { useEffect, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Card, Button } from '@/components/common';
import { useSoundContext } from '@/context/SoundContext';
import { dbManager } from '@/lib/indexedDB';
import { useLanguage } from '@/context/LanguageContext';
import { ImmersiveHeader } from '@/components/layout';

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

  const breadcrumbItems = [
    { label: t('common.home'), href: '/', icon: '🏠' },
    { label: results.subjectName, href: '/', icon: '📚' },
    { label: t('results.breadcrumb'), icon: '📊' }
  ];

  const handleReviewClick = () => { playClick(); navigate(`/review/${subjectId}`, { state: { results } }); };
  const handleHomeClick = () => { playClick(); navigate('/'); };
  const handleRetryClick = () => { playClick(); navigate(`/exam/${subjectId}?mode=exam`); };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 transition-colors duration-300">
      
      {/* ✅ 2. Usar el nuevo Header Inmersivo flexible */}
      <ImmersiveHeader
        leftSlot={
          <Breadcrumbs 
            items={breadcrumbItems} 
            // Clases para asegurar que el texto sea visible sobre el fondo blur
            className="bg-transparent border-none p-0 shadow-none [&_a]:text-gray-800 dark:[&_a]:text-gray-200 [&_span]:text-gray-800 dark:[&_span]:text-gray-200" 
          />
        }
        // No pasamos children (rightSlot), así que solo mostrará los HeaderControls
      />
      
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
                {results.score.toFixed(1)}%
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-lg mb-6 transition-colors duration-300">
                {t('results.scoreLabel')}
              </p>
              
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="bg-green-50/50 dark:bg-green-900/20 p-4 rounded-xl border border-green-200/50 dark:border-green-700/30 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {results.correctAnswers}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                    {t('results.stats.correct')}
                  </div>
                </div>
                <div className="bg-red-50/50 dark:bg-red-900/20 p-4 rounded-xl border border-red-200/50 dark:border-red-700/30 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {results.totalQuestions - results.correctAnswers}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                    {t('results.stats.incorrect')}
                  </div>
                </div>
                <div className="bg-blue-50/50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-200/50 dark:border-blue-700/30 backdrop-blur-sm">
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                    {Math.floor(results.timeSpent / 60)}:{(results.timeSpent % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-xs lg:text-sm text-gray-600 dark:text-gray-300">
                    {t('results.stats.time')}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={handleReviewClick}
            className="w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 dark:from-purple-600 dark:via-indigo-600 dark:to-blue-600 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 dark:hover:from-purple-700 dark:hover:via-indigo-700 dark:hover:to-blue-700 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🔍</span>
            <span>{t('results.actions.review')}</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>

        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            variant="outline"
            onClick={handleHomeClick}
            className="px-8 py-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-white dark:hover:bg-gray-800 transition-colors"
          >
            ← {t('results.actions.home')}
          </Button>
          <Button
            variant="primary"
            onClick={handleRetryClick}
            className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600 hover:from-blue-600 hover:to-indigo-600 dark:hover:from-blue-700 dark:hover:to-indigo-700 transition-all duration-300"
          >
            🔄 {t('results.actions.retry')}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}