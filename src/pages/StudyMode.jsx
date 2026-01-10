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
import { HeaderControls } from '@/components/layout/HeaderControls';
import MobileSettingsMenu from '@/components/layout/MobileSettingsMenu';

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function StudyMode() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage(); 
  
  // Estados de UI
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false); 
  const [isMobileNavigatorOpen, setIsMobileNavigatorOpen] = useState(false);

  const { playClick, playFlashcardFlip } = useSoundContext();

  const {
    cards, currentCard, isFlipped, currentIndex, totalCards, loading, error,
    subjectName, subjectIcon, markedCards, studiedCards, saveStatus, sessionId,
    flipCard, nextCard, previousCard, goToCard, shuffle, reset, toggleMark
  } = useFlashcards(subjectId, language);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useSwipe(
    () => { if(currentIndex < totalCards - 1) { playClick(); nextCard(); } },
    () => { if(currentIndex > 0) { playClick(); previousCard(); } },
    () => { playFlashcardFlip(); flipCard(); },
    () => {} 
  );

  useEffect(() => {
    const handleKeyPress = (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        switch(e.key) {
            case 'ArrowLeft': e.preventDefault(); if (currentIndex > 0) { playClick(); previousCard(); } break;
            case 'ArrowRight': e.preventDefault(); if (currentIndex < totalCards - 1) { playClick(); nextCard(); } break;
            case ' ': case 'Enter': e.preventDefault(); playFlashcardFlip(); flipCard(); break;
            case 's': case 'S': e.preventDefault(); handleShuffle(); break;
            case 'm': case 'M': e.preventDefault(); if (currentCard) { playClick(); toggleMark(currentCard.id); } break;
            case 'Escape': e.preventDefault(); setShowExitModal(true); break;
            default: break;
        }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [flipCard, nextCard, previousCard, shuffle, currentCard, toggleMark, playClick, currentIndex, totalCards]);


  const handleExit = async () => {
    if (sessionId) {
      try { await dbManager.deleteFlashcardProgress(sessionId); } catch (error) { console.error(error); }
    }
    navigate('/');
  };

  const handleShuffle = async () => { 
      playClick();
      shuffle(); 
  };
  
  const handleReset = async () => { 
      playClick();
      reset(); 
  };

  const StudySidePanel = ({ onClose }) => (
    <div className="flex flex-col h-full w-full p-6 bg-background">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
           <span className="text-xl">🗂️</span>
           <h3 className="font-bold text-lg text-foreground">{t('study.ui.panelTitle')}</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={() => { playClick(); if (onClose) onClose(); }} className="h-9 w-9 rounded-full text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors">
          <span className="text-2xl font-light leading-none">×</span>
        </Button>
      </div>
      <Tabs defaultValue="navigator" className="flex-1 flex flex-col min-h-0">
        <TabsList className="grid w-full grid-cols-2 mb-4 bg-muted/50 p-1">
            <TabsTrigger value="navigator">{t('study.ui.navigatorTitle')}</TabsTrigger>
            <TabsTrigger value="info">Info</TabsTrigger>
        </TabsList>
        <TabsContent value="navigator" className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2 -mr-2">
          <FlashcardNavigator cards={cards} currentIndex={currentIndex} markedCards={markedCards} studiedCards={studiedCards} onGoToCard={(index) => { playClick(); goToCard(index); if (onClose) onClose(); }} variant="sidebar" />
        </TabsContent>
        <TabsContent value="info" className="space-y-4 overflow-y-auto custom-scrollbar pr-2">
           <div className="bg-muted/30 p-4 rounded-lg border border-border/50">
              <h4 className="font-semibold mb-3 text-sm uppercase text-muted-foreground">📊 {t('study.ui.progress')}</h4>
              <div className="space-y-3 text-sm">
                  <div className="flex justify-between"><span>{t('common.total')}:</span><span className="font-mono font-bold">{totalCards}</span></div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${(studiedCards.size / totalCards) * 100}%` }}></div></div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-green-500/10 p-2 rounded text-center"><span className="block text-xs text-green-600">{t('study.ui.cardStudied')}</span><span className="font-bold text-green-700">{studiedCards.size}</span></div>
                    <div className="bg-yellow-500/10 p-2 rounded text-center"><span className="block text-xs text-yellow-600">{t('study.ui.cardMarked')}</span><span className="font-bold text-yellow-700">{markedCards.size}</span></div>
                  </div>
              </div>
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );

  if (loading) return <div className="h-screen flex items-center justify-center bg-background"><Loading text={t('common.loading')} /></div>;
  if (error) return <div className="h-screen flex items-center justify-center bg-background"><div className="text-center p-6"><h2 className="text-2xl font-bold mb-4">⚠️ Error</h2><p className="mb-6">{error}</p><Button onClick={handleExit}>{t('results.actions.home')}</Button></div></div>;

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900 dark:to-pink-900 overflow-hidden">
      
      {/* 1. BARRA SUPERIOR: Logo y Controles Globales */}
      <ImmersiveHeader showControls={false}>
        {/* Al no pasar leftSlot, se muestra el Logo por defecto */}
        
        {/* Controles Derecha */}
        <div className="hidden sm:block"><SaveIndicator status={saveStatus} /></div>
        
        <Sheet open={isMobileNavigatorOpen} onOpenChange={setIsMobileNavigatorOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-gray-800">
                    <span className="text-lg">🗂️</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 [&>button]:hidden flex flex-col gap-0 border-t-0">
                <StudySidePanel onClose={() => setIsMobileNavigatorOpen(false)} />
            </SheetContent>
        </Sheet>

        <MobileSettingsMenu onExit={() => setShowExitModal(true)} />

        <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setShowExitModal(true)}
            className="h-9 w-9 text-gray-400 hover:text-red-600 hover:bg-red-50 ml-1"
        >
            <span className="text-xl">✕</span>
        </Button>
      </ImmersiveHeader>

      {/* 2. CONTEXT BAR: Info del Curso y Progreso */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur-md border-b border-border shadow-sm z-30 px-4 py-3">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
             
             {/* Info Izquierda */}
             <div className="flex items-center gap-3 min-w-0">
                <span className="text-2xl flex-shrink-0 filter drop-shadow-sm">{subjectIcon}</span>
                <div className="min-w-0">
                    <h1 className="text-sm font-bold text-foreground leading-tight line-clamp-1">
                        {subjectName}
                    </h1>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                        <span className="font-semibold text-indigo-500">{t('home.modes.study.title')}</span>
                        <span className="opacity-50">|</span>
                        <span>{currentIndex + 1} / {totalCards}</span>
                    </div>
                </div>
             </div>

             {/* Barra de Progreso */}
             <div className="flex items-center gap-3 w-full sm:w-auto mt-1 sm:mt-0">
                <div className="flex-1 sm:w-32 h-2 bg-secondary rounded-full overflow-hidden border border-border">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
                    />
                </div>
                <span className="text-xs font-mono font-bold text-muted-foreground">
                    {Math.round(((currentIndex + 1) / totalCards) * 100)}%
                </span>
             </div>
          </div>
      </div>

      {/* 3. MAIN AREA */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 flex flex-col items-center justify-center relative min-h-0">
         <div className="w-full flex-1 flex items-center justify-center max-h-[600px] relative">
            {/* Flechas flotantes Desktop */}
            <Button variant="ghost" size="icon" className="hidden md:flex absolute -left-16 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full text-muted-foreground hover:bg-white/20 hover:text-white transition-all border-2 border-transparent hover:border-white/20" onClick={() => { playClick(); previousCard(); }} disabled={currentIndex === 0}><span className="text-3xl">‹</span></Button>
            <Button variant="ghost" size="icon" className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 h-14 w-14 rounded-full text-muted-foreground hover:bg-white/20 hover:text-white transition-all border-2 border-transparent hover:border-white/20" onClick={() => { playClick(); nextCard(); }} disabled={currentIndex === totalCards - 1}><span className="text-3xl">›</span></Button>
            
            <Flashcard card={currentCard} isFlipped={isFlipped} onFlip={() => { playFlashcardFlip(); flipCard(); }} />
         </div>
      </main>

      {/* 4. FOOTER SIMÉTRICO (Grid 5 Columnas) */}
      <div className="flex-shrink-0 bg-background border-t border-border p-4 z-30 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
         <div className="max-w-3xl mx-auto">
            
            {/* GRID DE ACCIONES PRINCIPALES */}
            <div className="grid grid-cols-5 gap-3 h-14 mb-3">
                {/* ANTERIOR (2/5) */}
                <Button 
                    onClick={() => { playClick(); previousCard(); }} 
                    disabled={currentIndex === 0} 
                    variant="outline" 
                    className="col-span-2 h-full rounded-2xl border-2 border-border text-muted-foreground hover:text-foreground hover:border-primary/50 bg-background disabled:opacity-40 p-0 flex items-center justify-center gap-2"
                >
                    <span className="text-xl">←</span>
                    <span className="text-sm font-bold">{t('common.back')}</span>
                </Button>
                
                {/* MARCAR (1/5) */}
                <Button 
                    onClick={() => { if (currentCard) { playClick(); toggleMark(currentCard.id); } }} 
                    className={`col-span-1 h-full rounded-2xl border-2 font-bold transition-all p-0 flex flex-col items-center justify-center
                      ${currentCard && markedCards.has(currentCard.id) 
                        ? "bg-yellow-500 border-yellow-600 text-white shadow-sm" 
                        : "bg-background border-border text-muted-foreground hover:border-yellow-500 hover:text-yellow-500"}
                    `}
                >
                    <span className="text-2xl leading-none mb-0.5">{currentCard && markedCards.has(currentCard.id) ? '★' : '☆'}</span>
                </Button>
                
                {/* SIGUIENTE (2/5) */}
                <Button 
                    onClick={() => { playClick(); nextCard(); }} 
                    disabled={currentIndex === totalCards - 1} 
                    className="col-span-2 h-full rounded-2xl bg-foreground text-background hover:opacity-90 shadow-lg border-2 border-transparent font-bold flex items-center justify-center gap-2"
                >
                    <span className="text-sm">{t('common.next')}</span>
                    <span className="text-xl">→</span>
                </Button>
            </div>

            {/* ACCIONES SECUNDARIAS (Links de texto) */}
            <div className="flex justify-center gap-8">
                <button onClick={handleShuffle} className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors py-2 px-4 rounded-full hover:bg-secondary/50">
                   🔀 {t('study.ui.shuffle')}
                </button>
                <button onClick={handleReset} className="text-xs font-semibold text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors py-2 px-4 rounded-full hover:bg-secondary/50">
                   🔄 {t('study.ui.reset')}
                </button>
            </div>
         </div>
      </div>

      {/* MODAL SALIR REDISEÑADO ("Clean Alert") */}
      <Modal 
        isOpen={showExitModal} 
        onClose={() => setShowExitModal(false)}
        showCloseButton={false} 
        title={null}
        size="sm"
      >
        <div className="flex flex-col items-center text-center p-6 bg-white dark:bg-gray-900 rounded-xl">
            
            {/* 1. Icono Anclado */}
            <div className="mb-5 p-4 rounded-full bg-amber-50 dark:bg-amber-900/20 ring-8 ring-amber-50/50 dark:ring-amber-900/10">
                <span className="text-3xl filter drop-shadow-sm">⚠️</span> 
            </div>

            {/* 2. Título Traducido */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('study.modals.exit.title').replace(/⚠️/g, '').trim()}
            </h3>
            
            {/* 3. Texto Traducido */}
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-8 leading-relaxed px-2">
                {t('study.modals.exit.text')}
            </p>

            {/* 4. Botones Balanceados */}
            <div className="flex gap-3 w-full">
                <Button 
                    onClick={() => setShowExitModal(false)}
                    className="flex-1 h-12 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 border-0 font-semibold transition-all"
                >
                    {t('study.modals.exit.cancel')}
                </Button>
                
                <Button
                    onClick={handleExit}
                    className="flex-1 h-12 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md shadow-red-500/20 dark:shadow-none transition-all"
                >
                    {t('study.modals.exit.confirm')}
                </Button>
            </div>
        </div>
      </Modal>
    </div>
  );
}