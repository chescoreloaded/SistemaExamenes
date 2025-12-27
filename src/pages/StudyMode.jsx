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
import MobileSettingsMenu from '@/components/layout/MobileSettingsMenu'; // ✅ IMPORTAR NUEVO

// Shadcn UI Components
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

  // ... (Atajos de teclado se mantienen igual)
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

  const handleShuffle = async () => { /* ... */ shuffle(); };
  const handleReset = async () => { /* ... */ reset(); };

  // Componente Panel Lateral (Igual que antes)
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
                  <div className="flex justify-between"><span>Total:</span><span className="font-mono font-bold">{totalCards}</span></div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden"><div className="h-full bg-primary" style={{ width: `${(studiedCards.size / totalCards) * 100}%` }}></div></div>
                  <div className="grid grid-cols-2 gap-4 pt-2">
                    <div className="bg-green-500/10 p-2 rounded text-center"><span className="block text-xs text-green-600">Estudiadas</span><span className="font-bold text-green-700">{studiedCards.size}</span></div>
                    <div className="bg-yellow-500/10 p-2 rounded text-center"><span className="block text-xs text-yellow-600">Marcadas</span><span className="font-bold text-yellow-700">{markedCards.size}</span></div>
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
      
      {/* 1. HEADER GLOBAL */}
      <ImmersiveHeader showControls={false}>
        <div className="flex items-center gap-1 sm:gap-2">

            {/* A. ESCRITORIO: Controles Completos */}
            <div className="hidden lg:flex">
               <HeaderControls />
            </div>
            
            {/* B. MÓVIL: Botón Navegador */}
            <Sheet open={isMobileNavigatorOpen} onOpenChange={setIsMobileNavigatorOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden text-foreground">
                    <span className="text-xl">🗂️</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 [&>button]:hidden flex flex-col gap-0 border-t-0">
                    <StudySidePanel onClose={() => setIsMobileNavigatorOpen(false)} />
                </SheetContent>
            </Sheet>

            {/* C. MÓVIL: Menú Engranaje (COMPONENTE REUTILIZABLE) */}
            <div className="lg:hidden">
              {/* ✅ AQUÍ ESTÁ LA SOLUCIÓN REUTILIZABLE */}
              <MobileSettingsMenu onExit={() => setShowExitModal(true)} />
            </div>

            {/* D. Salir (Botón Desktop) */}
            <Button variant="secondary" size="sm" onClick={() => setShowExitModal(true)} className="hidden sm:flex gap-2 ml-2">
               ← {t('common.exit')}
            </Button>
        </div>
      </ImmersiveHeader>

      {/* ... (Resto del código idéntico: Barra de Contexto, Main, Footer, Modales) ... */}
      <div className="flex-shrink-0 bg-background/60 backdrop-blur-md border-b border-border z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-start gap-3 mb-2">
                <span className="text-2xl flex-shrink-0 mt-0.5 filter drop-shadow-sm">{subjectIcon}</span>
                <div className="min-w-0 flex-1">
                    <h1 className="text-sm font-bold text-foreground leading-tight line-clamp-2">
                        {subjectName}
                    </h1>
                </div>
                <div className="hidden sm:block ml-auto">
                    <SaveIndicator status={saveStatus} />
                </div>
            </div>

            <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-pink-500 transition-all duration-300"
                        style={{ width: `${((currentIndex + 1) / totalCards) * 100}%` }}
                    />
                </div>
                <span className="text-[10px] font-mono text-muted-foreground whitespace-nowrap min-w-[3rem] text-right">
                    {currentIndex + 1} / {totalCards}
                </span>
            </div>
          </div>
      </div>

      <main className="flex-1 w-full max-w-5xl mx-auto px-4 flex flex-col items-center justify-center relative min-h-0">
         <div className="w-full flex-1 flex items-center justify-center max-h-[600px] relative">
            <Button variant="ghost" size="icon" className="hidden md:flex absolute -left-16 top-1/2 -translate-y-1/2 h-16 w-16 rounded-full text-muted-foreground hover:bg-white/10 transition-colors" onClick={() => { playClick(); previousCard(); }} disabled={currentIndex === 0}><span className="text-4xl">‹</span></Button>
            <Button variant="ghost" size="icon" className="hidden md:flex absolute -right-16 top-1/2 -translate-y-1/2 h-16 w-16 rounded-full text-muted-foreground hover:bg-white/10 transition-colors" onClick={() => { playClick(); nextCard(); }} disabled={currentIndex === totalCards - 1}><span className="text-4xl">›</span></Button>
            <Flashcard card={currentCard} isFlipped={isFlipped} onFlip={() => { playFlashcardFlip(); flipCard(); }} />
         </div>
      </main>

      <div className="flex-shrink-0 bg-background border-t border-border p-3 pb-6 sm:pb-3 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
         <div className="max-w-2xl mx-auto flex flex-col sm:flex-row items-center gap-3">
              <div className="flex gap-2 w-full sm:w-auto justify-center sm:justify-start">
                <Button variant="outline" size="sm" onClick={handleShuffle} className="flex-1 sm:flex-none border-border hover:bg-accent text-foreground">
                  🔀 <span className="ml-2 sm:hidden xl:inline">{t('study.ui.shuffle')}</span>
                </Button>
                <Button variant="outline" size="sm" onClick={handleReset} className="flex-1 sm:flex-none border-border hover:bg-accent text-foreground">
                  🔄 <span className="ml-2 sm:hidden xl:inline">{t('study.ui.reset')}</span>
                </Button>
              </div>
              <div className="flex md:hidden items-center justify-between w-full gap-3">
                <Button onClick={() => { playClick(); previousCard(); }} disabled={currentIndex === 0} variant="outline" size="icon" className="h-12 w-16 border-border bg-background hover:bg-accent text-foreground text-xl">←</Button>
                <Button onClick={() => { if (currentCard) { playClick(); toggleMark(currentCard.id); } }} variant={currentCard && markedCards.has(currentCard.id) ? "default" : "outline"} className={`flex-1 h-12 text-base font-medium transition-all ${currentCard && markedCards.has(currentCard.id) ? "bg-yellow-500 hover:bg-yellow-600 text-white border-yellow-600 shadow-md" : "border-border bg-background hover:bg-accent text-foreground"}`}>
                  {currentCard && markedCards.has(currentCard.id) ? '★ Marcada' : '☆ Marcar'}
                </Button>
                <Button onClick={() => { playClick(); nextCard(); }} disabled={currentIndex === totalCards - 1} variant="outline" size="icon" className="h-12 w-16 border-border bg-background hover:bg-accent text-foreground text-xl">→</Button>
              </div>
              <Button onClick={() => { if (currentCard) { playClick(); toggleMark(currentCard.id); } }} variant={currentCard && markedCards.has(currentCard.id) ? "default" : "secondary"} className={`hidden sm:flex ml-auto ${currentCard && markedCards.has(currentCard.id) ? "bg-yellow-500 text-white hover:bg-yellow-600" : ""}`}>
                {currentCard && markedCards.has(currentCard.id) ? '★' : '☆'} <span className="ml-2">{t('study.ui.mark')}</span>
              </Button>
         </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
           <div className="hidden lg:flex items-center justify-center fixed top-1/2 -translate-y-1/2 right-0 z-40 h-36 w-10 px-1 py-4 bg-card border-l border-y border-border rounded-l-lg shadow-lg cursor-pointer hover:bg-accent hover:w-12 transition-all group">
            <span className="[writing-mode:vertical-rl] text-sm font-medium tracking-wide flex items-center gap-2 group-hover:text-primary"><span className="text-base rotate-90">🗂️</span> {t('study.ui.navigatorTitle')}</span>
          </div>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] p-0 [&>button]:hidden flex flex-col gap-0 border-l border-border"><StudySidePanel onClose={() => setIsSheetOpen(false)} /></SheetContent>
      </Sheet>

{/* Modal Salir - Diseño "Solid Alert" (Mejorado UX) */}
      <Modal 
        isOpen={showExitModal} 
        onClose={() => setShowExitModal(false)}
        showCloseButton={false} 
        title={null}
        size="sm"
      >
        <div className="flex flex-col items-center text-center p-3">
            
            {/* 1. Icono Semántico Correcto (Advertencia) */}
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-5 ring-8 ring-amber-50 dark:ring-amber-900/10">
                {/* Usamos 'text-3xl' para que el emoji se vea nítido */}
                <span className="text-3xl filter drop-shadow-sm">⚠️</span> 
            </div>

            {/* 2. Título con más peso */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {t('study.modals.exit.title').replace(/⚠️/g, '').trim()}
            </h3>
            
            {/* 3. Texto descriptivo más oscuro (Mejor lectura en modo claro) */}
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-8 leading-relaxed px-4">
                {t('study.modals.exit.text')}
            </p>

            {/* 4. Botones "Sólidos" para evitar el efecto 'lavado' */}
            <div className="flex gap-3 w-full">
                <Button 
                    onClick={() => setShowExitModal(false)}
                    // Cambio UX: Fondo gris sólido en lugar de borde transparente
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-200 border-0 font-semibold"
                >
                    {t('study.modals.exit.cancel')}
                </Button>
                
                <Button
                    onClick={handleExit}
                    // Cambio UX: Rojo intenso para la acción destructiva
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md shadow-red-500/20"
                >
                    {t('study.modals.exit.confirm')}
                </Button>
            </div>
        </div>
      </Modal>
    </div>
  );
}