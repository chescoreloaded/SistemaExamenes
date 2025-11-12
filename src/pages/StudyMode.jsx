// src/pages/StudyMode.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useSwipe } from '@/hooks/useSwipe';
import { Flashcard, StudyProgress } from '@/components/study';
import FlashcardNavigator from '@/components/study/FlashcardNavigator';
import { Button, Loading, Modal } from '@/components/common';
import { SaveIndicator } from '@/components/common/SaveIndicator';
import { useSoundContext } from '@/context/SoundContext';
import { dbManager } from '@/lib/indexedDB';
import { useLanguage } from '@/context/LanguageContext';
import { ImmersiveHeader } from '@/components/layout';

export default function StudyMode() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const [showExitModal, setShowExitModal] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const { t, language } = useLanguage();

  const { 
    playClick,
    playFlashcardFlip,
  } = useSoundContext();

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
    saveStatus,
    sessionId,
    flipCard,
    nextCard,
    previousCard,
    goToCard,
    shuffle,
    reset,
    toggleMark
  } = useFlashcards(subjectId, language);

  useSwipe(
    () => {
      playClick();
      nextCard();
    },
    () => {
      playClick();
      previousCard();
    },
    () => {
      playFlashcardFlip();
      flipCard();
    },
    () => setShowNavigator(prev => !prev)
  );

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          playClick();
          previousCard();
          break;
        case 'ArrowRight':
          e.preventDefault();
          playClick();
          nextCard();
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          playFlashcardFlip();
          flipCard();
          break;
        case 's':
        case 'S':
          e.preventDefault();
          handleShuffle();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          if (currentCard) {
            playClick();
            toggleMark(currentCard.id);
          }
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
  }, [flipCard, nextCard, previousCard, shuffle, currentCard, toggleMark, playClick]);

  const handleExit = async () => {
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

  const handleShuffle = async () => {
    playClick();
    if (sessionId) {
      try {
        await dbManager.deleteFlashcardProgress(sessionId);
      } catch (error) {
        console.error('Error limpiando progreso:', error);
      }
    }
    shuffle();
  };

  const handleReset = async () => {
    playClick();
    if (sessionId) {
      try {
        await dbManager.deleteFlashcardProgress(sessionId);
      } catch (error) {
        console.error('Error limpiando progreso:', error);
      }
    }
    reset();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 transition-colors duration-300">
        <Loading text={t('common.loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-gray-900 dark:to-purple-900 transition-colors duration-300">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{t('common.error')}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <Button onClick={handleExit} variant="primary">
            {t('results.actions.home')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 transition-colors duration-300">
      
      {/* ✅ 2. Usar el nuevo Header Inmersivo */}
      <ImmersiveHeader>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowExitModal(true)}
          className="hidden sm:flex"
        >
          ← {t('common.exit')}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setShowNavigator(!showNavigator)}
          className="lg:hidden"
        >
          🗂️ {showNavigator ? t('exam.ui.hide') : t('study.ui.navigatorTitle')}
        </Button>
      </ImmersiveHeader>

      {/* ✅ 3. Nueva "Cabecera de Contexto" Sticky */}
      <div className="sticky top-16 md:top-20 z-30 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-b-2 border-indigo-200 dark:border-indigo-700 shadow-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
          
          {/* Info y SaveIndicator (Movido aquí) */}
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-3xl">{subjectIcon}</span>
              <div className="min-w-0">
                <h1 className="text-lg font-bold text-gray-800 dark:text-white truncate">
                  {subjectName}
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  📚 {t('study.title')} • Flashcards
                </p>
              </div>
            </div>
            <div className="hidden lg:block">
              <SaveIndicator status={saveStatus} />
            </div>
          </div>

          {/* Barra de Progreso (Movida aquí) */}
          <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-600 dark:via-purple-600 dark:to-pink-600 rounded-lg p-3">
            <div className="flex items-center justify-between text-white">
              <div className="text-right flex-1">
                <div className="text-lg font-bold">
                  {t('study.ui.cardCurrent')} {currentIndex + 1} / {totalCards}
                </div>
                <div className="text-xs opacity-90">
                  {studiedCards.size} {t('study.ui.progress')} • {Math.round((studiedCards.size / totalCards) * 100)}%
                </div>
              </div>
            </div>
            <div className="mt-2 w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-300"
                style={{ width: `${(studiedCards.size / totalCards) * 100}%` }}
              />
            </div>
          </div>

          <div className="lg:hidden flex justify-center">
            <SaveIndicator status={saveStatus} />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="lg:hidden mb-6">
          <StudyProgress
            currentIndex={currentIndex}
            totalCards={totalCards}
            studiedCards={studiedCards}
            markedCards={markedCards}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-6 mt-6">
          <main className="space-y-6">
            <div className="flex items-center justify-center min-h-[500px]">
              <Flashcard
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={() => {
                  playFlashcardFlip();
                  flipCard();
                }}
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-lg transition-colors duration-300">
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleShuffle} className="flex items-center gap-2">
                  🔀 {t('study.ui.shuffle')}
                </Button>
                <Button variant="secondary" size="sm" onClick={handleReset} className="flex items-center gap-2">
                  🔄 {t('study.ui.reset')}
                </Button>
              </div>

              <div className="flex items-center gap-3">
                <Button
                  onClick={() => { playClick(); previousCard(); }}
                  disabled={currentIndex === 0}
                  variant="secondary"
                  className="min-h-[44px]"
                >
                  ← {t('common.back')}
                </Button>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 px-4">
                  {currentIndex + 1} / {totalCards}
                </span>
                <Button
                  onClick={() => { playClick(); nextCard(); }}
                  disabled={currentIndex === totalCards - 1}
                  variant="secondary"
                  className="min-h-[44px]"
                >
                  {t('common.next')} →
                </Button>
              </div>

              <Button
                onClick={() => {
                  if (currentCard) {
                    playClick();
                    toggleMark(currentCard.id);
                  }
                }}
                variant="secondary"
                size="sm"
                className={`flex items-center gap-2 ${
                  currentCard && markedCards.has(currentCard.id)
                    ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-600 text-yellow-700 dark:text-yellow-400'
                    : ''
                }`}
              >
                {currentCard && markedCards.has(currentCard.id) ? '★' : '☆'} {t('study.ui.mark')}
              </Button>
            </div>

            <div className="lg:hidden text-center text-sm text-gray-600 dark:text-gray-400 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg p-3">
              💡 <strong>Tip:</strong> {t('study.ui.tip')}
            </div>
          </main>

          <aside className={`${showNavigator ? 'block' : 'hidden'} lg:block`}>
             {/* ✅ 4. Ajustar el top- sticky */}
            <div className="sticky top-28"> {/* Ajustado de top-24 a top-28 */}
              <FlashcardNavigator
                cards={cards}
                currentIndex={currentIndex}
                markedCards={markedCards}
                studiedCards={studiedCards}
                onGoToCard={(index) => {
                  playClick();
                  goToCard(index);
                }}
              />
            </div>
          </aside>
        </div>
      </div>

      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title={t('study.modals.exit.title')}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-line">
            {t('study.modals.exit.text')}
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <Button variant="secondary" onClick={() => setShowExitModal(false)}>
              {t('study.modals.exit.cancel')}
            </Button>
            <Button
              variant="primary"
              onClick={handleExit}
              className="bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600"
            >
              {t('study.modals.exit.confirm')}
            </Button>
          </div>
        </div>
      </Modal>

      <div className="fixed bottom-4 right-4 hidden md:block">
        <div className="bg-gray-900/90 dark:bg-gray-800/90 text-white text-xs rounded-lg p-3 shadow-xl max-w-xs">
          <div className="font-bold mb-2">⌨️ {t('exam.shortcuts.title')}:</div>
          <div className="space-y-1 text-gray-300 dark:text-gray-400">
            <div>← → : {t('exam.shortcuts.nav')}</div>
            <div>Espacio/Enter : {t('footer.shortcuts.flip')}</div>
            <div>M : {t('footer.shortcuts.mark')} {t('study.ui.cardCurrent').toLowerCase()}</div>
            <div>S : {t('study.ui.shuffle')}</div>
            <div>Esc : {t('common.exit')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}