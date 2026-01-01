import { motion } from 'framer-motion';
import { useState } from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '@/context/LanguageContext';

export function HistoryTable({ recentExams, className = '' }) {
  const { t, language } = useLanguage();
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');

  if (!recentExams || recentExams.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 transition-colors duration-300 ${className}`}
      >
        <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2">
          <span className="text-2xl">📋</span> {t('analytics.history.title')}
        </h3>
        <div className="text-center py-12">
          <p className="text-gray-400 dark:text-gray-500 text-lg">📭 {t('analytics.noData.titleFiltered')}</p>
        </div>
      </motion.div>
    );
  }

  const sortedExams = [...recentExams].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'date': comparison = new Date(b.timestamp) - new Date(a.timestamp); break;
      case 'score': comparison = (b.score || 0) - (a.score || 0); break;
      case 'subject': comparison = (a.subjectName || '').localeCompare(b.subjectName || ''); break;
      default: comparison = 0;
    }
    return sortOrder === 'asc' ? -comparison : comparison;
  });

  const handleSort = (column) => {
    if (sortBy === column) setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    else { setSortBy(column); setSortOrder('desc'); }
  };

  const SortIcon = ({ column }) => {
    if (sortBy !== column) return <span className="text-gray-300 dark:text-gray-600 opacity-50">⇅</span>;
    return <span className="text-indigo-500 dark:text-indigo-400">{sortOrder === 'asc' ? '↑' : '↓'}</span>;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString(language === 'en' ? 'en-US' : 'es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 transition-colors duration-300 ${className}`}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2">
          <span className="text-2xl">📋</span>
          {t('analytics.history.title')}
        </h3>
      </div>

      <div className="overflow-x-auto -mx-6 px-6">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b-2 border-gray-100 dark:border-gray-700">
              <th onClick={() => handleSort('date')} className="text-left py-3 px-4 text-sm text-gray-500 dark:text-gray-400 font-semibold cursor-pointer hover:text-indigo-500 transition-colors">
                <div className="flex items-center gap-1">{t('analytics.history.columns.date')} <SortIcon column="date" /></div>
              </th>
              <th onClick={() => handleSort('subject')} className="text-left py-3 px-4 text-sm text-gray-500 dark:text-gray-400 font-semibold cursor-pointer hover:text-indigo-500 transition-colors">
                <div className="flex items-center gap-1">{t('analytics.history.columns.subject')} <SortIcon column="subject" /></div>
              </th>
              <th onClick={() => handleSort('score')} className="text-center py-3 px-4 text-sm text-gray-500 dark:text-gray-400 font-semibold cursor-pointer hover:text-indigo-500 transition-colors">
                <div className="flex items-center justify-center gap-1">{t('analytics.history.columns.score')} <SortIcon column="score" /></div>
              </th>
              <th className="text-center py-3 px-4 text-sm text-gray-500 dark:text-gray-400 font-semibold">{t('analytics.history.columns.status')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {sortedExams.map((exam) => (
              <tr key={exam.sessionId} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                <td className="py-4 px-4 text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap">{formatDate(exam.timestamp)}</td>
                <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white max-w-[200px] truncate">{exam.subjectName}</td>
                <td className="py-4 px-4 text-center">
                  <span className={`text-sm font-bold px-2 py-1 rounded-md ${exam.score >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {exam.score ? exam.score.toFixed(0) : 0}%
                  </span>
                </td>
                <td className="py-4 px-4 text-center">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${exam.passed ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                    {exam.passed ? '✓ Aprobado' : '✗ Reprobado'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer mejorado: Flexbox responsive para evitar traslape */}
      <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 flex flex-wrap justify-around gap-4 text-center">
        <div>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{sortedExams.length}</p>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('analytics.history.footer.totalExams')}</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">{sortedExams.filter(e => e.passed).length}</p>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('analytics.history.footer.passed')}</p>
        </div>
        <div>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
            {(sortedExams.reduce((sum, e) => sum + (e.score || 0), 0) / sortedExams.length).toFixed(1)}%
          </p>
          <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">{t('analytics.history.footer.average')}</p>
        </div>
      </div>
    </motion.div>
  );
}

HistoryTable.propTypes = {
  recentExams: PropTypes.array.isRequired,
  className: PropTypes.string
};

export default HistoryTable;