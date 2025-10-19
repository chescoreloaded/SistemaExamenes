import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjectsService } from '@/services/subjectsService';
import { Card, Button, Loading, Badge } from '@/components/common';

export default function Home() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadSubjects();
  }, []);

  const loadSubjects = async () => {
    try {
      setLoading(true);
      const data = await subjectsService.getAll();
      setSubjects(data);
    } catch (err) {
      console.error('Error loading subjects:', err);
      setError('Error al cargar las materias');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = (subjectId) => {
    navigate(`/exam/${subjectId}?mode=exam`);
  };

  const handlePracticeMode = (subjectId) => {
    navigate(`/exam/${subjectId}?mode=practice`);
  };

  const handleStudyMode = (subjectId) => {
    navigate(`/study/${subjectId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={loadSubjects}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Sistema de Exámenes
              </h1>
              <p className="text-gray-600 mt-1">
                Selecciona una materia para comenzar
              </p>
            </div>
            <Badge variant="success" className="text-lg px-4 py-2">
              {subjects.length} Materias
            </Badge>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No hay materias disponibles
            </h3>
            <p className="text-gray-500">
              Agrega materias para comenzar a crear exámenes
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Card 
                key={subject.id} 
                className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-6">
                  {/* Header con icono */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl transform hover:scale-110 transition-transform">
                      {subject.icon}
                    </div>
                  </div>

                  {/* Título y descripción */}
                  <h3 className="text-xl font-bold text-gray-800 mb-2 min-h-[3rem]">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {subject.description}
                  </p>

                  {/* Stats mejorados con fondos de color */}
                  <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-gray-200">
                    <div className="text-center bg-indigo-50 rounded-lg p-3 hover:bg-indigo-100 transition-colors">
                      <p className="text-xs text-gray-600 mb-1 font-medium">Categorías</p>
                      <p className="text-2xl font-bold text-indigo-600">
                        {subject.categories?.length || 0}
                      </p>
                    </div>
                    <div className="text-center bg-blue-50 rounded-lg p-3 hover:bg-blue-100 transition-colors">
                      <p className="text-xs text-gray-600 mb-1 font-medium">Tiempo</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {subject.time_limit}
                        <span className="text-sm ml-0.5">min</span>
                      </p>
                    </div>
                    <div className="text-center bg-green-50 rounded-lg p-3 hover:bg-green-100 transition-colors">
                      <p className="text-xs text-gray-600 mb-1 font-medium">Mínimo</p>
                      <p className="text-2xl font-bold text-green-600">
                        {subject.passing_score}
                        <span className="text-sm">%</span>
                      </p>
                    </div>
                  </div>

                  {/* Botones con jerarquía clara */}
                  <div className="space-y-3">
                    {/* Acción principal - MÁS PROMINENTE */}
                    <Button
                      variant="primary"
                      className="w-full justify-center py-3.5 text-base font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all"
                      onClick={() => handleStartExam(subject.id)}
                    >
                      📝 Modo Examen
                    </Button>
                    
                    {/* Acciones secundarias - MISMO TAMAÑO */}
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="secondary"
                        className="justify-center py-3 font-medium hover:shadow-md transition-shadow"
                        onClick={() => handlePracticeMode(subject.id)}
                      >
                        🎯 Práctica
                      </Button>
                      
                      <Button
                        variant="accent"
                        className="justify-center py-3 font-medium hover:shadow-md transition-shadow"
                        onClick={() => handleStudyMode(subject.id)}
                      >
                        📚 Estudio
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Cards informativas mejoradas con más valor */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <Card className="text-center p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-200">
            <div className="text-5xl mb-4">📝</div>
            <h4 className="font-bold text-lg mb-2 text-gray-800">Modo Examen</h4>
            <p className="text-sm text-gray-600 mb-3">
              Practica con tiempo límite y obtén tu calificación final
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-indigo-600 font-medium">
              <span>⏱️ Cronómetro</span>
              <span>•</span>
              <span>📊 Calificación</span>
            </div>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-green-200">
            <div className="text-5xl mb-4">🎯</div>
            <h4 className="font-bold text-lg mb-2 text-gray-800">Modo Práctica</h4>
            <p className="text-sm text-gray-600 mb-3">
              Aprende con feedback instantáneo y sin presión de tiempo
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-green-600 font-medium">
              <span>✅ Respuestas inmediatas</span>
              <span>•</span>
              <span>💡 Explicaciones</span>
            </div>
          </Card>

          <Card className="text-center p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-purple-200">
            <div className="text-5xl mb-4">📚</div>
            <h4 className="font-bold text-lg mb-2 text-gray-800">Modo Estudio</h4>
            <p className="text-sm text-gray-600 mb-3">
              Repasa con flashcards interactivas y memoriza conceptos clave
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-purple-600 font-medium">
              <span>🔄 Flip animado</span>
              <span>•</span>
              <span>🎲 Aleatorio</span>
            </div>
          </Card>
        </div>

        {/* Footer informativo */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            💡 <strong>Tip:</strong> Usa los atajos de teclado para navegar más rápido
          </p>
        </div>
      </main>
    </div>
  );
}