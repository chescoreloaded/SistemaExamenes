import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSubjects } from '@/services/subjectsService';
import { Card, Button, Loading } from '@/components/common'; // ✅ Eliminamos Badge de los imports
import { useSoundContext } from '@/context/SoundContext';
import { useLanguage } from '@/context/LanguageContext';

export default function Home() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { language, t } = useLanguage();
  const { playClick } = useSoundContext();

  useEffect(() => {
    loadSubjects();
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

  const handleStartExam = (subjectId) => { playClick(); navigate(`/exam/${subjectId}?mode=exam`); };
  const handlePracticeMode = (subjectId) => { playClick(); navigate(`/exam/${subjectId}?mode=practice`); };
  const handleStudyMode = (subjectId) => { playClick(); navigate(`/study/${subjectId}`); };

  const infoCards = [
    { icon: '📝', title: t('home.modes.exam.title'), desc: t('home.modes.exam.desc'), features: t('home.modes.exam.features'), color: 'blue', animation: 'animate-bounce' },
    { icon: '🎯', title: t('home.modes.practice.title'), desc: t('home.modes.practice.desc'), features: t('home.modes.practice.features'), color: 'red', animation: 'animate-pulse' },
    { icon: '📚', title: t('home.modes.study.title'), desc: t('home.modes.study.desc'), features: t('home.modes.study.features'), color: 'purple', animation: 'hover:rotate-12' }
  ];

  if (loading) return <div className="flex items-center justify-center h-[50vh]"><Loading text={t('common.loading')} /></div>;

  if (error) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">{t('common.error')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={loadSubjects}>{t('common.retry')}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* 🗑️ ELIMINADO: Bloque del Badge flotante que estaba aquí */}

      {subjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">{t('home.noSubjects')}</h3>
          <p className="text-gray-500 dark:text-gray-400">{t('home.noSubjectsSub')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <Card key={subject.id} className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white dark:bg-gray-800">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl transform hover:scale-110 hover:rotate-12 transition-all duration-300 cursor-pointer">{subject.icon}</div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 min-h-[3rem]">{subject.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">{subject.description}</p>
                <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="text-center bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">{t('home.stats.baseXp')}</p>
                    <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{subject.base_xp || 100}</p>
                  </div>
                  <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">{t('home.stats.hours')}</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{subject.estimated_hours || '2.5'}</p>
                  </div>
                  <div className="text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-3">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">{t('home.stats.level')}</p>
                    <p className="text-sm font-bold text-green-600 dark:text-green-400 uppercase pt-1 truncate">{subject.difficulty_level || 'BASIC'}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3.5 px-4 rounded-lg font-semibold shadow-md hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2" onClick={() => handleStartExam(subject.id)}>
                    📝 {t('home.actions.examBtn')}
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 px-4 rounded-lg font-medium shadow hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-1" onClick={() => handlePracticeMode(subject.id)}>
                      🎯 {t('home.actions.practiceBtn')}
                    </button>
                    <button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-lg font-medium shadow hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-1" onClick={() => handleStudyMode(subject.id)}>
                      📚 {t('home.actions.studyBtn')}
                    </button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
        {infoCards.map((card, index) => (
          <Card key={index} className={`text-center p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:-translate-y-1 bg-gradient-to-br from-${card.color}-50 to-white dark:from-gray-800 dark:to-gray-900 hover:border-${card.color}-300 dark:hover:border-${card.color}-600 dark:border-gray-700`}>
            <div className={`text-5xl mb-4 ${card.animation} transition-transform duration-300 cursor-pointer`}>{card.icon}</div>
            <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">{card.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">{card.desc}</p>
            <div className={`flex items-center justify-center gap-2 text-xs font-medium text-${card.color}-600 dark:text-${card.color}-400`}>{card.features}</div>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300 border border-gray-100 dark:border-gray-700">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">💡 <strong>{t('footer.tipPrefix')}</strong> {t('footer.tipText')}</p>
        <div className="flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
          <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded"><kbd className="font-mono font-bold">←→</kbd> {t('footer.shortcuts.nav')}</span>
          <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded"><kbd className="font-mono font-bold">1-4</kbd> {t('footer.shortcuts.answer')}</span>
          <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded"><kbd className="font-mono font-bold">M</kbd> {t('footer.shortcuts.mark')}</span>
          <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded"><kbd className="font-mono font-bold">Space</kbd> {t('footer.shortcuts.flip')}</span>
          <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded"><kbd className="font-mono font-bold">Esc</kbd> {t('footer.shortcuts.exit')}</span>
        </div>
      </div>
    </div>
  );
}