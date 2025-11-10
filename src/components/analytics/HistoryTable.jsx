import { motion } from 'framer-motion';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '@/context/LanguageContext'; // ✅ Import hook

export function HistoryTable({ recentExams, className = '' }) {
  const { t, language } = useLanguage(); // ✅ Usar hook
  const [sortBy, setSortBy] = useState('date'); // date, score, subject
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

  if (!recentExams || recentExams.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors duration-300 ${className}`}
      >
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <span className="text-2xl">📋</span>
          {t('analytics.history.title')}
        </h3>
        <div className="text-center py-12">
          <p className="text-gray-400 dark:text-gray-500 text-lg">📭 {t('analytics.noData.titleFiltered')}</p>
          <p className="text-sm text-gray-500 dark:text-gray-600 mt-2">{t('analytics.noData.subtitle')}</p>
        </div>
      </motion.div>
    );
  }

  // ✅ Lógica de ordenamiento (RECUPERADA)
  const sortedExams = [...recentExams].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(b.timestamp) - new Date(a.timestamp);
        break;
      case 'score':
        comparison = (b.score || 0) - (a.score || 0);
        break;
      case 'subject':
        comparison = (a.subjectName || '').localeCompare(b.subjectName || '');
        break;
      default:
        comparison = 0;
    }
    
    return sortOrder === 'asc' ? -comparison : comparison;
  });

  const handleSort = (column) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <span className="text-gray-400">⇅</span>;
    return <span>{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  // Función auxiliar para formatear fecha según idioma
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString(
      language === 'en' ? 'en-US' : 'es-ES',
      { day: 'numeric', month: 'long', year: 'numeric' }
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      id="history-table-container"
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors duration-300 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-2xl">📋</span>
          {t('analytics.history.title')}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {recentExams.length} {t('analytics.history.footer.totalExams').toLowerCase()}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200 dark:border-gray-700">
              <th 
                onClick={() => handleSort('date')}
                className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {t('analytics.history.columns.date')} <SortIcon column="date" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('subject')}
                className="text-left py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <div className="flex items-center gap-2">
                  {t('analytics.history.columns.subject')} <SortIcon column="subject" />
                </div>
              </th>
              <th 
                onClick={() => handleSort('score')}
                className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <div className="flex items-center justify-center gap-2">
                  {t('analytics.history.columns.score')} <SortIcon column="score" />
                </div>
              </th>
              <th className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
                {t('analytics.history.columns.answers')}
              </th>
              <th className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
                {t('analytics.history.columns.time')}
              </th>
              <th className="text-center py-3 px-4 text-gray-600 dark:text-gray-400 font-semibold">
                {t('analytics.history.columns.status')}
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedExams.map((exam, index) => (
              <motion.tr
                key={exam.sessionId}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="py-4 px-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {formatDate(exam.timestamp)}
                </td>
                <td className="py-4 px-4">
                  <span className="font-medium text-gray-800 dark:text-gray-200">
                    {exam.subjectName}
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`text-xl font-bold ${
                    exam.score >= 70 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {exam.score ? exam.score.toFixed(0) : 0}%
                  </span>
                </td>
                <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">
                  <span className="font-medium">
                    {exam.correctAnswers || 0}/{exam.totalQuestions || 0}
                  </span>
                </td>
                <td className="py-4 px-4 text-center text-gray-600 dark:text-gray-400">
                  {formatTime(exam.timeSpent)}
                </td>
                <td className="py-4 px-4 text-center">
                  {exam.passed ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                      ✓ {t('analytics.history.status.passed')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full text-xs font-semibold">
                      ✗ {t('analytics.history.status.failed')}
                    </span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {sortedExams.length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('analytics.history.footer.totalExams')}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">
            {sortedExams.filter(e => e.passed).length}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('analytics.history.footer.passed')}</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {(sortedExams.reduce((sum, e) => sum + (e.score || 0), 0) / sortedExams.length).toFixed(1)}%
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{t('analytics.history.footer.average')}</p>
        </div>
      </div>
    </motion.div>
  );
}

function formatTime(seconds) {
  if (!seconds) return '0m 0s';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

HistoryTable.propTypes = {
  recentExams: PropTypes.arrayOf(
    PropTypes.shape({
      sessionId: PropTypes.string,
      subjectName: PropTypes.string,
      score: PropTypes.number,
      correctAnswers: PropTypes.number,
      totalQuestions: PropTypes.number,
      timeSpent: PropTypes.number,
      date: PropTypes.string,
      passed: PropTypes.bool,
      timestamp: PropTypes.number
    })
  ).isRequired,
  className: PropTypes.string
};

export default HistoryTable;