import { Button } from '../common/Button';

export function NavigationControls({ 
  onPrevious,
  onNext,
  onToggleReview,
  onFinish,
  canGoPrevious,
  canGoNext,
  isReviewed,
  answeredCount,
  totalQuestions
}) {
  return (
    <div className="bg-white border-t border-gray-200 sticky bottom-0 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Previous button */}
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            icon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            }
          >
            Anterior
          </Button>

          {/* Review button */}
          <Button
            variant={isReviewed ? 'warning' : 'ghost'}
            onClick={onToggleReview}
            icon="📌"
          >
            {isReviewed ? 'Marcada' : 'Marcar para revisar'}
          </Button>

          {/* Next or Finish button */}
          {canGoNext ? (
            <Button
              variant="primary"
              onClick={onNext}
              icon={
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              }
            >
              Siguiente
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={onFinish}
              icon="✓"
              size="lg"
            >
              Finalizar {answeredCount < totalQuestions && `(${totalQuestions - answeredCount} sin responder)`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}