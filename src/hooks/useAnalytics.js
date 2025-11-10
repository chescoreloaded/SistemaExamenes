import { useState, useEffect } from 'react';
import { dbManager } from '@/lib/indexedDB';

/**
 * Hook de Analytics - Versión Ultra Simple
 * Sin filtros, sin loops, solo datos
 */
export function useAnalytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true; // Prevenir actualizaciones después de desmontar

    const loadAnalyticsData = async () => {
      try {
        console.log('🔍 useAnalytics: Cargando datos...');

        // Obtener todas las sesiones de examen
        const allSessions = await dbManager.getAllExamSessions();
        console.log(`📝 Total sesiones en DB: ${allSessions.length}`);

        // Filtrar sesiones completadas
        const completedSessions = allSessions.filter(s => s.completed);
        console.log(`✅ Sesiones completadas: ${completedSessions.length}`);

        if (!isMounted) return; // Salir si el componente se desmontó

        if (completedSessions.length === 0) {
          console.warn('⚠️ No hay exámenes completados');
          setData(null);
          setLoading(false);
          return;
        }

        // Obtener datos de gamificación
        const userPoints = await dbManager.getUserPoints();
        const dailyStreak = await dbManager.getStreak('daily');
        const correctStreak = await dbManager.getStreak('correct_answers');

        console.log('📊 Procesando datos...');

        // Procesar sesiones
        const processedSessions = completedSessions.map(session => ({
          sessionId: session.sessionId,
          subjectId: session.subjectId,
          subjectName: session.subjectName || 'Sin materia',
          score: session.score,
          correctAnswers: session.correctAnswers,
          incorrectAnswers: session.totalQuestions - session.correctAnswers,
          totalQuestions: session.totalQuestions,
          timeSpent: session.timeSpent,
          timestamp: session.timestamp,
          passed: session.passed,
          date: formatDate(session.timestamp)
        }));

        // Calcular métricas
        const totalCorrect = processedSessions.reduce((sum, s) => sum + s.correctAnswers, 0);
        const totalIncorrect = processedSessions.reduce((sum, s) => sum + s.incorrectAnswers, 0);
        const avgScore = processedSessions.reduce((sum, s) => sum + s.score, 0) / processedSessions.length;
        const passedCount = processedSessions.filter(s => s.passed).length;

        // Construir datos de analytics
        const analyticsData = {
          global: {
            totalXP: userPoints.totalXP,
            level: userPoints.level,
            currentLevelXP: userPoints.currentLevelXP,
            xpForNextLevel: dbManager.calculateLevel(userPoints.totalXP).xpForNextLevel,
            totalCorrectAnswers: userPoints.totalCorrectAnswers,
            totalWrongAnswers: userPoints.totalWrongAnswers,
            totalExamsCompleted: userPoints.totalExamsCompleted,
            totalStudySessions: userPoints.totalStudySessions,
            streakDaily: dailyStreak.current,
            streakBest: Math.max(dailyStreak.best, correctStreak.best),
            achievementsUnlocked: 0
          },

          exams: {
            totalExams: processedSessions.length,
            totalCorrect: totalCorrect,
            totalIncorrect: totalIncorrect,
            averageScore: avgScore,
            passRate: (passedCount / processedSessions.length) * 100,
            totalTimeSpent: processedSessions.reduce((sum, s) => sum + s.timeSpent, 0),
            averageTimePerExam: processedSessions.reduce((sum, s) => sum + s.timeSpent, 0) / processedSessions.length
          },

          bySubject: getStatsBySubject(processedSessions),
          byDate: getStatsByDate(processedSessions),
          
          recentExams: processedSessions
            .sort((a, b) => b.timestamp - a.timestamp)
            .slice(0, 20),

          charts: {
            performance: getPerformanceChartData(processedSessions),
            distribution: {
              correct: totalCorrect,
              incorrect: totalIncorrect,
              percentage: avgScore
            },
            bySubject: getSubjectChartData(processedSessions)
          },

          lastUpdated: Date.now()
        };

        if (!isMounted) return; // Verificar de nuevo antes de actualizar estado

        console.log('✅ Analytics data procesada');
        console.log(`📊 Mostrando ${processedSessions.length} exámenes`);
        
        setData(analyticsData);
        setLoading(false);

      } catch (err) {
        console.error('❌ Error en useAnalytics:', err);
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    loadAnalyticsData();

    // Cleanup: marcar componente como desmontado
    return () => {
      isMounted = false;
    };
  }, []); // Array vacío = solo se ejecuta una vez al montar

  const refresh = () => {
    setLoading(true);
    // Forzar recarga completa
    window.location.reload();
  };

  return { data, loading, error, refresh };
}

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function getStatsBySubject(sessions) {
  const bySubject = {};

  sessions.forEach(session => {
    const id = session.subjectId;
    if (!bySubject[id]) {
      bySubject[id] = {
        subjectId: id,
        subjectName: session.subjectName,
        totalExams: 0,
        totalCorrect: 0,
        totalIncorrect: 0,
        scores: []
      };
    }

    bySubject[id].totalExams++;
    bySubject[id].totalCorrect += session.correctAnswers;
    bySubject[id].totalIncorrect += session.incorrectAnswers;
    bySubject[id].scores.push(session.score);
  });

  return Object.values(bySubject).map(subject => ({
    subjectId: subject.subjectId,
    subjectName: subject.subjectName,
    totalExams: subject.totalExams,
    averageScore: subject.scores.reduce((a, b) => a + b, 0) / subject.scores.length,
    passRate: (subject.scores.filter(s => s >= 70).length / subject.scores.length) * 100
  }));
}

function getStatsByDate(sessions) {
  const byDate = {};

  sessions.forEach(session => {
    const date = formatDate(session.timestamp);
    if (!byDate[date]) {
      byDate[date] = {
        date,
        exams: 0,
        scores: []
      };
    }

    byDate[date].exams++;
    byDate[date].scores.push(session.score);
  });

  return Object.values(byDate).map(day => ({
    date: day.date,
    exams: day.exams,
    averageScore: day.scores.reduce((a, b) => a + b, 0) / day.scores.length
  })).sort((a, b) => new Date(a.date) - new Date(b.date));
}

function getPerformanceChartData(sessions) {
  const sorted = [...sessions].sort((a, b) => a.timestamp - b.timestamp);
  return {
    labels: sorted.map(s => formatDate(s.timestamp, true)),
    scores: sorted.map(s => s.score),
    totalExams: sorted.length
  };
}

function getSubjectChartData(sessions) {
  const bySubject = getStatsBySubject(sessions);
  return {
    labels: bySubject.map(s => s.subjectName),
    scores: bySubject.map(s => s.averageScore),
    counts: bySubject.map(s => s.totalExams)
  };
}

function formatDate(timestamp, short = false) {
  const date = new Date(timestamp);
  if (short) {
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  }
  return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default useAnalytics;