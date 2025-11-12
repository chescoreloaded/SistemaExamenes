import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getSubject } from '@/services/subjectsService';
import { Loading, ProgressBar } from '@/components/common';
import { useLanguage } from '@/context/LanguageContext';
import { useSoundContext } from '@/context/SoundContext';
import { getExamHistory } from '@/lib/indexedDB';

export default function CourseDetails() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { language, t } = useLanguage();
  const { playClick } = useSoundContext();
  
  const [subject, setSubject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    bestScore: 0,
    totalAttempts: 0,
    averageScore: 0,
    lastAttempt: null,
    totalXpEarned: 0
  });

  useEffect(() => {
    loadSubjectDetails();
    loadUserStats();
  }, [subjectId, language]);

  const loadSubjectDetails = async () => {
    try {
      setLoading(true);
      const data = await getSubject(subjectId, language);
      if (!data) {
        navigate('/');
        return;
      }
      setSubject(data);
    } catch (error) {
      console.error('Error loading subject:', error);
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const loadUserStats = async () => {
    try {
      const history = await getExamHistory();
      const subjectHistory = history.filter(exam => 
        exam.subjectId === subjectId || exam.subject?.id === subjectId
      );

      if (subjectHistory.length > 0) {
        const scores = subjectHistory.map(e => e.score || 0);
        const xpEarned = subjectHistory.reduce((sum, e) => sum + (e.xpEarned || 0), 0);
        
        setStats({
          bestScore: Math.max(...scores),
          totalAttempts: subjectHistory.length,
          averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
          lastAttempt: subjectHistory[subjectHistory.length - 1]?.date,
          totalXpEarned: xpEarned
        });
      }
    } catch (error) {
      console.error('Error loading user stats:', error);
    }
  };

  const handleStartExam = () => {
    playClick();
    navigate(`/exam/${subjectId}?mode=exam`);
  };

  const handlePracticeMode = () => {
    playClick();
    navigate(`/exam/${subjectId}?mode=practice`);
  };

  const handleStudyMode = () => {
    playClick();
    navigate(`/study/${subjectId}`);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-[50vh]"><Loading text={t('common.loading')} /></div>;
  }

  if (!subject) return null;

  const modeCards = [
    {
      id: 'exam',
      icon: '🎯',
      title: t('home.modes.exam.title'),
      description: t('home.modes.exam.desc'),
      features: subject.time_limit ? 
        `⏱️ ${subject.time_limit} ${t('common.minutes')} • 📊 ${subject.passing_score}% ${t('common.passingScore')}` : 
        t('home.modes.exam.features'),
      action: handleStartExam,
      buttonText: t('home.actions.examBtn'),
      gradient: 'from-blue-500 to-indigo-600',
      shadow: 'shadow-blue-500/30'
    },
    {
      id: 'practice',
      icon: '🎪',
      title: t('home.modes.practice.title'),
      description: t('home.modes.practice.desc'),
      features: t('home.modes.practice.features'),
      action: handlePracticeMode,
      buttonText: t('home.actions.practiceBtn'),
      gradient: 'from-orange-500 to-red-500',
      shadow: 'shadow-orange-500/30'
    },
    {
      id: 'study',
      icon: '📚',
      title: t('home.modes.study.title'),
      description: t('home.modes.study.desc'),
      features: t('home.modes.study.features'),
      action: handleStudyMode,
      buttonText: t('home.actions.studyBtn'),
      gradient: 'from-purple-500 to-pink-500',
      shadow: 'shadow-purple-500/30'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* ✅ HERO SECTION OPTIMIZADO PARA MÓVIL */}
      <div 
        className="relative overflow-hidden pb-12"
        style={{
          background: `linear-gradient(135deg, ${subject.color}22 0%, ${subject.color}11 100%)`
        }}
      >
        {/* Botón Regresar Flotante */}
        <div className="absolute top-4 left-4 z-10">
             <button 
               onClick={() => navigate(-1)}
               className="p-2 bg-white/50 dark:bg-gray-900/30 backdrop-blur-md rounded-full 
                          hover:bg-white/80 transition-all text-gray-700 dark:text-white"
             >
               ← {t('common.back')}
             </button>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10"
          >
            {/* Icono Grande */}
            <motion.div 
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="flex-shrink-0 w-32 h-32 md:w-40 md:h-40 rounded-3xl flex items-center justify-center text-7xl md:text-8xl shadow-xl"
              style={{ backgroundColor: subject.color, color: 'white' }}
            >
              {subject.icon}
            </motion.div>
            
            {/* Textos Hero */}
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                 {subject.difficulty_level && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-white/50 dark:bg-gray-800/50 backdrop-blur text-gray-700 dark:text-gray-300">
                     {t(`common.difficulty.${subject.difficulty_level}`) || subject.difficulty_level}
                  </span>
                 )}
                 <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/50 dark:bg-gray-800/50 backdrop-blur text-gray-700 dark:text-gray-300">
                   ⏱️ {subject.estimated_hours}h
                 </span>
              </div>

              <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                {subject.name}
              </h1>
              <p className="text-base md:text-lg text-gray-700 dark:text-gray-300 max-w-2xl leading-relaxed">
                {subject.description}
              </p>
            </div>
          </motion.div>

          {/* Stats Rápidas (Glassmorphism) */}
          {stats.totalAttempts > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mt-10"
            >
              <StatBox label={t('course.stats.bestScore')} value={`${stats.bestScore}%`} color={subject.color} />
              <StatBox label={t('course.stats.attempts')} value={stats.totalAttempts} color={subject.color} />
              <StatBox label={t('course.stats.avgScore')} value={`${stats.averageScore}%`} color={subject.color} />
              <StatBox label={t('course.stats.totalXp')} value={stats.totalXpEarned} color={subject.color} />
            </motion.div>
          )}
        </div>
      </div>

      {/* ✅ ACTION CARDS SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 md:-mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {modeCards.map((mode, index) => (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + index * 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col"
            >
              <div className="p-6 md:p-8 flex-1 flex flex-col">
                <div className="text-5xl mb-4">{mode.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {mode.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex-1">
                  {mode.description}
                </p>
                
                {/* Features pequeñitos */}
                <div className="text-xs font-medium text-gray-500 dark:text-gray-500 mb-6 bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg">
                  {mode.features}
                </div>

                <button
                  onClick={mode.action}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-white shadow-lg 
                    bg-gradient-to-r ${mode.gradient} ${mode.shadow}
                    hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 
                    flex items-center justify-center gap-2`}
                >
                  {mode.buttonText} →
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ✅ CATEGORIES & INFO SECTION */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna Izq: Categorías */}
          {subject.categories?.length > 0 && (
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                📂 {t('course.categoriesTitle')}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {subject.categories.map((category) => (
                  <div 
                    key={category.id}
                    className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4"
                  >
                    <span className="text-3xl">{category.icon || '📄'}</span>
                    <div>
                      <h4 className="font-bold text-gray-900 dark:text-white">
                        {category.name}
                      </h4>
                       {category.weight && (
                        <div className="mt-1.5 w-24">
                          <ProgressBar value={category.weight * 100} max={100} className="h-1.5" color={subject.color} />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Columna Der: Info Adicional */}
          {(subject.institution || subject.instructor) && (
            <div className="bg-gray-100 dark:bg-gray-800/50 rounded-2xl p-6 lg:sticky lg:top-24 h-fit">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                ℹ️ {t('course.additionalInfo')}
              </h2>
              <div className="space-y-4">
                {subject.institution && (
                  <InfoRow label={t('course.institution')} value={subject.institution} icon="🏫" />
                )}
                {subject.instructor && (
                  <InfoRow label={t('course.instructor')} value={subject.instructor} icon="👨‍🏫" />
                )}
                {subject.curriculum && (
                   <InfoRow label={t('course.curriculum')} value={subject.curriculum} icon="📜" />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Componentes auxiliares para limpieza
function StatBox({ label, value, color }) {
  return (
    <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 text-center shadow-sm border border-white/20">
      <div className="text-2xl md:text-3xl font-extrabold" style={{ color: color }}>
        {value}
      </div>
      <div className="text-xs md:text-sm font-medium text-gray-600 dark:text-gray-400 mt-1">
        {label}
      </div>
    </div>
  );
}

function InfoRow({ label, value, icon }) {
  return (
    <div>
      <h4 className="text-xs uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </h4>
      <p className="text-base font-medium text-gray-900 dark:text-white flex items-center gap-2">
        <span>{icon}</span> {value}
      </p>
    </div>
  );
}