import { useState, useEffect } from 'react';
import { dbManager } from '@/lib/indexedDB';

/**
 * Hook para extraer y procesar datos analíticos de IndexedDB
 * Proporciona estadísticas globales y por materia
 */
export function useAnalytics(filters = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadAnalyticsData();
  }, [filters.subjectId, filters.dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Obtener datos de todas las fuentes
      const [userPoints, streaks, achievements, examSessions, stats] = await Promise.all([
        dbManager.getUserPoints(),
        Promise.all([
          dbManager.getStreak('daily'),
          dbManager.getStreak('correct_answers')
        ]),
        getAllAchievements(),
        getAllExamSessions(),
        getFilteredStats(filters)
      ]);

      // Procesar datos
      const analyticsData = {
        // Métricas globales
        global: {
          totalXP: userPoints.totalXP,
          level: userPoints.level,
          currentLevelXP: userPoints.currentLevelXP,
          xpForNextLevel: dbManager.calculateLevel(userPoints.totalXP).xpForNextLevel,
          totalCorrectAnswers: userPoints.totalCorrectAnswers,
          totalWrongAnswers: userPoints.totalWrongAnswers,
          totalExamsCompleted: userPoints.totalExamsCompleted,
          totalStudySessions: userPoints.totalStudySessions,
          streakDaily: streaks[0].current,
          streakBest: Math.max(streaks[0].best, streaks[1].best),
          achievementsUnlocked: achievements.length
        },

        // Métricas de exámenes
        exams: processExamSessions(examSessions, filters),

        // Estadísticas históricas
        history: processHistoricalStats(stats),

        // Por materia
        bySubject: groupBySubject(examSessions),

        // Datos para gráficos
        charts: prepareChartData(examSessions, stats),

        // Últimos exámenes
        recentExams: getRecentExams(examSessions, 10),

        // Metadata
        lastUpdated: Date.now(),
        filters: filters
      };

      setData(analyticsData);
    } catch (err) {
      console.error('Error loading analytics:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Método para refrescar datos
  const refresh = () => {
    loadAnalyticsData();
  };

  return {
    data,
    loading,
    error,
    refresh
  };
}

// ==========================================
// FUNCIONES DE PROCESAMIENTO
// ==========================================

/**
 * Obtener todas las sesiones de examen
 */
async function getAllExamSessions() {
  await dbManager.ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = dbManager.db.transaction(['examSessions'], 'readonly');
    const store = transaction.objectStore('examSessions');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Obtener todos los logros desbloqueados
 */
async function getAllAchievements() {
  await dbManager.ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = dbManager.db.transaction(['achievements'], 'readonly');
    const store = transaction.objectStore('achievements');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Obtener estadísticas filtradas
 */
async function getFilteredStats(filters) {
  if (filters.dateRange) {
    const { start, end } = filters.dateRange;
    return await dbManager.getStatsByDateRange(start, end);
  }
  
  if (filters.subjectId) {
    return await dbManager.getStatsBySubject(filters.subjectId);
  }

  // Sin filtros, obtener todo
  await dbManager.ensureDB();
  return new Promise((resolve, reject) => {
    const transaction = dbManager.db.transaction(['stats'], 'readonly');
    const store = transaction.objectStore('stats');
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Procesar sesiones de examen
 */
function processExamSessions(sessions, filters) {
  // Aplicar filtros
  let filtered = [...sessions];
  
  if (filters.subjectId) {
    filtered = filtered.filter(s => s.subjectId === filters.subjectId);
  }
  
  if (filters.dateRange) {
    const startTime = new Date(filters.dateRange.start).getTime();
    const endTime = new Date(filters.dateRange.end).getTime();
    filtered = filtered.filter(s => s.timestamp >= startTime && s.timestamp <= endTime);
  }

  if (filtered.length === 0) {
    return {
      totalExams: 0,
      averageScore: 0,
      totalTime: 0,
      averageTime: 0,
      passRate: 0,
      totalCorrect: 0,
      totalIncorrect: 0
    };
  }

  // Calcular métricas
  const totalExams = filtered.length;
  const totalScore = filtered.reduce((sum, exam) => sum + (exam.score || 0), 0);
  const totalTime = filtered.reduce((sum, exam) => sum + (exam.timeSpent || 0), 0);
  const passed = filtered.filter(exam => exam.score >= (exam.passingScore || 70)).length;
  const totalCorrect = filtered.reduce((sum, exam) => sum + (exam.correctAnswers || 0), 0);
  const totalIncorrect = filtered.reduce((sum, exam) => sum + (exam.totalQuestions - exam.correctAnswers || 0), 0);

  return {
    totalExams,
    averageScore: totalScore / totalExams,
    totalTime,
    averageTime: totalTime / totalExams,
    passRate: (passed / totalExams) * 100,
    totalCorrect,
    totalIncorrect
  };
}

/**
 * Procesar estadísticas históricas
 */
function processHistoricalStats(stats) {
  if (stats.length === 0) return [];

  // Agrupar por fecha
  const byDate = stats.reduce((acc, stat) => {
    const date = stat.date;
    if (!acc[date]) {
      acc[date] = {
        date,
        exams: 0,
        totalScore: 0,
        totalTime: 0,
        correct: 0,
        incorrect: 0
      };
    }
    
    acc[date].exams++;
    acc[date].totalScore += stat.score || 0;
    acc[date].totalTime += stat.timeSpent || 0;
    acc[date].correct += stat.correctAnswers || 0;
    acc[date].incorrect += stat.incorrectAnswers || 0;
    
    return acc;
  }, {});

  // Convertir a array y ordenar por fecha
  return Object.values(byDate).sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );
}

/**
 * Agrupar datos por materia
 */
function groupBySubject(sessions) {
  const bySubject = sessions.reduce((acc, exam) => {
    const subject = exam.subjectId || 'unknown';
    
    if (!acc[subject]) {
      acc[subject] = {
        subjectId: subject,
        subjectName: exam.subjectName || subject,
        exams: 0,
        totalScore: 0,
        totalTime: 0,
        correct: 0,
        incorrect: 0,
        passed: 0
      };
    }
    
    acc[subject].exams++;
    acc[subject].totalScore += exam.score || 0;
    acc[subject].totalTime += exam.timeSpent || 0;
    acc[subject].correct += exam.correctAnswers || 0;
    acc[subject].incorrect += (exam.totalQuestions - exam.correctAnswers) || 0;
    
    if (exam.score >= (exam.passingScore || 70)) {
      acc[subject].passed++;
    }
    
    return acc;
  }, {});

  // Calcular promedios
  return Object.values(bySubject).map(subject => ({
    ...subject,
    averageScore: subject.totalScore / subject.exams,
    averageTime: subject.totalTime / subject.exams,
    passRate: (subject.passed / subject.exams) * 100
  }));
}

/**
 * Preparar datos para gráficos
 */
function prepareChartData(sessions, stats) {
  // Ordenar por fecha
  const sorted = [...sessions].sort((a, b) => a.timestamp - b.timestamp);

  // Datos para gráfico de rendimiento temporal
  const performanceData = sorted.map(exam => ({
    date: new Date(exam.timestamp).toLocaleDateString('es-ES', { 
      month: 'short', 
      day: 'numeric' 
    }),
    score: exam.score || 0,
    timestamp: exam.timestamp
  }));

  // Datos para gráfico de distribución
  const totalCorrect = sessions.reduce((sum, exam) => sum + (exam.correctAnswers || 0), 0);
  const totalIncorrect = sessions.reduce((sum, exam) => 
    sum + ((exam.totalQuestions - exam.correctAnswers) || 0), 0
  );

  const distributionData = {
    correct: totalCorrect,
    incorrect: totalIncorrect,
    percentage: totalCorrect + totalIncorrect > 0 
      ? (totalCorrect / (totalCorrect + totalIncorrect)) * 100 
      : 0
  };

  // Datos por materia
  const bySubject = groupBySubject(sessions);

  return {
    performance: performanceData,
    distribution: distributionData,
    bySubject: bySubject
  };
}

/**
 * Obtener exámenes recientes
 */
function getRecentExams(sessions, limit = 10) {
  return [...sessions]
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .map(exam => ({
      sessionId: exam.sessionId,
      subjectId: exam.subjectId,
      subjectName: exam.subjectName,
      score: exam.score,
      totalQuestions: exam.totalQuestions,
      correctAnswers: exam.correctAnswers,
      timeSpent: exam.timeSpent,
      timestamp: exam.timestamp,
      date: new Date(exam.timestamp).toLocaleDateString('es-ES'),
      passed: exam.score >= (exam.passingScore || 70)
    }));
}

export default useAnalytics;