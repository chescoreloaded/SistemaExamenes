import { useLanguage } from '@/context/LanguageContext';
import { StreakDisplay } from '../gamification';

export default function ExamStats({ formattedStats, dailyStreak, correctStreak, variant = 'default' }) {
  const { t } = useLanguage();
  const isSidebar = variant === 'sidebar';

  const containerClasses = isSidebar
    ? "w-full bg-transparent p-0 space-y-4"
    : "bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 border-2 border-gray-200 dark:border-gray-700 space-y-4";

  return (
    <div className={containerClasses}>
      {!isSidebar && (
        <h3 className="text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 border-b-2 border-gray-100 dark:border-gray-700 pb-2">
            📊 {t('exam.stats.title', 'Estadísticas')}
        </h3>
      )}
      
      {/* Precisión */}
      <div className="bg-muted/50 p-3 rounded-lg border border-border">
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-muted-foreground">{t('exam.stats.accuracy', 'Precisión')}</span>
          <span className={`text-xl font-bold ${Number(formattedStats.accuracy) >= 70 ? 'text-green-600 dark:text-green-400' : 'text-orange-500'}`}>
            {formattedStats.accuracy}%
          </span>
        </div>
        <div className="w-full bg-secondary h-1.5 rounded-full overflow-hidden">
            <div className="h-full bg-primary" style={{ width: `${formattedStats.accuracy}%` }} />
        </div>
      </div>

      {/* XP */}
      <div className="bg-muted/50 p-3 rounded-lg border border-border flex justify-between items-center">
          <span className="text-sm text-muted-foreground">{t('exam.stats.totalXp', 'XP Ganado')}</span>
          <span className="text-xl font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
            ✨ {formattedStats.totalXP}
          </span>
      </div>
      
      {/* Rachas (Reutilizamos componentes existentes) */}
      <div className="space-y-3 pt-2">
        <StreakDisplay 
          current={correctStreak.current} 
          best={correctStreak.best} 
          type={t('gamification.streak.correct', 'Racha Actual')} 
          compact={true} 
        />
      </div>
    </div>
  );
}