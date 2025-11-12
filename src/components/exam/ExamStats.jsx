import { useLanguage } from '@/context/LanguageContext';
import { StreakDisplay } from '../gamification'; // Asegúrate de importar esto

/**
 * Muestra las estadísticas relevantes dentro del modal de ExamMode.
 */
export default function ExamStats({ formattedStats, dailyStreak, correctStreak }) {
  const { t } = useLanguage();

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border-2 border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-4 pb-3 border-b-2 border-gray-100 dark:border-gray-700">
        📊 {t('exam.stats.title', 'Estadísticas de la Sesión')}
      </h3>
      
      <div className="space-y-4">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('exam.stats.accuracy', 'Precisión')}</span>
            <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{formattedStats.accuracy}%</span>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('exam.stats.totalXp', 'XP Total')}</span>
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">✨ {formattedStats.totalXP}</span>
          </div>
        </div>
        
        {/* Usamos el componente StreakDisplay existente */}
        <StreakDisplay 
          current={correctStreak.current} 
          best={correctStreak.best} 
          type={t('gamification.streak.correct', 'Correctas')} 
          compact={false} // Versión no compacta
        />
        
        <StreakDisplay 
          current={dailyStreak.current} 
          best={dailyStreak.best} 
          type={t('gamification.streak.daily', 'Días')} 
          compact={false} // Versión no compacta
        />
      </div>
    </div>
  );
}