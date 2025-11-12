import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubjects } from '@/services/subjectsService';
import { Loading, CourseCard, Button } from '@/components/common'; // Usamos componentes base
import { useSoundContext } from '@/context/SoundContext';
import { useLanguage } from '@/context/LanguageContext';
import { getExamHistory } from '@/lib/indexedDB';
import { motion } from 'framer-motion';

export default function Home() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subjectStats, setSubjectStats] = useState({});

  const { language, t } = useLanguage();
  const { playClick } = useSoundContext();

  useEffect(() => {
    loadSubjects();
    loadSubjectStats();
  }, [language]);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await getSubjects(language);
      setSubjects(data);
    } catch (err) {
      console.error('Error loading subjects:', err);
      setError(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const loadSubjectStats = async () => {
    try {
      const history = await getExamHistory();
      const stats = {};
      history.forEach(exam => {
        const subjectId = exam.subjectId || exam.subject?.id;
        if (!subjectId) return;
        if (!stats[subjectId]) stats[subjectId] = { bestScore: 0, totalAttempts: 0 };
        stats[subjectId].bestScore = Math.max(stats[subjectId].bestScore, exam.score || 0);
        stats[subjectId].totalAttempts++;
      });
      setSubjectStats(stats);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const infoCards = [
    { icon: '🎯', title: t('home.modes.exam.title'), desc: t('home.modes.exam.desc'), color: 'from-blue-500 to-indigo-600' },
    { icon: '🎪', title: t('home.modes.practice.title'), desc: t('home.modes.practice.desc'), color: 'from-orange-400 to-red-500' },
    { icon: '📚', title: t('home.modes.study.title'), desc: t('home.modes.study.desc'), color: 'from-purple-500 to-pink-500' }
  ];

  if (loading) return <div className="flex items-center justify-center h-[50vh]"><Loading text={t('common.loading')} /></div>;

  return (
    <div className="min-h-screen">
      {/* Hero Section con Fondo Sutil */}
      <div className="relative overflow-hidden mb-12 py-16 md:py-24 bg-white dark:bg-gray-900">
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] dark:bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400">
              {t('home.welcomeTitle')}
            </span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed"
          >
            {t('home.welcomeSubtitle')}
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        {/* Grid de Cursos */}
        {subjects.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              {subjects.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <CourseCard subject={subject} stats={subjectStats[subject.id]} />
                </motion.div>
              ))}
            </div>
            
            <div className="text-center mb-24">
              <Button 
                size="lg"
                variant="outline"
                onClick={() => { playClick(); navigate('/explorer'); }}
                className="px-8 py-4 text-lg rounded-full border-2 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
              >
                🔍 {t('home.exploreMore')}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-20 opacity-50">
             <div className="text-6xl mb-4">📭</div>
             <p>{t('home.noSubjects')}</p>
          </div>
        )}

        {/* Info Cards Rediseñadas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {infoCards.map((card, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative overflow-hidden rounded-3xl p-8 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 group hover:shadow-xl transition-all duration-300"
            >
              {/* Gradiente sutil en hover */}
              <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-500 bg-gradient-to-br ${card.color}`} />
              
              <div className="relative z-10">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 bg-gradient-to-br ${card.color} text-white shadow-md transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300`}>
                  {card.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                  {card.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {card.desc}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}