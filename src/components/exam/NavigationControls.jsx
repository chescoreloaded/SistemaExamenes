import { Button } from '../common/Button';
import PropTypes from 'prop-types';

export function NavigationControls({ 
  onPrevious,
  onNext,
  onToggleReview,
  onFinish,
  canGoPrevious,
  canGoNext,
  isReviewed,
  answeredCount,
  totalQuestions,
  mode
}) {
  return (
    <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 shadow-lg transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Previous button */}
          <Button
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious}
            className="flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Anterior
          </Button>

          {/* Review button */}
          <Button
            variant={isReviewed ? 'warning' : 'ghost'}
            onClick={onToggleReview}
            className="flex items-center gap-2"
          >
            <span className="text-lg">📌</span>
            {isReviewed ? 'Marcada' : 'Marcar para revisar'}
          </Button>

          {/* Next or Finish button */}
          {canGoNext ? (
            <Button
              variant="primary"
              onClick={onNext}
              className="flex items-center gap-2"
            >
              Siguiente
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          ) : (
            <Button
              variant="success"
              onClick={onFinish}
              size="lg"
              className="flex items-center gap-2"
            >
              <span className="text-lg">✓</span>
              Finalizar {answeredCount < totalQuestions && `(${totalQuestions - answeredCount} sin responder)`}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

NavigationControls.propTypes = {
  onPrevious: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onToggleReview: PropTypes.func.isRequired,
  onFinish: PropTypes.func.isRequired,
  canGoPrevious: PropTypes.bool.isRequired,
  canGoNext: PropTypes.bool.isRequired,
  isReviewed: PropTypes.bool.isRequired,
  answeredCount: PropTypes.number.isRequired,
  totalQuestions: PropTypes.number.isRequired,
  mode: PropTypes.string
};

export default NavigationControls;
