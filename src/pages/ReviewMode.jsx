import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSwipe } from '@/hooks/useSwipe';
import { Button, Loading, Modal } from '@/components/common';
import { useSoundContext } from '@/context/SoundContext';
import { useLanguage } from '@/context/LanguageContext';
import { ImmersiveHeader } from '@/components/layout';

export default function ReviewMode() {
  const { subjectId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const results = location.state?.results;
  const { t } = useLanguage();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterMode, setFilterMode] = useState('all');
  const [showNavigatorModal, setShowNavigatorModal] = useState(false); // ✅ Reemplaza showNavigator

  const { playClick } = useSoundContext();

  // ✅ ARREGLO DE SCROLL (Problema 2)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []); // Se ejecuta solo una vez al cargar el componente

  useSwipe(
    () => nextQuestion(),
    () => previousQuestion(),
    null,
    () => {} // ✅ ARREGLO DE GESTOS: Quitamos el swipe-down
  );

  useEffect(() => {
    if (!results) {
      navigate('/');
    }
  }, [results, navigate]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      switch(e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          previousQuestion();
          break;
        case 'ArrowRight':
          e.preventDefault();
          nextQuestion();
          break;
        case 'Escape':
          e.preventDefault();
          navigate(`/results/${subjectId}`, { state: { results } });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, filterMode, results, navigate, subjectId]);

  if (!results) return <Loading fullScreen />;

  const questions = results.questions || [];
  const answers = results.answers || {};

  const filteredQuestions = useMemo(() => questions.filter((q) => {
    const userAnswer = answers[q.id];
    const isAnswered = userAnswer !== undefined;
    const isCorrect = isAnswered && userAnswer === q.correct;

    switch(filterMode) {
      case 'correct': return isCorrect;
      case 'incorrect': return isAnswered && !isCorrect;
      case 'unanswered': return !isAnswered;
      default: return true;
    }
  }), [questions, answers, filterMode]);

  const currentQuestion = filteredQuestions[currentIndex];
  const userAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isAnswered = userAnswer !== undefined;
  const isCorrect = isAnswered && userAnswer === currentQuestion?.correct;

  // --- Funciones de Navegación (CON SONIDO) ---
  const nextQuestion = () => {
    if (currentIndex < filteredQuestions.length - 1) {
      playClick();
      setCurrentIndex(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentIndex > 0) {
      playClick();
      setCurrentIndex(prev => prev - 1); // Corregido
    }
  };

  const goToQuestion = (index) => {
    playClick();
    setCurrentIndex(index);
    setShowNavigatorModal(false); // Para móvil
  };
  // ---------------------------------------------

  const handleFilterChange = (mode) => {
    playClick();
    setFilterMode(mode);
    setCurrentIndex(0);
  };

  // Componente interno para el navegador (reutilizable)
  const NavigatorContent = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-4 lg:p-6 border-2 border-gray-100 dark:border-gray-700">
      <h3 className="font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2 text-base lg:text-lg">
        <span className="text-xl lg:text-2xl">🗂️</span>
        {t('review.nav.title')} ({filteredQuestions.length} {t('review.nav.pregs')})
      </h3>

      <div className="grid grid-cols-5 gap-2 mb-4 max-h-64 lg:max-h-96 overflow-y-auto">
        {filteredQuestions.map((q, index) => {
          const answer = answers[q.id];
          const answered = answer !== undefined;
          const correct = answered && answer === q.correct;
          
          let bgColor = 'bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600';
          if (index === currentIndex) {
            bgColor = 'bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-lg scale-110 ring-4 ring-indigo-300 dark:ring-indigo-600';
          } else if (correct) {
            bgColor = 'bg-gradient-to-br from-green-100 to-emerald-100 dark:from-green-800 dark:to-emerald-800 text-green-700 dark:text-green-200 border-2 border-green-400 dark:border-green-600';
          } else if (answered && !correct) {
            bgColor = 'bg-gradient-to-br from-red-100 to-pink-100 dark:from-red-800 dark:to-pink-800 text-red-700 dark:text-red-200 border-2 border-red-400 dark:border-red-600';
          } else {
            bgColor = 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-2 border-gray-300 dark:border-gray-600';
          }

          return (
            <button
              key={index}
              onClick={() => goToQuestion(index)}
              className={`aspect-square rounded-lg font-bold text-sm transition-all ${bgColor} hover:scale-105 min-h-[44px]`}
              aria-label={`Ir a pregunta ${questions.indexOf(q) + 1}`}
            >
              {questions.indexOf(q) + 1}
            </button>
          );
        })}
      </div>

      <div className="text-xs text-gray-600 dark:text-gray-300 space-y-2 pt-4 border-t dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-400"></div>
          <span className="dark:text-gray-400">{t('review.legend.correct')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-br from-red-100 to-pink-100 border-2 border-red-400"></div>
          <span className="dark:text-gray-400">{t('review.legend.incorrect')}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gray-100 border-2 border-gray-300"></div>
          <span className="dark:text-gray-400">{t('review.legend.unanswered')}</span>
        </div>
      </div>
    </div>
  );

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <ImmersiveHeader />
        <div className="flex items-center justify-center h-[80vh]">
          {/* ... (JSX de "No hay preguntas") ... */}
        </div>
      </div>
    );
  }

  return (
    // ✅ ARREGLO DE OVERFLOW (Problema 1)
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 pb-20 lg:pb-0 overflow-x-hidden">
      
      {/* 2. Usar el nuevo Header Inmersivo */}
      <ImmersiveHeader>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/results/${subjectId}`, { state: { results } })}
          className="hidden sm:flex"
        >
          ← {t('common.results')}
        </Button>
         <Button
          variant="secondary"
          size="sm"
          onClick={() => navigate(`/`)}
          className="sm:hidden"
        >
          🏠
        </Button>
      </ImmersiveHeader>
      
      {/* 3. Nueva "Cabecera de Contexto" Sticky para Filtros */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-16 md:top-20 z-20">
        <div className="max-w-7xl mx-auto px-4 py-3 lg:py-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            
            <div className="flex-shrink-0">
              <h1 className="text-xl lg:text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                🔍 {t('review.title')}
              </h1>
              <p className="text-xs lg:text-sm text-gray-600 dark:text-gray-400 mt-1">
                {results.subjectName} • {t('review.score')}: {results.score.toFixed(1)}%
              </p>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide w-full sm:w-auto mask-right">
              {/* ... (Botones de filtro) ... */}
              <button
                onClick={() => handleFilterChange('all')}
                className={`px-3 lg:px-4 py-2 rounded-lg text-xs lg:text-sm font-medium transition-all whitespace-nowrap min-h-[44px] flex-shrink-0 ${
                  filterMode === 'all'
                    ? 'bg-indigo-500 text-white shadow-md'
                    : 'bg-white dark:bg-gray-700 dark:text-gray-200 text-gray-700 border-2 border-gray-300 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500'
                }`}
              >
                {t('review.filters.all')} ({questions.length})
              </button>
              <button
                onClick={() => handleFilterChange('correct')}
                className={`px-3 lg:px-4 py-2 ... ${
                  filterMode === 'correct' ? 'bg-green-500 ...' : 'bg-white ...'
                }`}
              >
                ✅ <span className="hidden xl:inline">{t('review.filters.correct')}</span> ({results.correctAnswers})
              </button>
              <button
                onClick={() => handleFilterChange('incorrect')}
                className={`px-3 lg:px-4 py-2 ... ${
                  filterMode === 'incorrect' ? 'bg-red-500 ...' : 'bg-white ...'
                }`}
              >
                ❌ <span className="hidden xl:inline">{t('review.filters.incorrect')}</span> ({results.totalQuestions - results.correctAnswers - (results.totalQuestions - Object.keys(answers).length)})
              </button>
              <button
                onClick={() => handleFilterChange('unanswered')}
                className={`px-3 lg:px-4 py-2 ... ${
                  filterMode === 'unanswered' ? 'bg-gray-500 ...' : 'bg-white ...'
                }`}
              >
                ⚪ <span className="hidden xl:inline">{t('review.filters.unanswered')}</span> ({results.totalQuestions - Object.keys(answers).length})
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ 4. ARREGLO NAVEGADOR MÓVIL (Botón de Modal) */}
      <div className="lg:hidden px-4 mt-4">
        <button
          onClick={() => setShowNavigatorModal(true)} // <-- Cambiado
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3 px-4 rounded-xl font-semibold shadow-lg flex items-center justify-center gap-2 min-h-[44px]"
        >
          <span className="text-xl">🗂️</span>
          <span>{t('exam.ui.navigator')}</span> {/* Texto fijo */}
          <svg className={`w-5 h-5`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Navigator ASIDE (Solo para Desktop) */}
          <div className={`lg:col-span-1 order-2 lg:order-1 hidden lg:block`}>
            <div className="sticky top-40">
              <NavigatorContent />
            </div>
          </div>

          {/* Question Card */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <motion.div 
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 lg:p-6 border-2 border-gray-100 dark:border-gray-700"
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* ... (Contenido idéntico de la tarjeta de pregunta) ... */}
              <div className="flex flex-col sm:flex-row ... mb-4 pb-3 border-b-2 ...">
                 {/* ... Header ... */}
              </div>
              <div className="mb-6">
                <h2 className="text-lg ...">{currentQuestion.question}</h2>
              </div>
              <div className="space-y-3 mb-6">
                {currentQuestion.options.map((option, index) => {
                  {/* ... (Lógica de opciones) ... */}
                  return (<div key={index} className="...">...</div>)
                })}
              </div>
              <div className={`p-4 rounded-xl border-l-4 mb-6 ...`}>
                {/* ... (Banner de Status) ... */}
              </div>
              {currentQuestion.explanation && (
                <div className="bg-blue-50 dark:bg-blue-900/30 ...">
                  {/* ... (Explicación) ... */}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer Navigation (Fijo en móvil) */}
      <div className="bg-white dark:bg-gray-800 border-t-2 border-gray-200 dark:border-gray-700 fixed bottom-0 left-0 right-0 shadow-2xl z-30">
        <div className="max-w-7xl mx-auto px-4 py-3 lg:py-4">
          <div className="flex items-center justify-between gap-2 lg:gap-4">
            <button
              onClick={previousQuestion}
              disabled={currentIndex === 0}
              className="flex items-center gap-1 ... min-h-[44px]"
              // ✅ ARREGLO DE SCROLL: Quitado autoFocus
            >
              <svg className="w-4 h-4 ..." fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">{t('common.back')}</span>
            </button>

            <div className="text-center flex-1">
              <div className="text-sm font-semibold ...">
                {currentIndex + 1} de {filteredQuestions.length}
              </div>
              <div className="text-xs ... hidden lg:block">
                <kbd className="font-mono">←→</kbd> {t('footer.shortcuts.nav')}
              </div>
            </div>

            {currentIndex < filteredQuestions.length - 1 ? (
              <button
                onClick={nextQuestion}
                className="flex items-center gap-1 ... min-h-[44px]"
                // ✅ ARREGLO DE SCROLL: Quitado autoFocus
              >
                <span className="hidden sm:inline">{t('common.next')}</span>
                <svg className="w-4 h-4 ..." fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ) : (
              <div className="flex gap-2 lg:gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate(`/results/${subjectId}`, { state: { results } })}
                  className="text-xs lg:text-sm ... min-h-[44px] hidden sm:flex"
                >
                  📊 {t('common.results')}
                </Button>
                <Button
                  variant="primary"
                  onClick={() => navigate('/')}
                  className="text-xs lg:text-sm ... min-h-[44px]"
                >
                  🏠 {t('common.home')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ 5. NAVEGADOR EN MODAL (Solo para Móvil) */}
      <Modal 
        isOpen={showNavigatorModal} 
        onClose={() => setShowNavigatorModal(false)} 
        title={t('review.nav.title')}
        size="lg" // Usamos un tamaño grande para que quepa la cuadrícula
      >
        <NavigatorContent />
      </Modal>

    </div>
  );
}