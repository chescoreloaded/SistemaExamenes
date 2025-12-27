import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFlashcards } from '@/hooks/useFlashcards';
import { useSwipe } from '@/hooks/useSwipe';
import { Flashcard } from '@/components/study'; 
import FlashcardNavigator from '@/components/study/FlashcardNavigator';
import { Button as CommonButton, Loading, Modal } from '@/components/common'; 
import { Button } from '@/components/ui/button'; 
import { SaveIndicator } from '@/components/common/SaveIndicator';
import { useSoundContext } from '@/context/SoundContext';
import { dbManager } from '@/lib/indexedDB';
import { useLanguage } from '@/context/LanguageContext';
import { ImmersiveHeader } from '@/components/layout';

// Shadcn UI Components
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudyMode() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  
  // Estados de UI
  const [showExitModal, setShowExitModal] = useState(false);
  const [showNavigatorModal, setShowNavigatorModal] = useState(false); // Mobile control
  const [isSheetOpen, setIsSheetOpen] = useState(false); // Desktop control

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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useSwipe(
    () => { if(currentIndex < totalCards - 1) { playClick(); nextCard(); } },
    () => { if(currentIndex > 0) { playClick(); previousCard(); } },
    () => { playFlashcardFlip(); flipCard(); },
    () => {} 
  );

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          if (currentIndex > 0) { playClick(); previousCard(); }
          break;
        case 'ArrowRight':
          e.preventDefault();
          if (currentIndex < totalCards - 1) { playClick(); nextCard(); }
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
  }, [flipCard, nextCard, previousCard, shuffle, currentCard, toggleMark, playClick, currentIndex, totalCards]);

  const handleExit = async () => {
    if (sessionId) {
      try {
        await dbManager.deleteFlashcardProgress(sessionId);
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

  /**
   * Componente interno para el contenido del panel (Reutilizable)
   * Incluye la cabecera personalizada con botón de cierre de alto contraste.
   */
  const StudySidePanel = ({ onClose }) => (
    <div className="flex flex-col h-full w-full">
      {/* 1. Cabecera Personalizada (Header) */}
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
           <span className="text-xl">🗂️</span>
           <h3 className="font-bold text-lg text-foreground">
             {t('study.ui.panelTitle') || "Panel de Estudio"}
           </h3>
        </div>
        
        {/* Botón de cierre optimizado para visibilidad */}
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => {
            playClick();
            if (onClose) onClose();
          }}
          className="h-9 w-9 rounded-full text-foreground opacity-80 hover:opacity-100 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900/30 dark:hover:text-red-400 transition-all duration-200"
          title={t('common.close') || "Cerrar"}
        >
          <span className="text-2xl font-light leading-none">×</span>
        </Button>
      </div>

      {/* 2. Contenido (Tabs) */}
      <Tabs defaultValue="navigator" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 p-1">
          <TabsTrigger value="navigator" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            {t('study.ui.navigatorTitle') || "Navegación"}
          </TabsTrigger>
          <TabsTrigger value="info" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
             Info & Stats
          </TabsTrigger>
        </TabsList>

        <TabsContent value="navigator" className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2 -mr-2">
          <FlashcardNavigator
            cards={cards}
            currentIndex={currentIndex}
            markedCards={markedCards}
            studiedCards={studiedCards}
            onGoToCard={(index) => {
              playClick();
              goToCard(index);
              if (onClose) onClose();
            }}
            variant="sidebar"
          />
        </TabsContent>

        <TabsContent value="info" className="space-y-4 overflow-y-auto custom-scrollbar pr-2">
           <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
              <h4 className="font-semibold mb-3 flex items-center gap-2 text-sm uppercase tracking-wider text-muted-foreground">
                  📊 {t('study.ui.progress') || "Estadísticas"}
              </h4>
              <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Total:</span>
                      <span className="font-mono font-bold bg-background px-2 py-0.5 rounded border">{totalCards}</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${(studiedCards.size / totalCards) * 100}%` }}></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="flex flex-col bg-green-500/10 p-2 rounded border border-green-500/20 items-center">
                        <span className="text-xs text-green-600 dark:text-green-400 font-medium">Estudiadas</span>
                        <span className="text-lg font-bold text-green-700 dark:text-green-300">{studiedCards.size}</span>
                    </div>
                    <div className="flex flex-col bg-yellow-500/10 p-2 rounded border border-yellow-500/20 items-center">
                        <span className="text-xs text-yellow-600 dark:text-yellow-400 font-medium">Marcadas</span>
                        <span className="text-lg font-bold text-yellow-700 dark:text-yellow-300">{markedCards.size}</span>
                    </div>
                  </div>
              </div>
           </div>
           
           <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg text-sm border border-blue-100 dark:border-blue-900/50">
              <h4 className="font-semibold mb-2 text-blue-700 dark:text-blue-300 flex items-center gap-2">
                💡 Tips
              </h4>
              <ul className="space-y-2 text-muted-foreground">
                  <li className="flex justify-between items-center border-b border-blue-200/50 dark:border-blue-800/50 pb-1 last:border-0">
                      <span>Girar</span> <kbd className="bg-background border rounded px-1.5 py-0.5 text-xs font-mono shadow-sm">Space</kbd>
                  </li>
                  <li className="flex justify-between items-center border-b border-blue-200/50 dark:border-blue-800/50 pb-1 last:border-0">
                      <span>Anterior</span> <kbd className="bg-background border rounded px-1.5 py-0.5 text-xs font-mono shadow-sm">←</kbd>
                  </li>
                  <li className="flex justify-between items-center border-b border-blue-200/50 dark:border-blue-800/50 pb-1 last:border-0">
                      <span>Siguiente</span> <kbd className="bg-background border rounded px-1.5 py-0.5 text-xs font-mono shadow-sm">→</kbd>
                  </li>
                  <li className="flex justify-between items-center border-b border-blue-200/50 dark:border-blue-800/50 pb-1 last:border-0">
                      <span>Marcar</span> <kbd className="bg-background border rounded px-1.5 py-0.5 text-xs font-mono shadow-sm">M</kbd>
                  </li>
              </ul>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loading text={t('common.loading')} />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center p-6 max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">{t('common.error')}</h2>
          <p className="text-muted-foreground mb-6">{error}</p>
          <Button onClick={handleExit} variant="default">
            {t('results.actions.home')}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 transition-colors duration-300 overflow-x-hidden flex flex-col">
      
      {/* 1. Header Inmersivo */}
      <ImmersiveHeader>
        {/* Botón Salir (Desktop) */}
        <Button variant="secondary" size="sm" onClick={() => setShowExitModal(true)} className="hidden sm:flex gap-2">
          ← {t('common.exit')}
        </Button>
        
        {/* Trigger Móvil (Dialog) */}
        <Dialog open={showNavigatorModal} onOpenChange={setShowNavigatorModal}>
          <DialogTrigger asChild>
            <Button variant="secondary" size="sm" className="lg:hidden">
              🗂️ {t('study.ui.navigatorTitle') || "Cards"}
            </Button>
          </DialogTrigger>
          {/* ✅ Ocultamos la X por defecto y usamos nuestro StudySidePanel */}
          <DialogContent className="max-w-lg h-[85vh] flex flex-col p-6 [&>button]:hidden gap-0">
             <StudySidePanel onClose={() => setShowNavigatorModal(false)} />
          </DialogContent>
        </Dialog>
      </ImmersiveHeader>

      {/* 2. Barra de Contexto (Sticky) */}
      <div className="sticky top-16 md:top-20 z-30 bg-background/95 backdrop-blur-md border-b border-border shadow-sm transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 py-3 space-y-3">
          <div className="flex items-center justify-between gap-4">
            
            {/* Información del Mazo */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-2xl md:text-3xl filter drop-shadow-sm">{subjectIcon}</span>
              <div className="min-w-0">
                <h1 className="text-base md:text-lg font-bold truncate leading-tight text-foreground">
                  {subjectName}
                </h1>
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <span>{studiedCards.size} / {totalCards} {t('study.ui.progress') || "vistas"}</span>
                </p>
              </div>
            </div>

            {/* Save Indicator (Desktop) */}
            <div className="hidden lg:block">
              <SaveIndicator status={saveStatus} />
            </div>
          </div>

          {/* Barra de Progreso Visual */}
          <div className="w-full bg-secondary/50 rounded-full h-1.5 overflow-hidden">
             <div 
                className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-500 ease-out"
                style={{ width: `${(studiedCards.size / totalCards) * 100}%` }}
              />
          </div>
          
           {/* Save Indicator (Mobile) */}
           <div className="lg:hidden flex justify-end">
              <SaveIndicator status={saveStatus} />
            </div>
        </div>
      </div>

      {/* 3. Panel Lateral Desktop (Sheet) */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
          <div
            className="hidden lg:flex items-center justify-center
                       fixed top-1/2 -translate-y-1/2 right-0 z-40
                       h-36 w-10 px-1 py-4
                       bg-card border-l border-t border-b border-border 
                       rounded-l-lg shadow-lg cursor-pointer
                       hover:bg-accent hover:w-12 transition-all duration-200 group"
            aria-label="Abrir navegador"
          >
            <span className="[writing-mode:vertical-rl] text-sm font-medium tracking-wide text-foreground group-hover:text-accent-foreground flex items-center gap-2">
              <span className="text-base rotate-90">🗂️</span>
              {t('study.ui.navigatorTitle') || "Folder"}
            </span>
          </div>
        </SheetTrigger>
        {/* ✅ Ocultamos la X por defecto */}
        <SheetContent className="w-[400px] p-6 [&>button]:hidden flex flex-col gap-0" side="right">
            <StudySidePanel onClose={() => setIsSheetOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* 4. Área Principal (Flashcard) */}
      <main className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 flex flex-col items-center justify-center min-h-0">
         
         <div className="flex-1 w-full flex items-center justify-center min-h-[400px] mb-8 relative max-w-3xl">
            {/* Botón Previous (Desktop Flotante) */}
             <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex absolute -left-16 top-1/2 -translate-y-1/2 h-16 w-16 rounded-full text-muted-foreground hover:bg-background/50 hover:text-foreground transition-all"
                onClick={() => { playClick(); previousCard(); }}
                disabled={currentIndex === 0}
              >
                <span className="text-4xl">‹</span>
              </Button>

            <Flashcard
                card={currentCard}
                isFlipped={isFlipped}
                onFlip={() => {
                  playFlashcardFlip();
                  flipCard();
                }}
              />

             {/* Botón Next (Desktop Flotante) */}
             <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 h-16 w-16 rounded-full text-muted-foreground hover:bg-background/50 hover:text-foreground transition-all"
                onClick={() => { playClick(); nextCard(); }}
                disabled={currentIndex === totalCards - 1}
              >
                <span className="text-4xl">›</span>
              </Button>
         </div>

         {/* 5. Controles Inferiores (Barra Flotante) */}
         <div className="flex flex-col sm:flex-row items-center justify-center gap-4 bg-background/80 backdrop-blur-lg rounded-2xl p-3 shadow-lg border border-border/50 max-w-2xl w-full">
              
              <div className="flex gap-2 w-full sm:w-auto justify-center">
                <Button variant="outline" size="sm" onClick={handleShuffle} title={t('study.ui.shuffle')} className="flex-1 sm:flex-none">
                  🔀 <span className="sm:hidden ml-2">{t('study.ui.shuffle')}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset} title={t('study.ui.reset')} className="flex-1 sm:flex-none">
                  🔄 <span className="sm:hidden ml-2">{t('study.ui.reset')}</span>
                </Button>
              </div>

              {/* Paginación Mobile (Flechas) */}
              <div className="flex md:hidden items-center justify-between w-full gap-4">
                <Button
                  onClick={() => { playClick(); previousCard(); }}
                  disabled={currentIndex === 0}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                >
                  ←
                </Button>
                <span className="text-sm font-medium text-muted-foreground">
                  {currentIndex + 1} / {totalCards}
                </span>
                <Button
                  onClick={() => { playClick(); nextCard(); }}
                  disabled={currentIndex === totalCards - 1}
                  variant="outline"
                  size="icon"
                  className="h-10 w-10"
                >
                  →
                </Button>
              </div>

              <div className="h-6 w-px bg-border hidden sm:block"></div>

              <Button
                onClick={() => {
                  if (currentCard) {
                    playClick();
                    toggleMark(currentCard.id);
                  }
                }}
                variant={currentCard && markedCards.has(currentCard.id) ? "default" : "secondary"}
                className={`w-full sm:w-auto transition-all ${
                    currentCard && markedCards.has(currentCard.id) 
                    ? "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600" 
                    : "hover:bg-accent"
                }`}
              >
                {currentCard && markedCards.has(currentCard.id) ? '★' : '☆'} 
                <span className="ml-2">{t('study.ui.mark')}</span>
              </Button>
            </div>
      </main>

      {/* Modal Salir */}
      <Modal
        isOpen={showExitModal}
        onClose={() => setShowExitModal(false)}
        title={t('study.modals.exit.title')}
        size="md"
      >
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            {t('study.modals.exit.text')}
          </p>
          <div className="flex gap-3 justify-end pt-4">
            <CommonButton variant="secondary" onClick={() => setShowExitModal(false)}>
              {t('study.modals.exit.cancel')}
            </CommonButton>
            <CommonButton
              variant="primary"
              onClick={handleExit}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {t('study.modals.exit.confirm')}
            </CommonButton>
          </div>
        </div>
      </Modal>

      {/* Shortcuts Help (Desktop) */}
      <div className="fixed bottom-4 right-4 hidden xl:block z-50">
        <div className="bg-popover/90 text-popover-foreground text-xs rounded-lg p-3 shadow-lg border border-border backdrop-blur hover:opacity-100 transition-opacity">
          <div className="font-bold mb-2">⌨️ {t('exam.shortcuts.title') || "Atajos"}:</div>
          <div className="space-y-1 text-muted-foreground">
            <div className="flex justify-between gap-4"><span>← →</span> <span>Navegar</span></div>
            <div className="flex justify-between gap-4"><span>Espacio</span> <span>Girar</span></div>
            <div className="flex justify-between gap-4"><span>M</span> <span>Marcar</span></div>
          </div>
        </div>
      </div>

    </div>
  );
}