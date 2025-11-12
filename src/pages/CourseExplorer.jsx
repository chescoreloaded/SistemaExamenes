import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSubjects } from '@/services/subjectsService';
import { CourseFilters } from '@/components/search/CourseFilters';
import { SearchBar } from '@/components/search/SearchBar';
import { Loading, Button, CourseCard } from '@/components/common';
import { useLanguage } from '@/context/LanguageContext';
import { useSoundContext } from '@/context/SoundContext';
import { Pagination } from '@/components/common/Pagination';
import { getExamHistory } from '@/lib/indexedDB';

export default function CourseExplorer() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { playClick } = useSoundContext();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [subjectStats, setSubjectStats] = useState({});
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getSubjects(language);
      setSubjects(data || []);
      setLoading(false);
    };
    loadData();
    loadSubjectStats();
  }, [language]);

  const loadSubjectStats = async () => {
    try {
      const history = await getExamHistory();
      const stats = {};
      
      history.forEach(exam => {
        const subjectId = exam.subjectId || exam.subject?.id;
        if (!subjectId) return;
        
        if (!stats[subjectId]) {
          stats[subjectId] = {
            bestScore: 0,
            totalAttempts: 0,
            lastAttempt: null
          };
        }
        
        stats[subjectId].bestScore = Math.max(stats[subjectId].bestScore, exam.score || 0);
        stats[subjectId].totalAttempts++;
        stats[subjectId].lastAttempt = exam.date;
      });
      
      setSubjectStats(stats);
    } catch (error) {
      console.error('Error loading subject stats:', error);
    }
  };

  useEffect(() => { setCurrentPage(1); }, [filters, searchTerm]);

  const filteredSubjects = useMemo(() => {
    return subjects.filter(subject => {
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        if (!subject.name.toLowerCase().includes(term) && !subject.description?.toLowerCase().includes(term)) return false;
      }
      if (filters.academic_level && subject.academic_level !== filters.academic_level) return false;
      if (filters.difficulty_level && subject.difficulty_level !== filters.difficulty_level) return false;
      if (filters.year !== '' && filters.year !== undefined && subject.year !== filters.year) return false;
      if (filters.period !== '' && filters.period !== undefined && subject.period !== filters.period) return false;
      return true;
    });
  }, [subjects, searchTerm, filters]);

  const totalPages = Math.ceil(filteredSubjects.length / ITEMS_PER_PAGE);
  const paginatedSubjects = filteredSubjects.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  if (loading) return <div className="flex items-center justify-center h-[50vh]"><Loading text={t('common.loading')} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">🧭 {t('explorer.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('explorer.subtitle')}</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <SearchBar onSearch={setSearchTerm} />
        <CourseFilters onFilterChange={setFilters} />
      </div>

      {/* Results Count */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {filteredSubjects.length > 0 && t('common.pagination.showing')
              .replace('{start}', (currentPage - 1) * ITEMS_PER_PAGE + 1)
              .replace('{end}', Math.min(currentPage * ITEMS_PER_PAGE, filteredSubjects.length))
              .replace('{total}', filteredSubjects.length)
            }
            {filteredSubjects.length === 0 && t('explorer.noResults')}
        </div>
      </div>

      {filteredSubjects.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }} 
          className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700"
        >
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">{t('explorer.noResults')}</h3>
          <p className="text-gray-500 dark:text-gray-400 mb-6">{t('explorer.tryChangingFilters')}</p>
          <Button 
            variant="outline"
            onClick={() => {
              setFilters({});
              setSearchTerm('');
            }}
          >
            {t('explorer.clearFilters')}
          </Button>
        </motion.div>
      ) : (
        <>
          {/* Courses Grid with new CourseCard component */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[50vh] content-start">
            {paginatedSubjects.map((subject, index) => (
              <motion.div
                key={subject.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <CourseCard 
                  subject={subject}
                  stats={subjectStats[subject.id]}
                />
              </motion.div>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="mt-10">
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        </>
      )}
    </div>
  );
}