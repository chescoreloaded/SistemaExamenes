import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useChartData } from '@/hooks/useChartData';
import { useLanguage } from '@/context/LanguageContext';
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
  const { data: rawData, loading, error } = useAnalytics();
  
  const [filters, setFilters] = useState({ subjectId: null, dateRange: null });
  const [currentSubjects, setCurrentSubjects] = useState([]);

  // Cargar materias actuales para traducción
  useEffect(() => {
    const loadSubjects = async () => {
      const data = await getSubjects(language);
      setCurrentSubjects(data || []);
    };
    loadSubjects();
  }, [language]);

  // Filtrar y procesar datos
  const filteredData = useMemo(() => {
    if (!rawData) return null;

    let filteredExams = [...rawData.recentExams];

    // Aplicar filtros
    if (filters.subjectId) {
      filteredExams = filteredExams.filter(exam => exam.subjectId === filters.subjectId);
    }
    if (filters.dateRange) {
      const startDate = new Date(filters.dateRange.start).getTime();
      const endDate = new Date(filters.dateRange.end).getTime();
      filteredExams = filteredExams.filter(exam => exam.timestamp >= startDate && exam.timestamp <= endDate);
    }

    // Traducir nombres
    const translatedRecentExams = filteredExams.map(exam => {
      const subject = currentSubjects.find(s => s.id === exam.subjectId);
      return {
        ...exam,
        subjectName: subject ? subject.name : exam.subjectName
      };
    });

    if (translatedRecentExams.length === 0) {
      return {
        ...rawData,
        exams: { totalExams: 0, totalCorrect: 0, totalIncorrect: 0, averageScore: 0, passRate: 0, totalTimeSpent: 0, averageTimePerExam: 0 },
        recentExams: [],
        charts: { performance: { labels: [], scores: [] }, distribution: { correct: 0, incorrect: 0, percentage: 0 }, bySubject: { labels: [], scores: [], counts: [] } }
      };
    }

    // Recalcular métricas
    const totalCorrect = translatedRecentExams.reduce((sum, e) => sum + e.correctAnswers, 0);
    const totalIncorrect = translatedRecentExams.reduce((sum, e) => sum + e.incorrectAnswers, 0);
    const avgScore = translatedRecentExams.reduce((sum, e) => sum + e.score, 0) / translatedRecentExams.length;
    const passedCount = translatedRecentExams.filter(e => e.passed).length;

    // Datos gráficos
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
        passRate: (passedCount / translatedRecentExams.length) * 100,
        totalTimeSpent: translatedRecentExams.reduce((sum, e) => sum + e.timeSpent, 0),
        averageTimePerExam: translatedRecentExams.reduce((sum, e) => sum + e.timeSpent, 0) / translatedRecentExams.length
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

  // Estado sin datos (pero con filtros activos o no)
  if (!filteredData || filteredData.exams.totalExams === 0) {
    const isFiltered = filters.subjectId || filters.dateRange;
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">📊 {t('analytics.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{isFiltered ? t('analytics.noData.titleFiltered') : t('analytics.subtitle')}</p>
        </div>

        {rawData && rawData.exams.totalExams > 0 && (
          <FilterBar onFilterChange={handleFilterChange} subjects={subjectsForFilter} className="mb-8" />
        )}

        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center border-2 border-dashed border-gray-200 dark:border-gray-700">
          <div className="text-7xl mb-4">📉</div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            {isFiltered ? t('analytics.noData.titleFiltered') : t('analytics.noData.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {isFiltered ? t('analytics.noData.subtitleFiltered') : t('analytics.noData.subtitle')}
          </p>
          {isFiltered ? (
            <button onClick={() => setFilters({ subjectId: null, dateRange: null })} className="px-6 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg font-semibold">
              {t('analytics.filters.clear')}
            </button>
          ) : (
            <button onClick={() => navigate('/')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold">
              {t('common.home')}
            </button>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2 flex items-center gap-3">
            📊 {t('analytics.title')}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {t('analytics.subtitle')}
          </p>
        </div>
        <ExportButton analyticsData={filteredData} />
      </div>

      <FilterBar onFilterChange={handleFilterChange} subjects={subjectsForFilter} className="mb-8" />

      {/* Stats Cards */}
      <div id="stats-cards-container" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard icon="🎯" label={t('analytics.stats.totalExams')} value={filteredData.exams.totalExams} subtitle={`${filteredData.exams.totalCorrect} ${t('gamification.streak.correct')}`} color="blue" />
        <StatsCard icon="⭐" label={t('analytics.stats.averageScore')} value={`${Math.round(filteredData.exams.averageScore)}%`} subtitle={filteredData.exams.averageScore >= 70 ? t('gamification.streak.messages.daily.great') : t('results.fail')} color="purple" />
        <StatsCard icon="🔥" label={t('gamification.streak.currentTitle')} value={filteredData.global.streakDaily} subtitle={`${t('gamification.streak.best')}: ${filteredData.global.streakBest}`} color="orange" />
        <StatsCard icon="🏆" label={t('gamification.level.level')} value={filteredData.global.level} subtitle={`${filteredData.global.currentLevelXP}/${filteredData.global.xpForNextLevel} XP`} color="green" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2">
          <PerformanceChart data={chartData.performance.data} id="chart-performance" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <SubjectChart data={chartData.subject.data} id="chart-subject" />
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <DistributionChart data={chartData.distribution.data} id="chart-distribution" />
        </motion.div>
      </div>

      <HistoryTable recentExams={filteredData.recentExams} />
    </div>
  );
}

function formatDateShort(timestamp, language = 'es') {
  const date = new Date(timestamp);
  const locale = language === 'en' ? 'en-US' : 'es-ES';
  return date.toLocaleDateString(locale, { day: 'numeric', month: 'short' });
}