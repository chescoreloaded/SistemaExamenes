import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { subjectsService } from '@/services/subjectsService';
import { Card, Button, Loading, Badge } from '@/components/common';
import { SoundControl, DarkModeToggle } from '@/components/common';
import { useDarkMode } from '@/hooks/useDarkMode';

import { useSoundContext } from '@/context/SoundContext';

export default function Home() {
  const navigate = useNavigate();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ Dark mode hook
  const { isDark, toggle: toggleDarkMode } = useDarkMode();
  
  // ✅ Sound hook
  const { 
    playClick,
    isMuted,
    volume,
    toggleMute,
    changeVolume,
    playTest
  } = useSoundContext();

  // ✅ Activar AudioContext en primer click


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
    playClick();
    navigate(`/exam/${subjectId}?mode=exam`);
  };

  const handlePracticeMode = (subjectId) => {
    playClick();
    navigate(`/exam/${subjectId}?mode=practice`);
  };

  const handleStudyMode = (subjectId) => {
    playClick();
    navigate(`/study/${subjectId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 transition-colors duration-300">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 transition-colors duration-300">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Error</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <Button onClick={loadSubjects}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-indigo-900 dark:to-purple-900 transition-colors duration-300">
      {/* Header mejorado con gradiente + Dark Mode */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Sistema de Exámenes
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Selecciona una materia para comenzar 🚀
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Badge variant="success" className="text-lg px-4 py-2">
                {subjects.length} Materias
              </Badge>
              
              {/* ✅ Control de sonido */}
              <SoundControl
                isMuted={isMuted}
                volume={volume}
                onToggleMute={toggleMute}
                onVolumeChange={changeVolume}
                onTest={playTest}
                compact
              />
              
              {/* ✅ Toggle de modo oscuro */}
              <DarkModeToggle 
                isDark={isDark} 
                toggle={toggleDarkMode}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {subjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
              No hay materias disponibles
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Agrega materias para comenzar a crear exámenes
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {subjects.map((subject) => (
              <Card 
                key={subject.id} 
                className="hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 bg-white dark:bg-gray-800"
              >
                <div className="p-6">
                  {/* Header con icono animado */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="text-5xl transform hover:scale-110 hover:rotate-12 transition-all duration-300 cursor-pointer">
                      {subject.icon}
                    </div>
                  </div>

                  {/* Título y descripción */}
                  <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2 min-h-[3rem]">
                    {subject.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2 min-h-[2.5rem]">
                    {subject.description}
                  </p>

                  {/* Stats con animación y gradientes */}
                  <div className="grid grid-cols-3 gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="text-center bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/30 dark:to-indigo-800/30 rounded-lg p-3 hover:scale-105 transition-transform cursor-pointer">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Categorías</p>
                      <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
                        {subject.categories?.length || 0}
                      </p>
                    </div>
                    <div className="text-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 rounded-lg p-3 hover:scale-105 transition-transform cursor-pointer">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Tiempo</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {subject.time_limit}
                        <span className="text-sm ml-0.5">min</span>
                      </p>
                    </div>
                    <div className="text-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 rounded-lg p-3 hover:scale-105 transition-transform cursor-pointer">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1 font-medium">Mínimo</p>
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {subject.passing_score}
                        <span className="text-sm">%</span>
                      </p>
                    </div>
                  </div>

                  {/* Botones con GRADIENTES DIRECTOS y navegación funcional */}
                  <div className="space-y-3">
                    {/* Acción principal - Modo Examen */}
                    <button
                      className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white py-3.5 px-4 rounded-lg font-semibold shadow-md hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-2"
                      onClick={() => handleStartExam(subject.id)}
                    >
                      📝 Modo Examen
                    </button>
                    
                    {/* Acciones secundarias */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Modo Práctica */}
                      <button
                        className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white py-3 px-4 rounded-lg font-medium shadow hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-1"
                        onClick={() => handlePracticeMode(subject.id)}
                      >
                        🎯 Práctica
                      </button>
                      
                      {/* Modo Estudio - CON GRADIENTE MORADO/ROSA VISIBLE */}
                      <button
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-lg font-medium shadow hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 flex items-center justify-center gap-1"
                        onClick={() => handleStudyMode(subject.id)}
                      >
                        📚 Estudio
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Cards informativas MEJORADAS con gradientes y animaciones + Dark Mode */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-300 dark:hover:border-blue-600 hover:-translate-y-1 bg-gradient-to-br from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-800">
            <div className="text-5xl mb-4 animate-bounce">📝</div>
            <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">Modo Examen</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Practica con tiempo límite y obtén tu calificación final
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-indigo-600 dark:text-indigo-400 font-medium">
              <span>⏱️ Cronómetro</span>
              <span>•</span>
              <span>📊 Calificación</span>
            </div>
          </Card>

          <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-red-300 dark:hover:border-red-600 hover:-translate-y-1 bg-gradient-to-br from-red-50 to-white dark:from-red-900/20 dark:to-gray-800">
            <div className="text-5xl mb-4 animate-pulse">🎯</div>
            <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">Modo Práctica</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Aprende con feedback instantáneo y sin presión de tiempo
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-green-600 dark:text-green-400 font-medium">
              <span>✅ Respuestas inmediatas</span>
              <span>•</span>
              <span>💡 Explicaciones</span>
            </div>
          </Card>

          <Card className="text-center p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-300 dark:hover:border-purple-600 hover:-translate-y-1 bg-gradient-to-br from-purple-50 to-white dark:from-purple-900/20 dark:to-gray-800">
            <div className="text-5xl mb-4 hover:rotate-12 transition-transform duration-300 cursor-pointer">📚</div>
            <h4 className="font-bold text-lg mb-2 text-gray-800 dark:text-white">Modo Estudio</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Repasa con flashcards interactivas y memoriza conceptos clave
            </p>
            <div className="flex items-center justify-center gap-2 text-xs text-purple-600 dark:text-purple-400 font-medium">
              <span>🔄 Flip animado</span>
              <span>•</span>
              <span>🎲 Aleatorio</span>
            </div>
          </Card>
        </div>

        {/* Footer informativo mejorado + Dark Mode */}
        <div className="mt-12 text-center bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 transition-colors duration-300">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            💡 <strong>Tip:</strong> Usa los atajos de teclado para navegar más rápido
          </p>
          <div className="flex justify-center gap-4 text-xs text-gray-500 dark:text-gray-400 flex-wrap">
            <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
              <kbd className="font-mono font-bold">←→</kbd> Navegar
            </span>
            <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
              <kbd className="font-mono font-bold">1-4</kbd> Responder
            </span>
            <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
              <kbd className="font-mono font-bold">M</kbd> Marcar
            </span>
            <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
              <kbd className="font-mono font-bold">Espacio</kbd> Voltear
            </span>
            <span className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded">
              <kbd className="font-mono font-bold">Esc</kbd> Salir
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}