import { Timer } from '../common/Timer';
import { ProgressBar } from '../common/ProgressBar';

export function ExamHeader({ 
  subjectName,
  subjectIcon,
  mode,
  timeRemaining,
  showTimer = true,
  answeredCount,
  totalQuestions,
  progress
}) {
  return (
    <div className="bg-white shadow-md sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Title and Stats */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {subjectIcon && <span className="text-3xl">{subjectIcon}</span>}
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                {subjectName}
              </h1>
              <p className="text-sm text-gray-600">
                Modo: {mode === 'exam' ? 'Examen' : 'Práctica'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {showTimer && timeRemaining !== undefined && (
              <Timer timeRemaining={timeRemaining} />
            )}
            <div className="text-right">
              <p className="text-sm text-gray-600">Progreso</p>
              <p className="text-lg font-bold text-gray-800">
                {answeredCount} / {totalQuestions}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <ProgressBar progress={progress} showPercentage={false} />
      </div>
    </div>
  );
}