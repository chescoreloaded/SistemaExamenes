import { useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { ResultsSummary, CategoryBreakdown } from '../components/results';

export default function Results() {
  const { subjectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const results = location.state?.results;

  useEffect(() => {
    if (!results) {
      navigate('/subjects', { replace: true });
    }
  }, [results, navigate]);

  if (!results) {
    return null;
  }

  // ✅ CRITICAL: Verificar modo
  const isPracticeMode = results.mode === 'practice';

  // Efecto de confetti si aprobó (solo en modo examen)
  useEffect(() => {
    if (!isPracticeMode && results.passed && results.score === 100) {
      console.log('🎉 ¡Examen perfecto!');
    }
  }, [results, isPracticeMode]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => navigate('/')}
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          }
          className="mb-6"
        >
          Volver al inicio
        </Button>

        {/* ✅ Badge de modo */}
        <div className="mb-4 text-center">
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${
            isPracticeMode 
              ? 'bg-purple-100 text-purple-700' 
              : 'bg-blue-100 text-blue-700'
          }`}>
            {isPracticeMode ? '🎯 Modo Práctica' : '📝 Modo Examen'}
          </span>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <ResultsSummary results={results} />
        </div>

        {/* ✅ Category Breakdown (solo en modo examen) */}
        {!isPracticeMode && results.byCategory && (
          <div className="mb-6">
            <CategoryBreakdown byCategory={results.byCategory} />
          </div>
        )}

        {/* ✅ Mensaje específico de modo práctica */}
        {isPracticeMode && (
          <Card padding="lg" className="mb-6 text-center bg-gradient-to-br from-purple-50 to-blue-50">
            <div className="text-4xl mb-3">💡</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Modo Práctica Completado
            </h3>
            <p className="text-gray-600">
              Este resultado no se guarda en tu historial. 
              Practica las veces que quieras sin presión.
            </p>
          </Card>
        )}

        {/* Actions - Diferentes según el modo */}
        {isPracticeMode ? (
          // ✅ MODO PRÁCTICA: Botones simples
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="primary"
              onClick={() => navigate(`/exam/${subjectId}?mode=practice`)}
              size="lg"
              icon="🔄"
            >
              Practicar de nuevo
            </Button>
            
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              size="lg"
            >
              Volver al inicio
            </Button>
          </div>
        ) : (
          // ✅ MODO EXAMEN: Más opciones
          <>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
              <Button
                variant="outline"
                onClick={() => navigate(`/exam/${subjectId}?mode=exam`)}
                size="lg"
              >
                Repetir examen
              </Button>
              
              <Button
                variant="primary"
                onClick={() => navigate(`/exam/${subjectId}?mode=practice`)}
                size="lg"
              >
                Modo práctica
              </Button>

              <Button
                variant="secondary"
                onClick={() => navigate('/')}
                size="lg"
              >
                Otras materias
              </Button>
            </div>

            {/* Opción de revisar respuestas */}
            <Card padding="lg" className="text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">
                📋 Revisa tus respuestas
              </h3>
              <ReviewAnswers results={results} />
            </Card>
          </>
        )}
      </div>
    </div>
  );
}

// ========================================
// COMPONENTE: ReviewAnswers
// ========================================
function ReviewAnswers({ results }) {
  if (!results.questions || results.questions.length === 0) {
    return <p className="text-gray-600">No hay preguntas para revisar</p>;
  }

  return (
    <div className="space-y-4 max-h-96 overflow-y-auto">
      {results.questions.map((question, index) => {
        const userAnswer = results.answers[question.id];
        const isCorrect = userAnswer === question.correct;
        const wasAnswered = userAnswer !== undefined;

        return (
          <div
            key={question.id}
            className={`p-4 rounded-lg border-l-4 text-left ${
              !wasAnswered 
                ? 'border-gray-400 bg-gray-50'
                : isCorrect 
                ? 'border-green-500 bg-green-50' 
                : 'border-red-500 bg-red-50'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <p className="font-semibold text-gray-800">
                {index + 1}. {question.question}
              </p>
              <span className={`ml-2 font-semibold whitespace-nowrap ${
                !wasAnswered 
                  ? 'text-gray-600'
                  : isCorrect 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}>
                {!wasAnswered ? '○ Sin responder' : isCorrect ? '✓ Correcta' : '✗ Incorrecta'}
              </span>
            </div>

            {wasAnswered && (
              <div className="text-sm space-y-1 mt-2">
                <p className="text-gray-700">
                  <strong>Tu respuesta:</strong> {question.options[userAnswer]}
                </p>
                {!isCorrect && (
                  <p className="text-green-700">
                    <strong>Correcta:</strong> {question.options[question.correct]}
                  </p>
                )}
              </div>
            )}

            {question.explanation && (
              <div className="mt-3 p-3 bg-white rounded text-sm text-gray-600 border border-gray-200">
                <strong>💡 Explicación:</strong> {question.explanation}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}