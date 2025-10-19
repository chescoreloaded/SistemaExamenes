import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFlashcards } from '@/hooks/useFlashcards';
import { Flashcard, StudyProgress } from '@/components/study';
import { Button, Loading } from '@/components/common';

export default function StudyMode() {
  const { subjectId } = useParams();
  const navigate = useNavigate();

  const {
    cards,
    currentCard,
    isFlipped,
    currentIndex,
    totalCards,
    loading,
    error,
    subjectName,
    flipCard,
    nextCard,
    previousCard,
    shuffle,
    reset
  } = useFlashcards(subjectId);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          previousCard();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextCard();
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          flipCard();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          shuffle();
          break;
        case 'Escape':
          navigate('/');
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [flipCard, nextCard, previousCard, shuffle, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Error al cargar las tarjetas
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => navigate('/')}>
            ← Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  if (!cards || cards.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            No hay tarjetas de estudio
          </h2>
          <p className="text-gray-600 mb-6">
            Esta materia aún no tiene flashcards disponibles
          </p>
          <Button onClick={() => navigate('/')}>
            ← Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header con progreso */}
      <StudyProgress 
        current={currentIndex + 1} 
        total={totalCards}
        subjectName={subjectName}
      />

      {/* Contenedor principal */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Botones superiores */}
        <div className="flex justify-between items-center mb-8">
          <Button 
            variant="outline"
            onClick={() => navigate('/')}
            className="hover:bg-gray-50"
          >
            ← Salir
          </Button>

          <Button 
            variant="secondary"
            onClick={reset}
            className="hover:shadow-md"
          >
            🔄 Reiniciar
          </Button>
        </div>

        {/* Tarjeta principal con mejor feedback visual */}
        <div className="flex justify-center items-center mb-8">
          <Flashcard 
            card={currentCard}
            isFlipped={isFlipped}
            onFlip={flipCard}
          />
        </div>

        {/* Controles con jerarquía mejorada */}
        <div className="flex flex-col items-center gap-6 mt-8">
          {/* VOLTEAR - ACCIÓN PRINCIPAL (MÁS GRANDE Y PROMINENTE) */}
          <Button
            variant="primary"
            onClick={flipCard}
            className="w-72 text-xl font-bold py-4 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            🔄 Voltear Tarjeta
          </Button>

          {/* NAVEGACIÓN - Secundaria */}
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={previousCard}
              disabled={currentIndex === 0}
              className="w-36 py-3"
            >
              ⬅️ Anterior
            </Button>

            <div className="text-sm font-medium text-gray-600 px-4">
              {currentIndex + 1} / {totalCards}
            </div>

            <Button
              variant="outline"
              onClick={nextCard}
              disabled={currentIndex === totalCards - 1}
              className="w-36 py-3"
            >
              Siguiente ➡️
            </Button>
          </div>

          {/* SHUFFLE - Terciaria (menos prominente) */}
          <button
            onClick={shuffle}
            className="text-sm text-gray-500 hover:text-indigo-600 underline decoration-dotted hover:decoration-solid transition-all"
          >
            🔀 Mezclar tarjetas
          </button>

          {/* Atajos de teclado */}
          <div className="text-sm text-gray-500 flex flex-wrap justify-center gap-4 mt-4 bg-white/50 rounded-lg px-6 py-3">
            <span className="bg-white px-3 py-1.5 rounded shadow-sm border border-gray-200">
              <kbd className="font-mono font-bold text-indigo-600">←</kbd> Anterior
            </span>
            <span className="bg-white px-3 py-1.5 rounded shadow-sm border border-gray-200">
              <kbd className="font-mono font-bold text-indigo-600">→</kbd> Siguiente
            </span>
            <span className="bg-white px-3 py-1.5 rounded shadow-sm border border-gray-200">
              <kbd className="font-mono font-bold text-indigo-600">Espacio</kbd> Voltear
            </span>
            <span className="bg-white px-3 py-1.5 rounded shadow-sm border border-gray-200">
              <kbd className="font-mono font-bold text-indigo-600">S</kbd> Mezclar
            </span>
            <span className="bg-white px-3 py-1.5 rounded shadow-sm border border-gray-200">
              <kbd className="font-mono font-bold text-indigo-600">Esc</kbd> Salir
            </span>
          </div>

          {/* Mensaje de finalización mejorado */}
          {currentIndex === totalCards - 1 && (
            <div className="mt-8 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-8 text-center max-w-2xl shadow-lg animate-fadeIn">
              <div className="text-5xl mb-4 animate-bounce">🎉</div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                ¡Has llegado a la última tarjeta!
              </h3>
              <p className="text-green-700 mb-6">
                ¿Quieres repasar de nuevo o mezclar las tarjetas?
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  variant="success" 
                  onClick={reset}
                  className="px-8 py-3 text-base font-semibold shadow-md hover:shadow-lg"
                >
                  🔄 Empezar de nuevo
                </Button>
                <Button 
                  variant="primary" 
                  onClick={shuffle}
                  className="px-8 py-3 text-base font-semibold shadow-md hover:shadow-lg"
                >
                  🔀 Mezclar y repasar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}