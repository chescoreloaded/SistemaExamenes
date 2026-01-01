import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useChartData } from '@/hooks/useChartData';
import { useLanguage } from '@/context/LanguageContext';
import { useTheme } from '@/context/ThemeContext';
import { getSubjects } from '@/services/subjectsService';
import {
  StatsCard,
  FilterBar,
  ExportButton,
  PerformanceChart,
  SubjectChart,
  DistributionChart,
  HistoryTable
} from '@/components/analytics';

export default function Analytics() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  // ✅ Obtenemos el tema global
  const { isDark } = useTheme(); 
  
  const { data: rawData, loading, error } = useAnalytics();
  
  const [filters, setFilters] = useState({ subjectId: null, dateRange: null });
  const [currentSubjects, setCurrentSubjects] = useState([]);

  useEffect(() => {
    const loadSubjects = async () => {
      const data = await getSubjects(language);
      setCurrentSubjects(data || []);
    };
    loadSubjects();
  }, [language]);

  const filteredData = useMemo(() => {
    if (!rawData) return null;

    let filteredExams = [...rawData.recentExams];

    // Filtros
    if (filters.subjectId) {
      filteredExams = filteredExams.filter(exam => exam.subjectId === filters.subjectId);
    }
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.start).getTime();
      const endDate = new Date(filters.dateRange.end).getTime();
      filteredExams = filteredExams.filter(exam => exam.timestamp >= startDate && exam.timestamp <= endDate);
    }

    // Traducción de nombres de materias
    const translatedRecentExams = filteredExams.map(exam => {
      const subject = currentSubjects.find(s => s.id === exam.subjectId);
      return {
        ...exam,
        subjectName: subject ? subject.name : exam.subjectName
      };
    });

    // Manejo de estado vacío filtrado
    if (translatedRecentExams.length === 0) {
      return {
        ...rawData,
        exams: { totalExams: 0, totalCorrect: 0, totalIncorrect: 0, averageScore: 0, passRate: 0, totalTimeSpent: 0, averageTimePerExam: 0 },
        recentExams: [],
        charts: { performance: { labels: [], scores: [] }, distribution: { correct: 0, incorrect: 0, percentage: 0 }, bySubject: { labels: [], scores: [], counts: [] } }
      };
    }

    // Cálculos de estadísticas
    const totalCorrect = translatedRecentExams.reduce((sum, e) => sum + e.correctAnswers, 0);
    const totalIncorrect = translatedRecentExams.reduce((sum, e) => sum + e.incorrectAnswers, 0);
    const avgScore = translatedRecentExams.reduce((sum, e) => sum + e.score, 0) / translatedRecentExams.length;
    
    // Preparación de datos para gráficas
    const sortedByTime = [...translatedRecentExams].sort((a, b) => a.timestamp - b.timestamp);
    const performanceData = {
      labels: sortedByTime.map(e => formatDateShort(e.timestamp, language)),
      scores: sortedByTime.map(e => e.score),
      totalExams: sortedByTime.length
    };

    const bySubject = {};
    translatedRecentExams.forEach(exam => {
      if (!bySubject[exam.subjectId]) {
        bySubject[exam.subjectId] = { subjectName: exam.subjectName, scores: [], count: 0 };
      }
      bySubject[exam.subjectId].scores.push(exam.score);
      bySubject[exam.subjectId].count++;
    });

    const subjectData = {
      labels: Object.values(bySubject).map(s => s.subjectName),
      scores: Object.values(bySubject).map(s => s.scores.reduce((a, b) => a + b, 0) / s.scores.length),
      counts: Object.values(bySubject).map(s => s.count)
    };

    return {
      ...rawData,
      exams: {
        totalExams: translatedRecentExams.length,
        totalCorrect,
        totalIncorrect,
        averageScore: avgScore,
        passRate: 0, 
        totalTimeSpent: 0,
        averageTimePerExam: 0
      },
      recentExams: translatedRecentExams.sort((a, b) => b.timestamp - a.timestamp),
      charts: { performance: performanceData, distribution: { correct: totalCorrect, incorrect: totalIncorrect, percentage: avgScore }, bySubject: subjectData }
    };
  }, [rawData, filters, language, currentSubjects]);

  const chartData = useChartData(filteredData);
  const handleFilterChange = (newFilters) => setFilters(newFilters);

  const subjectsForFilter = useMemo(() => {
    if (currentSubjects.length > 0) {
      return currentSubjects.map(s => ({ id: s.id, name: s.name, icon: s.icon }));
    }
    if (!rawData?.recentExams) return [];
    const unique = {};
    rawData.recentExams.forEach(exam => {
      if (!unique[exam.subjectId]) unique[exam.subjectId] = { id: exam.subjectId, name: exam.subjectName, icon: '📖' };
    });
    return Object.values(unique);
  }, [currentSubjects, rawData]);

  if (loading) return <div className="flex items-center justify-center h-[50vh]"><div className="text-2xl animate-bounce">📊</div></div>;

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh] p-4">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('common.error')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold">
            {t('common.retry')}
          </button>
        </div>
      </div>
    );
  }

  // UI cuando no hay datos tras filtrar
  if (!filteredData || filteredData.exams.totalExams === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
              📊 {t('analytics.title')}
            </h1>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              {t('analytics.subtitle')}
            </p>
          </div>
          <ExportButton analyticsData={filteredData} />
        </div>
        <FilterBar onFilterChange={handleFilterChange} subjects={subjectsForFilter} className="mb-10" />
        
        <div id="stats-cards-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            <StatsCard icon="🎯" label={t('analytics.stats.totalExams')} value={0} color="blue" />
            <StatsCard icon="⭐" label={t('analytics.stats.averageScore')} value="0%" color="purple" />
            <StatsCard icon="🔥" label={t('gamification.streak.currentTitle')} value={0} color="orange" />
            <StatsCard icon="🏆" label={t('gamification.level.level')} value={1} color="green" />
        </div>
        
        <div className="text-center py-20 bg-white/50 dark:bg-gray-800/50 rounded-3xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300">{t('analytics.noData.titleFiltered')}</h3>
            <p className="text-gray-500 dark:text-gray-400">{t('analytics.noData.subtitleFiltered')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
            📊 {t('analytics.title')}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            {t('analytics.subtitle')}
          </p>
        </div>
        <ExportButton analyticsData={filteredData} />
      </div>

      <FilterBar onFilterChange={handleFilterChange} subjects={subjectsForFilter} className="mb-10" />

      {/* Tarjetas de Estadísticas */}
      <div id="stats-cards-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        <StatsCard icon="🎯" label={t('analytics.stats.totalExams')} value={filteredData.exams.totalExams} subtitle={`${filteredData.exams.totalCorrect} ${t('gamification.streak.correct')}`} color="blue" />
        <StatsCard icon="⭐" label={t('analytics.stats.averageScore')} value={`${Math.round(filteredData.exams.averageScore)}%`} subtitle={filteredData.exams.averageScore >= 70 ? "¡Buen trabajo!" : "Sigue practicando"} color="purple" />
        <StatsCard icon="🔥" label={t('gamification.streak.currentTitle')} value={filteredData.global.streakDaily} subtitle={`${t('gamification.streak.best')}: ${filteredData.global.streakBest}`} color="orange" />
        <StatsCard icon="🏆" label={t('gamification.level.level')} value={filteredData.global.level} subtitle={`${filteredData.global.currentLevelXP} / ${filteredData.global.xpForNextLevel} XP`} color="green" />
      </div>

      {/* Gráficas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          {/* ✅ Gráfica de Rendimiento conectada */}
          <PerformanceChart 
             data={chartData.performance.data} 
             isDark={isDark} 
             id="chart-performance" 
             key={isDark ? 'dark-perf' : 'light-perf'} 
          />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          {/* ✅ Gráfica de Materias con el FIX de los dos puntos aplicado */}
          <SubjectChart 
             data={chartData.subject.data} 
             isDark={isDark} 
             id="chart-subject" 
             key={isDark ? 'dark-subj' : 'light-subj'} 
          />
        </motion.div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          {/* ✅ Gráfica de Distribución conectada */}
          <DistributionChart 
             data={chartData.distribution.data} 
             isDark={isDark} 
             id="chart-distribution" 
             key={isDark ? 'dark-dist' : 'light-dist'} 
          />
        </motion.div>
      </div>

      <div className="mb-12">
          <HistoryTable recentExams={filteredData.recentExams} />
      </div>
    </div>
  );
}

function formatDateShort(timestamp, language = 'es') {
  const date = new Date(timestamp);
  const locale = language === 'en' ? 'en-US' : 'es-ES';
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}