import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSubjects } from '@/services/subjectsService';
// HeaderControls, PageHeader ya no son necesarios aquí
import { CourseFilters } from '@/components/search/CourseFilters';
import { SearchBar } from '@/components/search/SearchBar';
import { Card, Loading, Button } from '@/components/common';
import { useLanguage } from '@/context/LanguageContext';
import { useSoundContext } from '@/context/SoundContext';
import { Pagination } from '@/components/common/Pagination';

export default function CourseExplorer() {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const { playClick } = useSoundContext();

  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await getSubjects(language);
      setSubjects(data || []);
      setLoading(false);
    };
    loadData();
  }, [language]);

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

  const handleStartExam = (subjectId) => { playClick(); navigate(`/exam/${subjectId}?mode=exam`); };
  const handlePracticeMode = (subjectId) => { playClick(); navigate(`/exam/${subjectId}?mode=practice`); };
  const handleStudyMode = (subjectId) => { playClick(); navigate(`/study/${subjectId}`); };

  if (loading) return <div className="flex items-center justify-center h-[50vh]"><Loading text={t('common.loading')} /></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Título local de la página (opcional, ya que el navbar indica dónde estás, pero bueno para SEO/UX) */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">🧭 {t('explorer.title')}</h1>
        <p className="text-gray-600 dark:text-gray-400">{t('explorer.subtitle')}</p>
      </div>

      <div className="mb-8 space-y-4">
        <SearchBar onSearch={setSearchTerm} />
        <CourseFilters onFilterChange={setFilters} />
      </div>

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
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-white dark:bg-gray-800 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-xl font-bold text-gray-700 dark:text-gray-300 mb-2">{t('explorer.noResults')}</h3>
          <p className="text-gray-500 dark:text-gray-400">{t('explorer.tryChangingFilters')}</p>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[50vh] content-start">
            {paginatedSubjects.map((subject) => (
              <Card key={subject.id} className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 bg-white dark:bg-gray-800 flex flex-col">
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-4xl">{subject.icon}</div>
                    {subject.difficulty_level && (
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${subject.difficulty_level === 'basic' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : subject.difficulty_level === 'intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                        {subject.difficulty_level}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-2 line-clamp-2 min-h-[3.5rem]">{subject.name}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-3 flex-1">{subject.description}</p>
                  <div className="grid grid-cols-2 gap-3 mt-auto pt-4 border-t border-gray-100 dark:border-gray-700">
                      <Button variant="primary" onClick={() => handleStartExam(subject.id)} className="col-span-2 flex justify-center items-center gap-2 py-2.5">📝 {t('home.actions.examBtn')}</Button>
                      <Button variant="secondary" onClick={() => handlePracticeMode(subject.id)} className="flex justify-center items-center gap-1 text-xs py-2">🎯 {t('home.actions.practiceBtn')}</Button>
                      <Button variant="secondary" onClick={() => handleStudyMode(subject.id)} className="flex justify-center items-center gap-1 text-xs py-2">📚 {t('home.actions.studyBtn')}</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <div className="mt-10">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        </>
      )}
    </div>
  );
}