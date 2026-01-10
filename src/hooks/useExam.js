import { useState, useEffect, useCallback, useRef } from 'react';
import { getSubject, getQuestions } from '../services/subjectsService';
import { calculateResults } from '../utils/calculateScore';
import { shuffleArray, shuffleOptions } from '../utils/shuffle';
import { usePersistence, useSyncUnsynced } from './usePersistence';
import { dbManager } from '../lib/indexedDB';

export function useExam(subjectId, mode = 'exam', language = 'es') {
  const [questions, setQuestions] = useState([]);
  const [config, setConfig] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewedQuestions, setReviewedQuestions] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState(null);
  
  // Timer State
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);
  
  const startTime = useRef(null);
  const hasUnsavedChanges = useRef(false);
  const sessionId = useRef(`exam-${subjectId}-${mode}`);

  const { 
    save: forceSave, 
    saveStatus, 
    isSaving, 
    isSaved,
    recover 
  } = usePersistence({
    sessionId: sessionId.current,
    data: {
      subjectId,
      mode,
      currentIndex,
      answers,
      reviewedQuestions: Array.from(reviewedQuestions),
      timeRemaining,
      timerRunning,
      startTime: startTime.current?.toISOString(),
      questions: questions.map(q => q.id)
    },
    saveInterval: 120000,
    enabled: !isFinished,
    type: 'exam'
  });

  useSyncUnsynced(async (session) => {
    if (session.mode === 'exam') {
      console.log('🔄 Sincronizando sesión pendiente:', session.sessionId);
    }
  });

  // 1. Carga Inicial Atómica (Datos + Recuperación)
  useEffect(() => {
    loadExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, language]);

  const loadExam = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // A. Cargar Datos del Curso
      const subjectData = await getSubject(subjectId, language);
      if (!subjectData) throw new Error('No se pudo cargar la información de la materia');

      const loadedConfig = {
        name: subjectData.name,
        icon: subjectData.icon,
        settings: {
          timeLimit: Number(subjectData.time_limit) || 0, // Asegurar número
          passingScore: subjectData.passing_score,
          randomizeQuestions: subjectData.randomize_questions,
          randomizeOptions: subjectData.randomize_options
        }
      };
      setConfig(loadedConfig);

      // B. Cargar Preguntas
      let loadedQuestions = await getQuestions(subjectId, language);
      if (!loadedQuestions || loadedQuestions.length === 0) {
        throw new Error('No hay preguntas disponibles');
      }

      if (loadedConfig.settings.randomizeQuestions) {
        loadedQuestions = shuffleArray(loadedQuestions);
      }
      if (loadedConfig.settings.randomizeOptions) {
        loadedQuestions = loadedQuestions.map(q => {
          const { options, correctIndex } = shuffleOptions(q.options, q.correct);
          return { ...q, options, correct: correctIndex };
        });
      }
      setQuestions(loadedQuestions);

      // C. Intentar Recuperar Sesión (PERSISTENCIA)
      const savedSession = await recover();
      
      if (savedSession && !savedSession.isFinished) {
        console.log('🔄 Restaurando sesión:', savedSession);
        setCurrentIndex(savedSession.currentIndex || 0);
        setAnswers(savedSession.answers || {});
        setReviewedQuestions(new Set(savedSession.reviewedQuestions || []));
        
        // Restaurar tiempo guardado
        if (mode === 'exam') {
            setTimeRemaining(savedSession.timeRemaining || 0);
            setTimerRunning(true); // Reanudar timer automáticamente
        }
        
        if (savedSession.startTime) startTime.current = new Date(savedSession.startTime);
      } else {
        // D. Iniciar Nueva Sesión
        console.log('🆕 Iniciando nueva sesión');
        startTime.current = new Date();
        
        if (mode === 'exam' && loadedConfig.settings.timeLimit > 0) {
          // Iniciar con tiempo completo del curso
          setTimeRemaining(loadedConfig.settings.timeLimit * 60);
          setTimerRunning(true);
        }
      }

    } catch (err) {
      console.error('Error cargando examen:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Lógica del Cronómetro (setInterval)
  useEffect(() => {
    if (timerRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            // Pequeño delay para evitar conflicto de render
            setTimeout(() => finishExam(), 0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning]); // Eliminamos timeRemaining de dep para evitar recrear intervalo cada segundo

  // ... Resto de funciones (selectAnswer, goToQuestion, etc.) sin cambios ...
  const selectAnswer = useCallback((questionId, answerIndex) => {
    setAnswers(prev => ({ ...prev, [questionId]: answerIndex }));
    hasUnsavedChanges.current = true;
  }, []);

  const goToQuestion = useCallback((index) => {
    if (index >= 0 && index < questions.length) setCurrentIndex(index);
  }, [questions.length]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) setCurrentIndex(prev => prev + 1);
  }, [currentIndex, questions.length]);

  const previousQuestion = useCallback(() => {
    if (currentIndex > 0) setCurrentIndex(prev => prev - 1);
  }, [currentIndex]);

  const toggleReview = useCallback(() => {
    const questionId = questions[currentIndex]?.id;
    if (!questionId) return;
    setReviewedQuestions(prev => {
      const newSet = new Set(prev);
      newSet.has(questionId) ? newSet.delete(questionId) : newSet.add(questionId);
      return newSet;
    });
    hasUnsavedChanges.current = true;
  }, [questions, currentIndex]);

  const finishExam = useCallback(async () => {
    try {
      setTimerRunning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      
      const endTime = new Date();
      const timeSpent = startTime.current ? Math.floor((endTime - startTime.current) / 1000) : 0;
      const calculatedResults = calculateResults(questions, answers);
      
      const examResults = {
        subjectId,
        subjectName: config?.name || 'Materia',
        mode,
        ...calculatedResults,
        passed: calculatedResults.score >= (config?.settings.passingScore || 70),
        passingScore: config?.settings.passingScore || 70,
        timeSpent,
        startedAt: startTime.current?.toISOString(),
        completedAt: endTime.toISOString(),
        answers,
        reviewedQuestions: Array.from(reviewedQuestions),
        questions
      };

      setResults(examResults);
      setIsFinished(true);

      // Limpiar sesión guardada
      await dbManager.deleteExamSession(sessionId.current);
      
      hasUnsavedChanges.current = false;
      return examResults;
    } catch (err) {
      console.error('Error finalizando examen:', err);
      throw err;
    }
  }, [questions, answers, reviewedQuestions, config, subjectId, mode]);

  const resetExam = useCallback(() => {
    setCurrentIndex(0);
    setAnswers({});
    setReviewedQuestions(new Set());
    setIsFinished(false);
    setResults(null);
    startTime.current = new Date();
    hasUnsavedChanges.current = false;
    loadExam(); // Recargar todo limpio
  }, [loadExam]);

  const progress = questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0;
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

  // Protección anti-cierre accidental
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedChanges.current && !isFinished) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isFinished]);

  return {
    questions,
    config,
    currentQuestion,
    currentIndex,
    answers,
    reviewedQuestions,
    isLoading,
    error,
    isFinished,
    results,
    timeRemaining,
    timerRunning,
    progress,
    answeredCount: Object.keys(answers).length,
    totalQuestions: questions.length,
    currentAnswer,
    isCurrentAnswered: currentAnswer !== undefined,
    isCurrentCorrect: currentAnswer !== undefined && currentAnswer === currentQuestion?.correct,
    isCurrentReviewed: currentQuestion ? reviewedQuestions.has(currentQuestion.id) : false,
    canGoNext: currentIndex < questions.length - 1,
    canGoPrevious: currentIndex > 0,
    saveStatus,
    isSaving,
    isSaved,
    forceSave,
    selectAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    toggleReview,
    finishExam,
    resetExam
  };
}