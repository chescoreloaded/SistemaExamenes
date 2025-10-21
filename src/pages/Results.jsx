import { useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Breadcrumbs } from '@/components/common/Breadcrumbs';
import { Button, Card } from '@/components/common';

export default function Results() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const results = location.state?.results;

  useEffect(() => {
    if (!results) {
      navigate('/');
    }
  }, [results, navigate]);

  if (!results) return null;

  const passed = results.score >= results.passingScore;

  // Breadcrumbs
  const breadcrumbItems = [
    { label: 'Inicio', href: '/', icon: '🏠' },
    { label: results.subjectName, href: '/', icon: '📚' },
    { label: 'Resultados', icon: '📊' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <Breadcrumbs items={breadcrumbItems} />
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Encabezado con animación */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="text-8xl mb-6"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ duration: 1, repeat: 3 }}
          >
            {passed ? '🎉' : '📚'}
          </motion.div>
          <h1 className={`text-4xl font-bold mb-4 ${
            passed 
              ? 'bg-gradient-to-r from-green-600 to-emerald-600' 
              : 'bg-gradient-to-r from-orange-600 to-red-600'
          } bg-clip-text text-transparent`}>
            {passed ? '¡Felicidades! Has aprobado' : 'Sigue practicando'}
          </h1>
          <p className="text-xl text-gray-600">
            {results.subjectName}
          </p>
        </motion.div>

        {/* Tarjeta de puntuación principal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="p-8 mb-8 bg-gradient-to-br from-white to-blue-50 border-4 border-blue-200">
            <div className="text-center">
              <div className="text-7xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {results.score.toFixed(1)}%
              </div>
              <p className="text-gray-600 text-lg mb-6">
                Puntuación final
              </p>
              
              {/* Estadísticas en grid */}
              <div className="grid grid-cols-3 gap-4 mt-8">
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-4 rounded-xl border-2 border-green-200">
                  <div className="text-3xl font-bold text-green-600">
                    {results.correctAnswers}
                  </div>
                  <div className="text-sm text-gray-600">Correctas</div>
                </div>
                <div className="bg-gradient-to-br from-red-50 to-pink-50 p-4 rounded-xl border-2 border-red-200">
                  <div className="text-3xl font-bold text-red-600">
                    {results.totalQuestions - results.correctAnswers}
                  </div>
                  <div className="text-sm text-gray-600">Incorrectas</div>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200">
                  <div className="text-3xl font-bold text-blue-600">
                    {Math.floor(results.timeSpent / 60)}:{(results.timeSpent % 60).toString().padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-600">Tiempo</div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* ✅ NUEVO: Botón de revisión detallada */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => navigate(`/review/${subjectId}`, { state: { results } })}
            className="w-full bg-gradient-to-r from-purple-500 via-indigo-500 to-blue-500 hover:from-purple-600 hover:via-indigo-600 hover:to-blue-600 text-white py-4 px-6 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3"
          >
            <span className="text-2xl">🔍</span>
            <span>Ver revisión detallada de todas las preguntas</span>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </motion.div>

        {/* Botones de acción */}
        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="px-8 py-3"
          >
            ← Volver al inicio
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(`/exam/${subjectId}?mode=exam`)}
            className="px-8 py-3"
          >
            🔄 Intentar de nuevo
          </Button>
        </motion.div>
      </div>
    </div>
  );
}