import { Button } from '../common';
import { useLanguage } from '@/context/LanguageContext'; // ✅ Import hook

export default function NavigationControls({
  currentIndex,
  totalQuestions,
  onPrevious,
  onNext,
  onToggleReview,
  canGoPrevious,
  canGoNext,
  isReviewed,
  onFinish,
  mode
}) {
  const { t } = useLanguage(); // ✅ Usar hook

  return (
    <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t-2 border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="flex gap-3 w-full sm:w-auto">
        <Button
          variant="secondary"
          onClick={onPrevious}
          disabled={!canGoPrevious}
          className="flex-1 sm:flex-none"
        >
          ← {t('common.back')} {/* ✅ Traducido */}
        </Button>
        
        <Button
          variant={isReviewed ? 'warning' : 'secondary'}
          onClick={onToggleReview}
          className="flex-1 sm:flex-none"
        >
          {isReviewed ? '★' : '☆'} {t('exam.shortcuts.mark')} {/* ✅ Traducido */}
        </Button>
      </div>

      <div className="flex gap-3 w-full sm:w-auto">
        {canGoNext ? (
          <Button
            variant="primary"
            onClick={onNext}
            className="flex-1 sm:flex-none w-full sm:w-auto bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
          >
            {t('common.next')} → {/* ✅ Traducido */}
          </Button>
        ) : (
          <Button
            variant="primary"
            onClick={onFinish}
            className="flex-1 sm:flex-none w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 animate-pulse-subtle"
          >
            ✨ {t('common.finish')} {/* ✅ Traducido */}
          </Button>
        )}
      </div>
    </div>
  );
}