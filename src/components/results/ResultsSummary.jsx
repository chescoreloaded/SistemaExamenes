import { Card } from '../common/Card';
import { ProgressRing } from '../common/ProgressRing';
import { Badge } from '../common/Badge';

export function ResultsSummary({ results }) {
  const isPassed = results.passed;
  const percentage = Math.round(results.score);
  const isPracticeMode = results.mode === 'practice';

  return (
    <Card padding="lg" className="text-center">
      {/* Icon */}
      <div className="mb-6">
        <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center text-5xl ${
          isPassed ? 'bg-green-100' : 'bg-orange-100'
        }`}>
          {isPassed ? '🎉' : '📚'}
        </div>
      </div>

      {/* Title */}
      <h2 className="text-3xl font-bold text-gray-800 mb-2">
        {isPassed ? '¡Felicitaciones!' : '¡Buen intento!'}
      </h2>
      <p className="text-gray-600 mb-2">
        {results.subjectName}
      </p>
      
      {/* ✅ Indicador de modo */}
      {isPracticeMode && (
        <p className="text-sm text-purple-600 font-semibold mb-4">
          Modo Práctica - No guardado en historial
        </p>
      )}

      {/* Score */}
      <div className="mb-6 flex justify-center">
        <ProgressRing progress={percentage} size={180} strokeWidth={12} />
      </div>

      {/* Status badge */}
      <Badge 
        variant={isPassed ? 'success' : 'warning'} 
        size="lg"
        className="mb-6"
      >
        {isPassed ? 'APROBADO' : 'NO APROBADO'} - Nota mínima: {results.passingScore}%
      </Badge>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 mt-8">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Correctas</p>
          <p className="text-3xl font-bold text-green-600">
            {results.correctAnswers}
          </p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Incorrectas</p>
          <p className="text-3xl font-bold text-red-600">
            {results.incorrectAnswers}
          </p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Total preguntas</p>
          <p className="text-3xl font-bold text-blue-600">
            {results.totalQuestions}
          </p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">
            {isPracticeMode ? 'Tiempo usado' : 'Tiempo total'}
          </p>
          <p className="text-3xl font-bold text-purple-600">
            {Math.floor(results.timeSpent / 60)}:{(results.timeSpent % 60).toString().padStart(2, '0')}
          </p>
        </div>
      </div>

      {/* ✅ Info adicional solo para modo examen */}
      {!isPracticeMode && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            📅 Guardado en tu historial el {new Date(results.completedAt).toLocaleDateString('es-ES')}
          </p>
        </div>
      )}
    </Card>
  );
}