import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useSwipe } from '@/hooks/useSwipe';
import { Flashcard, StudyProgress } from '@/components/study';
import FlashcardNavigator from '@/components/study/FlashcardNavigator';
import { Button, Loading, Modal, Breadcrumbs } from '@/components/common';
import { SaveIndicator } from '@/components/common/SaveIndicator';
import { dbManager } from '@/lib/indexedDB';

export default function StudyMode() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [showExitModal, setShowExitModal] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);

  const {
    cards,
    currentCard,
    isFlipped,
    currentIndex,
    totalCards,
    loading,
    error,
    subjectName,
    subjectIcon,
    markedCards,
    studiedCards,
    // ✅ NUEVO: Estados de autosave
    saveStatus,
    isSaving,
    isSaved,
    forceSave,
    sessionId, // ✅ NUEVO
    // Acciones
    flipCard,
    nextCard,
    previousCard,
    goToCard,
    shuffle,
    reset,
    toggleMark
  } = useFlashcards(subjectId);

  // Swipe gestures
  useSwipe(
    () => nextCard(),
    () => previousCard(),
    () => flipCard(),
    () => setShowNavigator(prev => !prev)
  );

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
        case 'm':
        case 'M':
          e.preventDefault();
          if (currentCard) toggleMark(currentCard.id);
          break;
        case 'Escape':
          e.preventDefault();
          setShowExitModal(true);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [flipCard, nextCard, previousCard, shuffle, currentCard, toggleMark]);

  const handleExit = async () => {
    // Limpiar sesión de IndexedDB
    if (sessionId) {
      try {
        await dbManager.deleteFlashcardProgress(sessionId);
        console.log('🗑️ Sesión de flashcards limpiada');
      } catch (error) {
        console.error('Error limpiando sesión:', error);
      }
    }
    navigate('/');
  };

  // ✅ Wrapper para shuffle que limpia progreso
  const handleShuffle = async () => {
    if (sessionId) {
      try {
        await dbManager.deleteFlashcardProgress(sessionId);
        console.log('🗑️ Progreso limpiado antes de mezclar');
      } catch (error) {
        console.error('Error limpiando progreso:', error);
      }
    }
    shuffle();
  };

  // ✅ Wrapper para reset que limpia progreso
  const handleReset = async () => {
    if (sessionId) {
      try {
        await dbManager.deleteFlashcardProgress(sessionId);
        console.log('🗑️ Progreso limpiado antes de reiniciar');
      } catch (error) {
        console.error('Error limpiando progreso:', error);
      }
    }
    reset();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <Loading text="Cargando flashcards..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={handleExit} variant="primary">
            Volver al inicio
          </Button>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Inicio', href: '/', icon: '🏠' },
    { label: subjectName, href: '/', icon: subjectIcon },
    { label: 'Modo Estudio', icon: '📚' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Breadcrumbs items={breadcrumbItems} />
      
      {/* ✅ Header mejorado */}
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-indigo-200 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Sección izquierda: Título y modo */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{subjectIcon}</span>
                <div className="min-w-0">
                  <h1 className="text-lg font-bold text-gray-800 truncate">
                    {subjectName}
                  </h1>
                  <p className="text-xs text-gray-600">
                    📚 Modo Estudio • Flashcards
                  </p>
                </div>
              </div>

              {/* Progress (Desktop) */}
              <div className="hidden md:flex items-center gap-4">
                <div className="text-sm">
                  <span className="font-bold text-indigo-600">{currentIndex + 1}</span>
                  <span className="text-gray-500"> / {totalCards}</span>
                </div>
                <div className="text-xs text-gray-600 bg-indigo-100 px-2 py-1 rounded-full">
                  {studiedCards.size} estudiadas
                </div>
              </div>
            </div>

            {/* Sección centro: SaveIndicator (Desktop) */}
            <div className="hidden lg:block">
              <SaveIndicator status={saveStatus} />
            </div>
            
            {/* Sección derecha: Botones */}
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowExitModal(true)}
                className="hidden sm:flex"
              >
                ← Salir
              </Button>
              
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowNavigator(!showNavigator)}
                className="lg:hidden"
              >
                🗂️ {showNavigator ? 'Ocultar' : 'Navegador'}
              </Button>
            </div>
          </div>

          {/* Banner de progreso */}
          <div className="mt-3 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg p-3">
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">📚 Modo Estudio</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">
                  Tarjeta {currentIndex + 1} / {totalCards}
                </div>
                <div className="text-xs opacity-90">
                  {studiedCards.size} estudiadas • {Math.round((studiedCards.size / totalCards) * 100)}% completado
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="mt-2 w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${(studiedCards.size / totalCards) * 100}%` }}
              />
            </div>
          </div>

          {/* Mobile: SaveIndicator debajo */}
          <div className="lg:hidden mt-2 flex justify-center">
            <SaveIndicator status={saveStatus} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Progress - MANTENER para mobile o quitar si quieres */}
        <div className="lg:hidden mb-6">
          <StudyProgress
            currentIndex={currentIndex}
            totalCards={totalCards}
            studiedCards={studiedCards}
            markedCards={markedCards}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6 mt-6">
          {/* Flashcard Area */}
          <main className="space-y-6">
            <div className="flex items-center justify-center min-h-[500px]">
              <Flashcard
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={flipCard}
              />
            </div>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-lg">
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleShuffle}
                  className="flex items-center gap-2"
                >
                  🔀 Mezclar
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleReset}
                  className="flex items-center gap-2"
                >
                  🔄 Reiniciar
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={previousCard}
                  disabled={currentIndex === 0}
                  variant="secondary"
                  className="min-h-[44px]"
                >
                  ← Anterior
                </Button>

                <span className="text-sm font-medium text-gray-700 px-4">
                  {currentIndex + 1} / {totalCards}
                </span>

                <Button
                  onClick={nextCard}
                  disabled={currentIndex === totalCards - 1}
                  variant="secondary"
                  className="min-h-[44px]"
                >
                  Siguiente →
                </Button>
              </div>

              <Button
                onClick={() => currentCard && toggleMark(currentCard.id)}
                variant="secondary"
                size="sm"
                className={`flex items-center gap-2 ${
                  currentCard && markedCards.has(currentCard.id)
                    ? 'bg-yellow-100 border-yellow-400 text-yellow-700'
                    : ''
                }`}
              >
                {currentCard && markedCards.has(currentCard.id) ? '★' : '☆'} Marcar
              </Button>
            </div>

            {/* Mobile hint */}
            <div className="lg:hidden text-center text-sm text-gray-600 bg-indigo-100 rounded-lg p-3">
              💡 <strong>Tip:</strong> Desliza ← → para navegar, ↑ para voltear, ↓ para navegador
            </div>
          </main>

          {/* Navigator Sidebar */}
          <aside 
            className={`${
              showNavigator ? 'block' : 'hidden'
            } lg:block`}
          >
            <div className="sticky top-24">
              <FlashcardNavigator
                cards={cards}
                currentIndex={currentIndex}
                markedCards={markedCards}
                studiedCards={studiedCards}
                onGoToCard={goToCard}
              />
            </div>
          </aside>
        </div>
      </div>

      {/* Exit Modal */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="⚠️ Salir del modo estudio"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Tu progreso se guardará automáticamente.
          </p>
          <p className="text-gray-600">
            ¿Estás seguro de que quieres salir?
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="secondary"
              onClick={() => setShowExitModal(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleExit}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
            >
              Sí, salir
            </Button>
          </div>
        </div>
      </Modal>

      {/* Keyboard shortcuts hint */}
      <div className="fixed bottom-4 right-4 hidden md:block">
        <div className="bg-gray-900/90 text-white text-xs rounded-lg p-3 shadow-xl max-w-xs">
          <div className="font-bold mb-2">⌨️ Atajos de teclado:</div>
          <div className="space-y-1 text-gray-300">
            <div>← → : Navegar</div>
            <div>Espacio/Enter : Voltear</div>
            <div>M : Marcar tarjeta</div>
            <div>S : Mezclar</div>
            <div>Esc : Salir</div>
          </div>
        </div>
      </div>
    </div>
  );
}
