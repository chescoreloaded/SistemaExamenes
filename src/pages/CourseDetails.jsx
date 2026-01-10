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
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    loadSubjectDetails();
    loadUserStats();
  }, [subjectId, language]);

  const loadSubjectDetails = async () => {
    try {
      setLoading(true);
      const data = await getSubject(subjectId, language);
      if (!data) { navigate('/'); return; }
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

  const handleStartExam = () => { playClick(); navigate(`/exam/${subjectId}?mode=exam`); };
  const handlePracticeMode = () => { playClick(); navigate(`/exam/${subjectId}?mode=practice`); };
  const handleStudyMode = () => { playClick(); navigate(`/study/${subjectId}`); };

  if (loading) return <div className="flex items-center justify-center h-[50vh]"><Loading text={t('common.loading')} /></div>;
  if (!subject) return null;

  const modeCards = [
    {
      id: 'exam',
      icon: '⏱️',
      title: t('home.modes.exam.title'),
      description: t('home.modes.exam.desc'),
      features: subject.time_limit ? 
        `${subject.time_limit} ${t('common.minutes')} • ${subject.passing_score}% ${t('common.passingScore')}` : 
        t('home.modes.exam.features'),
      action: handleStartExam,
      buttonText: t('home.actions.examBtn'),
      bgClass: 'bg-blue-50 dark:bg-blue-900/20',
      btnClass: 'bg-blue-600 hover:bg-blue-700 shadow-colored-indigo'
    },
    {
      id: 'practice',
      icon: '🎯',
      title: t('home.modes.practice.title'),
      description: t('home.modes.practice.desc'),
      features: t('home.modes.practice.features'),
      action: handlePracticeMode,
      buttonText: t('home.actions.practiceBtn'),
      bgClass: 'bg-orange-50 dark:bg-orange-900/20',
      btnClass: 'bg-orange-600 hover:bg-orange-700 shadow-colored-orange'
    },
    {
      id: 'study',
      icon: '🧠',
      title: t('home.modes.study.title'),
      description: t('home.modes.study.desc'),
      features: t('home.modes.study.features'),
      action: handleStudyMode,
      buttonText: t('home.actions.studyBtn'),
      bgClass: 'bg-purple-50 dark:bg-purple-900/20',
      btnClass: 'bg-purple-600 hover:bg-purple-700 shadow-colored-purple'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-gray-950 overflow-x-hidden pb-20">
      
      {/* 1. HERO SECTION COMPACTO Y ALINEADO */}
      <div className="relative pt-6 pb-12 md:pt-12 md:pb-16 overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-white dark:bg-gray-900" />
          <div className="absolute top-0 w-full h-[400px]" style={{ background: `linear-gradient(180deg, ${subject.color}10 0%, transparent 100%)` }} />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6">
            {/* Botón atrás flotante */}
            <button 
               onClick={() => navigate(-1)}
               className="mb-6 px-4 py-2 rounded-full bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors inline-flex items-center gap-2"
             >
               ← {t('common.back')}
            </button>

            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
                {/* Icono: Ahora más integrado y con fondo blanco */}
                <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex-shrink-0 w-24 h-24 md:w-32 md:h-32 rounded-3xl flex items-center justify-center text-5xl md:text-6xl shadow-xl bg-white dark:bg-gray-800 border-4 border-white dark:border-gray-700 z-20"
                    style={{ color: subject.color }}
                >
                    {subject.icon}
                </motion.div>

                {/* Textos: Centrados en móvil, izquierda en desktop */}
                <div className="flex-1 text-center md:text-left">
                    <div className="flex flex-wrap justify-center md:justify-start gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-wide bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 shadow-sm">
                            {t(`common.difficulty.${subject.difficulty_level?.toLowerCase()}`) || subject.difficulty_level}
                        </span>
                        <span className="px-3 py-1 rounded-full text-[10px] md:text-xs font-bold bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 shadow-sm">
                            ⏱️ {subject.estimated_hours}h
                        </span>
                    </div>
                    
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-3 leading-tight">
                        {subject.name}
                    </h1>
                    <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto md:mx-0 leading-relaxed">
                        {subject.description}
                    </p>
                </div>
            </div>

            {/* Stats Bar Compacta */}
            {stats.totalAttempts > 0 && (
                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatBox label={t('course.stats.bestScore')} value={`${stats.bestScore}%`} icon="🏆" />
                    <StatBox label={t('course.stats.attempts')} value={stats.totalAttempts} icon="🔄" />
                    <StatBox label={t('course.stats.avgScore')} value={`${stats.averageScore}%`} icon="📊" />
                    <StatBox label={t('course.stats.totalXp')} value={stats.totalXpEarned} icon="⭐" />
                </div>
            )}
        </div>
      </div>

      {/* 2. MODE CARDS - ELEVATED */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 md:-mt-10 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {modeCards.map((mode, index) => (
                <motion.div
                    key={mode.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-xl shadow-gray-200/50 dark:shadow-none border border-white dark:border-gray-700 hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-6 ${mode.bgClass}`}>
                        {mode.icon}
                    </div>
                    
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{mode.title}</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 flex-1 leading-relaxed">{mode.description}</p>
                    
                    <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
                        <span>✨</span> {mode.features}
                    </div>

                    <button 
                        onClick={mode.action}
                        className={`w-full py-4 rounded-xl font-bold text-white transition-all transform active:scale-95 ${mode.btnClass}`}
                    >
                        {mode.buttonText}
                    </button>
                </motion.div>
            ))}
        </div>

        {/* 3. CONTENT LIST (SYLLABUS) */}
        <div className="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2 space-y-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                   📚 {t('course.categoriesTitle')}
                </h2>
                
                {subject.categories?.length > 0 ? (
                    <div className="space-y-4">
                        {subject.categories.map((category) => (
                            <div key={category.id} className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-5 hover:shadow-md transition-shadow">
                                <div className="w-12 h-12 rounded-xl bg-gray-50 dark:bg-gray-700 flex items-center justify-center text-2xl">
                                    {category.icon || '📄'}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 dark:text-white text-lg">{category.name}</h4>
                                    {category.description && <p className="text-sm text-gray-500">{category.description}</p>}
                                </div>
                                {category.weight && (
                                    <div className="text-right">
                                        <span className="text-xs font-bold text-gray-400 block mb-1">PESO</span>
                                        <span className="text-sm font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded">{Math.round(category.weight * 100)}%</span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 italic">No hay contenido disponible aún.</p>
                )}
            </div>

            {/* SIDEBAR INFO */}
            <div className="space-y-6">
                 <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-6">Información</h3>
                    <div className="space-y-5">
                        <InfoRow label={t('course.institution')} value={subject.institution} icon="🏛️" />
                        <InfoRow label={t('course.instructor')} value={subject.instructor} icon="👨‍🏫" />
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                            <InfoRow label="Última Actualización" value="Oct 2025" icon="📅" />
                        </div>
                    </div>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, icon }) {
  return (
    <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur rounded-2xl p-3 border border-gray-100 dark:border-gray-700 shadow-sm text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className="text-lg font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</div>
    </div>
  );
}

function InfoRow({ label, value, icon }) {
    if (!value) return null;
    return (
        <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">{label}</span>
            <div className="flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                <span>{icon}</span> {value}
            </div>
        </div>
    );
}