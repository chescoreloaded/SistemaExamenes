import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useChartData } from '@/hooks/useChartData';
import { useDarkMode } from '@/hooks/useDarkMode';
import '@/lib/chartConfig'; // ✅ Importar para registrar componentes de Chart.js

/**
 * Componente de ejemplo para testing de FASE 1
 * Muestra todos los datos y gráficos básicos
 * 
 * INSTRUCCIONES:
 * 1. Importar este componente en tu App.jsx o cualquier ruta
 * 2. Agregar ruta: <Route path="/analytics-test" element={<AnalyticsPreview />} />
 * 3. Navegar a http://localhost:5173/analytics-test
 */
export default function AnalyticsPreview() {
  const { isDark } = useDarkMode();
  const { data, loading, error, refresh } = useAnalytics();
  const charts = useChartData(data);

  // Log para debugging
  useEffect(() => {
    if (data) {
      console.group('📊 ANALYTICS DATA');
      console.log('Global Metrics:', data.global);
      console.log('Exam Stats:', data.exams);
      console.log('By Subject:', data.bySubject);
      console.log('Recent Exams:', data.recentExams);
      console.groupEnd();
    }
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-indigo-950 flex items-center justify-center transition-colors duration-300">
        <div className="text-center">
          <div className="animate-spin text-6xl mb-4">⚙️</div>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Cargando datos de analytics...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-50 dark:from-gray-900 dark:to-red-950 flex items-center justify-center transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md">
          <div className="text-6xl mb-4 text-center">❌</div>
          <h2 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-2 text-center">
            Error
          </h2>
          <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
            {error}
          </p>
          <button
            onClick={refresh}
            className="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-lg transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (!data || !data.exams) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 flex items-center justify-center transition-colors duration-300">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            Sin Datos
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            No hay exámenes registrados todavía. Completa algunos exámenes para ver tus estadísticas.
          </p>
          <a
            href="/"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-lg transition-colors"
          >
            Ir al inicio
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-950 dark:to-purple-950 transition-colors duration-300 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-800 dark:text-white">
                📊 Analytics Preview
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                Testing de FASE 1 - Hooks y Datos
              </p>
            </div>
            <button
              onClick={refresh}
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg transition-colors shadow-lg flex items-center gap-2"
            >
              🔄 Refrescar
            </button>
          </div>
          
          {/* Navigation */}
          <div className="flex gap-4">
            <a
              href="/"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Volver al inicio
            </a>
            <span className="text-gray-400">|</span>
            <button
              onClick={() => console.table(data)}
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              📋 Ver datos en consola
            </button>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
        >
          <StatsCard
            icon="🎯"
            label="Total Exámenes"
            value={data.exams.totalExams || 0}
            color="blue"
          />
          <StatsCard
            icon="⭐"
            label="Promedio"
            value={data.exams.averageScore ? `${data.exams.averageScore.toFixed(1)}%` : '0%'}
            color="purple"
          />
          <StatsCard
            icon="🔥"
            label="Racha Actual"
            value={data.global.streakDaily || 0}
            color="orange"
          />
          <StatsCard
            icon="📈"
            label="Nivel"
            value={data.global.level || 1}
            subtitle={`${data.global.totalXP || 0} XP`}
            color="green"
          />
        </motion.div>

        {/* Detailed Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
        >
          {/* Global Metrics */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors duration-300">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              📊 Métricas Globales
            </h3>
            <div className="space-y-3">
              <MetricRow label="Respuestas correctas" value={data.global.totalCorrectAnswers || 0} />
              <MetricRow label="Respuestas incorrectas" value={data.global.totalWrongAnswers || 0} />
              <MetricRow label="Tasa de acierto" value={data.charts?.distribution?.percentage ? `${data.charts.distribution.percentage.toFixed(1)}%` : '0%'} />
              <MetricRow label="Mejor racha" value={data.global.streakBest || 0} />
              <MetricRow label="Logros desbloqueados" value={data.global.achievementsUnlocked || 0} />
              <MetricRow label="Sesiones de estudio" value={data.global.totalStudySessions || 0} />
            </div>
          </div>

          {/* Exam Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors duration-300">
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              📝 Estadísticas de Exámenes
            </h3>
            <div className="space-y-3">
              <MetricRow label="Total de exámenes" value={data.exams.totalExams || 0} />
              <MetricRow label="Promedio de puntaje" value={data.exams.averageScore ? `${data.exams.averageScore.toFixed(1)}%` : '0%'} />
              <MetricRow label="Tasa de aprobación" value={data.exams.passRate ? `${data.exams.passRate.toFixed(1)}%` : '0%'} />
              <MetricRow label="Tiempo total" value={formatTime(data.exams.totalTime || 0)} />
              <MetricRow label="Tiempo promedio" value={formatTime(data.exams.averageTime || 0)} />
              <MetricRow label="Total correctas" value={data.exams.totalCorrect || 0} />
            </div>
          </div>
        </motion.div>

        {/* Charts Section */}
        {charts && (
          <>
            {/* Performance Chart */}
            {charts.performance.data && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 transition-colors duration-300"
              >
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  📈 Rendimiento a lo Largo del Tiempo
                </h3>
                <div id="chart-performance">
                  <Line
                    data={charts.performance.data}
                    options={charts.performance.options}
                  />
                </div>
              </motion.div>
            )}

            {/* Subject and Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Subject Chart */}
              {charts.subject.data && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors duration-300"
                >
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    📚 Por Materia
                  </h3>
                  <div id="chart-subject">
                    <Bar
                      data={charts.subject.data}
                      options={charts.subject.options}
                    />
                  </div>
                </motion.div>
              )}

              {/* Distribution Chart */}
              {charts.distribution.data && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors duration-300"
                >
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                    🎯 Distribución de Respuestas
                  </h3>
                  <div id="chart-distribution">
                    <Doughnut
                      data={charts.distribution.data}
                      options={charts.distribution.options}
                    />
                  </div>
                </motion.div>
              )}
            </div>
          </>
        )}

        {/* By Subject Table */}
        {data.bySubject.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 mb-8 transition-colors duration-300"
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              📋 Detalle por Materia
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">Materia</th>
                    <th className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">Exámenes</th>
                    <th className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">Promedio</th>
                    <th className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">Aprobación</th>
                    <th className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">Tiempo Prom.</th>
                  </tr>
                </thead>
                <tbody>
                  {data.bySubject.map((subject, index) => (
                    <tr
                      key={index}
                      className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="py-3 px-4 text-gray-800 dark:text-gray-200 font-medium">
                        {subject.subjectName}
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                        {subject.exams}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`font-semibold ${
                          subject.averageScore >= 80 
                            ? 'text-green-600 dark:text-green-400' 
                            : subject.averageScore >= 60 
                            ? 'text-yellow-600 dark:text-yellow-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {subject.averageScore ? subject.averageScore.toFixed(1) : 0}%
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                        {subject.passRate ? subject.passRate.toFixed(0) : 0}%
                      </td>
                      <td className="py-3 px-4 text-center text-gray-600 dark:text-gray-400">
                        {formatTime(subject.averageTime || 0)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}

        {/* Recent Exams */}
        {data.recentExams.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors duration-300"
          >
            <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
              🕐 Últimos Exámenes
            </h3>
            <div className="space-y-3">
              {data.recentExams.map((exam, index) => (
                <div
                  key={exam.sessionId}
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg transition-colors duration-300"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 dark:text-gray-200">
                      {exam.subjectName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {exam.date} • {formatTime(exam.timeSpent)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold ${
                      exam.passed 
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      {exam.score ? exam.score.toFixed(0) : 0}%
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {exam.correctAnswers || 0}/{exam.totalQuestions || 0}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Helper Components
function StatsCard({ icon, label, value, subtitle, color = 'blue' }) {
  const colors = {
    blue: 'from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600',
    purple: 'from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600',
    orange: 'from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600',
    green: 'from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600'
  };

  return (
    <div className={`bg-gradient-to-br ${colors[color]} rounded-2xl shadow-xl p-6 text-white transition-all duration-300 hover:scale-105`}>
      <div className="text-4xl mb-2">{icon}</div>
      <p className="text-sm opacity-90 mb-1">{label}</p>
      <p className="text-3xl font-bold">{value}</p>
      {subtitle && <p className="text-xs opacity-75 mt-1">{subtitle}</p>}
    </div>
  );
}

function MetricRow({ label, value }) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-700">
      <span className="text-gray-600 dark:text-gray-400">{label}</span>
      <span className="font-semibold text-gray-800 dark:text-gray-200">{value}</span>
    </div>
  );
}

// Helper Functions
function formatTime(seconds) {
  if (!seconds) return '0m';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}