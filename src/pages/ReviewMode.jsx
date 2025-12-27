import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useSwipe } from '@/hooks/useSwipe';
import { Button, Loading, Modal } from '@/components/common';
import { useSoundContext } from '@/context/SoundContext';
import { useLanguage } from '@/context/LanguageContext';
import { ImmersiveHeader } from '@/components/layout';
import QuestionCard from '@/components/exam/QuestionCard';
import { QuestionNavigator } from '@/components/exam';
import MobileSettingsMenu from '@/components/layout/MobileSettingsMenu';
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export default function ReviewMode() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const results = location.state?.results;
  const { t } = useLanguage();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterMode, setFilterMode] = useState('all');
  const [isMobileNavigatorOpen, setIsMobileNavigatorOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { playClick } = useSoundContext();

  useEffect(() => {
    window.scrollTo(0, 0);
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, []);

  useSwipe(
    () => nextQuestion(),
    () => previousQuestion(),
    null,
    () => {} 
  );

  useEffect(() => {
    if (!results) { navigate('/'); }
  }, [results, navigate]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      switch(e.key) {
        case 'ArrowLeft': e.preventDefault(); previousQuestion(); break;
        case 'ArrowRight': e.preventDefault(); nextQuestion(); break;
        case 'Escape': e.preventDefault(); navigate(`/results/${subjectId}`, { state: { results } }); break;
        default: break;
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, results, navigate, subjectId]);

  if (!results) return <Loading fullScreen />;

  const questions = results.questions || [];
  const answers = results.answers || {};

  const filteredQuestionsIndices = useMemo(() => {
    return questions.map((q, index) => {
        const userAnswer = answers[q.id];
        const isAnswered = userAnswer !== undefined;
        const isCorrect = isAnswered && userAnswer === q.correct;
        let matches = true;
        if (filterMode === 'correct') matches = isCorrect;
        if (filterMode === 'incorrect') matches = isAnswered && !isCorrect;
        if (filterMode === 'unanswered') matches = !isAnswered;
        return matches ? index : -1;
    }).filter(index => index !== -1);
  }, [questions, answers, filterMode]);

  const currentRealIndex = filteredQuestionsIndices[currentIndex];
  const currentQuestion = questions[currentRealIndex];
  const userAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  const nextQuestion = () => {
    if (currentIndex < filteredQuestionsIndices.length - 1) {
      playClick();
      setCurrentIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentIndex > 0) {
      playClick();
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleFilterChange = (mode) => {
    playClick();
    setFilterMode(mode);
    setCurrentIndex(0);
  };

  const ReviewSidePanel = ({ onClose }) => (
    <div className="flex flex-col h-full w-full p-6 bg-background">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
           <span className="text-xl">🔍</span>
           <h3 className="font-bold text-lg text-foreground">{t('review.title')}</h3>
        </div>
        <Button variant="ghost" size="icon" onClick={() => { playClick(); if (onClose) onClose(); }} className="h-9 w-9 rounded-full text-foreground hover:bg-destructive/10 hover:text-destructive">
          <span className="text-2xl font-light leading-none">×</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0 custom-scrollbar pr-2 -mr-2">
          <QuestionNavigator
            questions={questions}
            currentIndex={currentRealIndex}
            answers={answers}
            reviewedQuestions={new Set()}
            onGoToQuestion={(realIndex) => {
                playClick();
                const filterIndex = filteredQuestionsIndices.indexOf(realIndex);
                if (filterIndex !== -1) { setCurrentIndex(filterIndex); } 
                else { setFilterMode('all'); setCurrentIndex(realIndex); }
                if (onClose) onClose();
            }}
            variant="sidebar"
          />
      </div>
    </div>
  );

  if (!currentQuestion) {
    return (
        <div className="h-[100dvh] flex items-center justify-center bg-background">
            <div className="text-center p-6">
                <p className="text-muted-foreground mb-4">No hay preguntas en este filtro.</p>
                <Button onClick={() => setFilterMode('all')}>Ver todas</Button>
            </div>
        </div>
    );
  }

  const countCorrect = results.correctAnswers;
  const countIncorrect = results.totalQuestions - results.correctAnswers - (results.totalQuestions - Object.keys(answers).length);
  const countUnanswered = results.totalQuestions - Object.keys(answers).length;

  return (
    <div className="h-[100dvh] flex flex-col bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300 overflow-hidden">
      
      <ImmersiveHeader showControls={false}>
        <div className="flex items-center gap-2">
            <Sheet open={isMobileNavigatorOpen} onOpenChange={setIsMobileNavigatorOpen}>
                <SheetTrigger asChild>
                    <Button variant="ghost" size="icon" className="lg:hidden text-foreground">
                    <span className="text-xl">🗂️</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0 [&>button]:hidden flex flex-col gap-0 border-t-0">
                    <ReviewSidePanel onClose={() => setIsMobileNavigatorOpen(false)} />
                </SheetContent>
            </Sheet>
            <div className="lg:hidden"><MobileSettingsMenu /></div>
            <Button variant="secondary" size="sm" onClick={() => navigate(`/results/${subjectId}`, { state: { results } })} className="hidden sm:flex gap-2">← {t('common.results')}</Button>
            <Button variant="secondary" size="sm" onClick={() => navigate(`/results/${subjectId}`, { state: { results } })} className="sm:hidden ml-1">←</Button>
        </div>
      </ImmersiveHeader>
      
      {/* ✅ UX FIX: BARRA DE FILTROS MEJORADA */}
      <div className="flex-shrink-0 bg-background/95 backdrop-blur-md border-b border-border shadow-sm z-30 sticky top-0">
        <div className="max-w-7xl mx-auto px-4 py-3">
            {/* ✅ UX FIX: Clases para ocultar scrollbar (scrollbar-hide es común en tailwind plugins, si no funciona, añadimos estilo inline) */}
            <div 
                className="flex items-center gap-3 overflow-x-auto pb-1 mask-right scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} /* Fallback para Firefox/IE */
            >
                {/* ✅ UX FIX: Eliminado border-r duro, confiamos en el mask-right para la separación */}
                <div className="flex-shrink-0 pr-3 mr-1">
                    <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground leading-none mb-1">
                            {t('review.score')}
                        </span>
                        <span className={`text-lg font-black leading-none ${results.score >= 70 ? "text-green-600 dark:text-green-400" : "text-orange-600 dark:text-orange-400"}`}>
                            {results.score.toFixed(0)}%
                        </span>
                    </div>
                </div>

                <div className="flex gap-2">
                    {[
                        { id: 'all', label: t('review.filters.all'), icon: '📋', count: questions.length, activeClass: 'bg-indigo-600 text-white border-indigo-600' },
                        { id: 'correct', label: t('review.filters.correct'), icon: '✅', count: countCorrect, activeClass: 'bg-green-600 text-white border-green-600' },
                        { id: 'incorrect', label: t('review.filters.incorrect'), icon: '❌', count: countIncorrect, activeClass: 'bg-red-600 text-white border-red-600' },
                        { id: 'unanswered', label: t('review.filters.unanswered'), icon: '⚪', count: countUnanswered, activeClass: 'bg-gray-600 text-white border-gray-600' }
                    ].map(filter => (
                        <button
                            key={filter.id}
                            onClick={() => handleFilterChange(filter.id)}
                            className={`
                                flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border
                                ${filterMode === filter.id 
                                    ? filter.activeClass 
                                    : 'bg-background text-muted-foreground border-border hover:bg-accent'
                                }
                            `}
                        >
                            <span className="text-sm">{filter.icon}</span>
                            <span className="hidden sm:inline">{filter.label}</span>
                            {/* ✅ UX FIX: Aumentado margen del contador (ml-2) */}
                            <span className={`ml-2 text-[10px] px-1.5 py-0.5 rounded-full ${
                                filterMode === filter.id ? 'bg-white/20 text-white' : 'bg-secondary text-foreground'
                            }`}>
                                {filter.count}
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
      </div>

      <main className="flex-1 w-full max-w-4xl mx-auto px-0 sm:px-4 flex flex-col items-center relative min-h-0 overflow-y-auto custom-scrollbar">
          <div className="w-full py-4 px-4 sm:px-0">
            <QuestionCard
                question={currentQuestion}
                currentIndex={currentRealIndex}
                totalQuestions={questions.length}
                onSelectAnswer={() => {}} 
                selectedAnswer={userAnswer}
                showFeedback={true}
                mode="practice"
            />
          </div>
      </main>

      <div className="flex-shrink-0 bg-background border-t border-border p-3 pb-6 sm:pb-3 z-30 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
         <div className="max-w-3xl mx-auto flex items-center gap-3">
            <Button 
                onClick={previousQuestion} 
                disabled={currentIndex === 0}
                variant="outline" 
                className="flex-1 h-12 text-base font-semibold border-gray-300 dark:border-gray-600 bg-background hover:bg-accent text-foreground"
            >
                ← {t('common.back')}
            </Button>
            <div className="text-xs font-mono text-muted-foreground px-2">
                {currentIndex + 1} / {filteredQuestionsIndices.length}
            </div>
            <Button 
                onClick={nextQuestion} 
                disabled={currentIndex === filteredQuestionsIndices.length - 1}
                className="flex-1 h-12 text-base font-bold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
            >
                {t('common.next')} →
            </Button>
         </div>
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetTrigger asChild>
           <div className="hidden lg:flex items-center justify-center fixed top-1/2 -translate-y-1/2 right-0 z-40 h-36 w-10 px-1 py-4 bg-card border-l border-y border-border rounded-l-lg shadow-lg cursor-pointer hover:bg-accent hover:w-12 transition-all group">
            <span className="[writing-mode:vertical-rl] text-sm font-medium tracking-wide flex items-center gap-2 group-hover:text-primary">
                <span className="text-base rotate-90">🗂️</span> {t('common.navigator')}
            </span>
          </div>
        </SheetTrigger>
        <SheetContent side="right" className="w-[400px] p-0 [&>button]:hidden flex flex-col gap-0 border-l border-border">
            <ReviewSidePanel onClose={() => setIsSheetOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}