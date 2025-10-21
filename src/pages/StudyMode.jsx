import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useSwipe } from '@/hooks/useSwipe';
import { Flashcard, StudyProgress } from '@/components/study';
import FlashcardNavigator from '@/components/study/FlashcardNavigator';
import { Button, Loading, Modal, Breadcrumbs } from '@/components/common';

export default function StudyMode() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [showExitModal, setShowExitModal] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false); // ✅ NUEVO

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
    flipCard,
    nextCard,
    previousCard,
    goToCard,
    shuffle,
    reset,
    toggleMark
  } = useFlashcards(subjectId);

  // ✅ NUEVO: Swipe gestures
  useSwipe(
    () => nextCard(),           // Swipe left → Siguiente
    () => previousCard(),       // Swipe right → Anterior
    () => flipCard(),           // Swipe up → Voltear
    () => setShowNavigator(prev => !prev) // Swipe down → Toggle navegador
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

  const handleExit = () => {
    navigate('/');
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

  const breadcrumbItems = [
    { label: 'Inicio', href: '/', icon: '🏠' },
    { label: subjectName, href: '/', icon: subjectIcon || '📚' },
    { label: 'Modo Estudio', icon: '📚' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <Breadcrumbs items={breadcrumbItems} />
      
      <StudyProgress 
        current={currentIndex + 1} 
        total={totalCards}
        studied={studiedCards.size}
        subjectName={subjectName}
      />

      <div className="max-w-7xl mx-auto px-4 py-4 md:py-8">
        {/* ✅ NUEVO: Header con botones - mejor en mobile */}
        <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3 mb-6">
          <Button 
            variant="outline"
            onClick={() => setShowExitModal(true)}
            className="hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all min-h-[44px] w-full sm:w-auto"
          >
            ← Salir
          </Button>

          <div className="flex gap-2 sm:gap-3">
            <Button 
              variant="secondary"
              onClick={shuffle}
              className="hover:shadow-md bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 flex-1 sm:flex-none min-h-[44px]"
            >
              🔀 <span className="hidden sm:inline ml-1">Mezclar</span>
            </Button>
            <Button 
              variant="secondary"
              onClick={reset}
              className="hover:shadow-md bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 flex-1 sm:flex-none min-h-[44px]"
            >
              🔄 <span className="hidden sm:inline ml-1">Reiniciar</span>
            </Button>
          </div>
        </div>

        {/* ✅ NUEVO: Botón toggle navegador en mobile */}
        <div className="lg:hidden mb-4">
          <button
            onClick={() => setShowNavigator(!showNavigator)}
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
          >
            <span className="text-xl">🗂️</span>
            <span>{showNavigator ? 'Ocultar' : 'Ver'} Navegador</span>
            <svg 
              className={`w-5 h-5 transition-transform ${showNavigator ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigator */}
          <div className={`lg:col-span-1 order-2 lg:order-1 ${showNavigator ? 'block' : 'hidden lg:block'}`}>
            <FlashcardNavigator
              cards={cards}
              currentIndex={currentIndex}
              markedCards={markedCards}
              studiedCards={studiedCards}
              onCardClick={(index) => {
                goToCard(index);
                setShowNavigator(false);
              }}
              onToggleMark={toggleMark}
            />

            {/* ✅ NUEVO: Hints de gestos en mobile */}
            <div className="mt-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-4 shadow-sm lg:hidden">
              <p className="text-xs font-bold text-purple-900 mb-2 flex items-center gap-2">
                <span className="text-base">👆</span> Gestos táctiles
              </p>
              <ul className="text-xs text-purple-700 space-y-1">
                <li>← Desliza para siguiente</li>
                <li>→ Desliza para anterior</li>
                <li>↑ Desliza para voltear</li>
                <li>↓ Desliza para navegador</li>
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <div className="flex justify-center items-center mb-6 md:mb-8">
              <Flashcard 
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={flipCard}
              />
            </div>

            <div className="flex flex-col items-center gap-4 md:gap-6 mt-6 md:mt-8">
              {/* ✅ MEJORADO: Botón voltear más grande */}
              <button
                onClick={flipCard}
                className="w-full max-w-xs md:max-w-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600 text-white text-lg md:text-xl font-bold py-4 px-6 rounded-xl shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-3 min-h-[52px]"
              >
                🔄 Voltear Tarjeta
              </button>

              {/* ✅ MEJORADO: Controles de navegación más grandes */}
              <div className="flex items-center gap-3 md:gap-4 w-full max-w-md">
                <button
                  onClick={previousCard}
                  disabled={currentIndex === 0}
                  className="flex-1 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium shadow hover:shadow-md transition-all disabled:cursor-not-allowed border border-gray-200 min-h-[44px]"
                >
                  ⬅️ <span className="hidden sm:inline">Anterior</span>
                </button>

                <div className="text-sm font-bold text-gray-700 px-4 md:px-6 py-2 bg-white rounded-lg shadow-sm border border-gray-200 whitespace-nowrap">
                  {currentIndex + 1} / {totalCards}
                </div>

                <button
                  onClick={nextCard}
                  disabled={currentIndex === totalCards - 1}
                  className="flex-1 bg-white hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 py-3 px-4 rounded-lg font-medium shadow hover:shadow-md transition-all disabled:cursor-not-allowed border border-gray-200 min-h-[44px]"
                >
                  <span className="hidden sm:inline">Siguiente</span> ➡️
                </button>
              </div>

              {/* ✅ MEJORADO: Botón marcar más grande */}
              <button
                onClick={() => toggleMark(currentCard.id)}
                className={`text-sm px-6 py-3 rounded-lg font-medium transition-all transform hover:scale-110 min-h-[44px] ${
                  markedCards.has(currentCard.id)
                    ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md'
                    : 'bg-white text-gray-600 border border-gray-300 hover:border-yellow-400'
                }`}
              >
                {markedCards.has(currentCard.id) ? '⭐ Marcada' : '☆ Marcar para revisar'}
              </button>

              {/* Keyboard shortcuts - solo desktop */}
              <div className="hidden lg:flex flex-wrap justify-center gap-3 mt-4">
                <span className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 text-xs font-medium">
                  <kbd className="font-mono font-bold text-indigo-600 text-sm">←→</kbd> Navegar
                </span>
                <span className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 text-xs font-medium">
                  <kbd className="font-mono font-bold text-indigo-600 text-sm">Espacio</kbd> Voltear
                </span>
                <span className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 text-xs font-medium">
                  <kbd className="font-mono font-bold text-indigo-600 text-sm">M</kbd> Marcar
                </span>
                <span className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 text-xs font-medium">
                  <kbd className="font-mono font-bold text-indigo-600 text-sm">S</kbd> Mezclar
                </span>
                <span className="bg-white px-3 py-2 rounded-lg shadow-sm border border-gray-200 text-xs font-medium">
                  <kbd className="font-mono font-bold text-red-600 text-sm">Esc</kbd> Salir
                </span>
              </div>

              {/* Completion message */}
              {currentIndex === totalCards - 1 && (
                <div className="mt-8 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-400 rounded-2xl p-6 md:p-8 text-center max-w-2xl shadow-xl animate-fadeIn">
                  <div className="text-6xl mb-4 animate-bounce">🎉</div>
                  <h3 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                    ¡Felicidades! Has terminado todas las tarjetas
                  </h3>
                  <p className="text-green-700 mb-2 text-sm md:text-base">
                    Estudiaste {totalCards} tarjetas • Volteaste {studiedCards.size} tarjetas
                  </p>
                  {markedCards.size > 0 && (
                    <p className="text-yellow-600 font-semibold mb-6 text-sm md:text-base">
                      ⭐ Marcaste {markedCards.size} para revisar
                    </p>
                  )}
                  <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
                    <button 
                      onClick={reset}
                      className="px-6 md:px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all min-h-[44px]"
                    >
                      🔄 Empezar de nuevo
                    </button>
                    <button 
                      onClick={shuffle}
                      className="px-6 md:px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition-all min-h-[44px]"
                    >
                      🔀 Mezclar y repasar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title="⚠️ ¿Salir del modo estudio?"
        size="md"
      >
        <div className="text-center">
          <p className="text-gray-700 mb-4">
            Has volteado <strong className="text-indigo-600">{studiedCards.size} de {totalCards}</strong> tarjetas.
          </p>
          {markedCards.size > 0 && (
            <p className="text-yellow-600 mb-4">
              ⭐ Tienes <strong>{markedCards.size} tarjetas marcadas</strong> para revisar.
            </p>
          )}
          <p className="text-gray-600 mb-6">
            ¿Estás seguro de que deseas salir?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              onClick={() => setShowExitModal(false)}
              className="min-h-[44px]"
            >
              Continuar estudiando
            </Button>
            <Button 
              variant="danger" 
              onClick={handleExit}
              className="min-h-[44px]"
            >
              Salir
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}