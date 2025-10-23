import { useState, useEffect, useCallback, useRef } from 'react';
import { questionsService } from '../services/questionsService';
import { subjectsService } from '../services/subjectsService';
import { resultsService } from '../services/resultsService';
import { shuffleArray, shuffleOptions } from '../utils/shuffle';
import { calculateResults } from '../utils/calculateScore';
import { usePersistence, useSyncUnsynced } from './usePersistence';
import { dbManager } from '../lib/indexedDB';

export function useExam(subjectId, mode = 'exam') {
  // Estado principal
  const [questions, setQuestions] = useState([]);
  const [config, setConfig] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [reviewedQuestions, setReviewedQuestions] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFinished, setIsFinished] = useState(false);
  const [results, setResults] = useState(null);
  
  // Timer state (manual, sin useTimer hook)
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef(null);
  
  // Referencias
  const startTime = useRef(null);
  const hasUnsavedChanges = useRef(false);
  // ✅ NUEVO: SessionId estable para poder recuperar
  // Solo incluye subjectId y mode, NO timestamp
  const sessionId = useRef(`exam-${subjectId}-${mode}`);

  // ✅ NUEVO: Autosave con hook de persistencia
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
      questions: questions.map(q => q.id) // Solo IDs para ahorrar espacio
    },
    saveInterval: 120000, // ✅ 2 minutos (120 segundos)
    onSave: async (data) => {
      // Solo guardar en Supabase en modo examen y si no está finalizado
      if (mode === 'exam' && !isFinished) {
        console.log('☁️ Guardando progreso parcial en Supabase...');
        // Aquí podrías llamar a un endpoint de Supabase para guardar progreso parcial
        // await resultsService.savePartialProgress(data);
      }
    },
    enabled: !isFinished,
    type: 'exam'
  });

  // ✅ NUEVO: Sincronizar sesiones no sincronizadas al montar
  useSyncUnsynced(async (session) => {
    if (session.mode === 'exam') {
      console.log('🔄 Sincronizando sesión pendiente:', session.sessionId);
      // await resultsService.savePartialProgress(session);
    }
  });

  /**
   * ✅ NUEVO: Recuperar progreso DESPUÉS de cargar preguntas
   */
  useEffect(() => {
    const recoverProgress = async () => {
      // Solo recuperar si ya cargamos las preguntas
      if (questions.length === 0 || isFinished) return;
      
      console.log('🔍 Buscando progreso guardado para:', sessionId.current);
      const recovered = await recover();
      
      if (recovered && !isFinished) {
        console.log('🔄 Recuperando progreso...', recovered);
        
        // Restaurar estado
        setCurrentIndex(recovered.currentIndex || 0);
        setAnswers(recovered.answers || {});
        setReviewedQuestions(new Set(recovered.reviewedQuestions || []));
        setTimeRemaining(recovered.timeRemaining || 0);
        setTimerRunning(recovered.timerRunning || false);
        
        if (recovered.startTime) {
          startTime.current = new Date(recovered.startTime);
        }
      } else {
        console.log('ℹ️ No se encontró progreso previo o examen finalizado');
      }
    };

    if (sessionId.current && questions.length > 0) {
      recoverProgress();
    }
  }, [questions.length]); // Ejecutar cuando se carguen las preguntas

  /**
   * Timer effect
   */
  useEffect(() => {
    if (timerRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
            // Auto-finish cuando se acabe el tiempo
            setTimeout(() => finishExam(), 100);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerRunning, timeRemaining]);

  /**
   * Cargar configuración y preguntas
   */
  useEffect(() => {
    loadExam();
  }, [subjectId]);

  const loadExam = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Cargar configuración de la materia
      const subjectConfig = await subjectsService.getConfig(subjectId);
      setConfig(subjectConfig);

      // Cargar preguntas
      let loadedQuestions = await questionsService.getBySubject(subjectId);

      if (!loadedQuestions || loadedQuestions.length === 0) {
        throw new Error('No hay preguntas disponibles para esta materia');
      }

      // Aplicar configuraciones
      if (subjectConfig.settings.randomizeQuestions) {
        loadedQuestions = shuffleArray(loadedQuestions);
      }

      if (subjectConfig.settings.randomizeOptions) {
        loadedQuestions = loadedQuestions.map(q => {
          const { options, correctIndex } = shuffleOptions(q.options, q.correct);
          return { ...q, options, correct: correctIndex };
        });
      }

      setQuestions(loadedQuestions);
      
      // Solo establecer startTime si no se recuperó
      if (!startTime.current) {
        startTime.current = new Date();
      }

      // Iniciar timer solo en modo examen
      if (mode === 'exam' && subjectConfig.settings.timeLimit > 0) {
        const timeInSeconds = subjectConfig.settings.timeLimit * 60;
        setTimeRemaining(timeInSeconds);
        setTimerRunning(true);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error cargando examen:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

  /**
   * Seleccionar respuesta
   */
  const selectAnswer = useCallback((questionId, answerIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answerIndex
    }));
    hasUnsavedChanges.current = true;
  }, []);

  /**
   * Navegación entre preguntas
   */
  const goToQuestion = useCallback((index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentIndex(index);
    }
  }, [questions.length]);

  const nextQuestion = useCallback(() => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  }, [currentIndex, questions.length]);

  const previousQuestion = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  }, [currentIndex]);

  /**
   * Marcar pregunta para revisión
   */
  const toggleReview = useCallback(() => {
    const questionId = questions[currentIndex]?.id;
    if (!questionId) return;

    setReviewedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
    hasUnsavedChanges.current = true;
  }, [questions, currentIndex]);

  /**
   * Finalizar examen
   */
  const finishExam = useCallback(async () => {
    try {
      // Detener timer
      setTimerRunning(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      
      const endTime = new Date();
      const timeSpent = startTime.current 
        ? Math.floor((endTime - startTime.current) / 1000)
        : 0;

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

      // ✅ Guardar resultado final en modo examen
      if (mode === 'exam') {
        try {
          await resultsService.save(examResults);
          console.log('✅ Resultados guardados en base de datos');
          
          // ✅ NUEVO: Limpiar sesión de IndexedDB después de finalizar
          await dbManager.deleteExamSession(sessionId.current);
          console.log('🗑️ Sesión limpiada de IndexedDB');
        } catch (saveError) {
          console.error('Error guardando resultados:', saveError);
        }
      } else {
        console.log('ℹ️ Modo práctica - No se guarda en base de datos');
        // Limpiar también en modo práctica
        await dbManager.deleteExamSession(sessionId.current);
        console.log('🗑️ Sesión limpiada de IndexedDB');
      }

      hasUnsavedChanges.current = false;
      
      return examResults;
    } catch (err) {
      console.error('Error finalizando examen:', err);
      throw err;
    }
  }, [questions, answers, reviewedQuestions, config, subjectId, mode]);

  /**
   * Reiniciar examen
   */
  const resetExam = useCallback(() => {
    setCurrentIndex(0);
    setAnswers({});
    setReviewedQuestions(new Set());
    setIsFinished(false);
    setResults(null);
    startTime.current = new Date();
    hasUnsavedChanges.current = false;
    // ✅ NO cambiar sessionId para mantener persistencia
    
    loadExam();
  }, [loadExam]);

  /**
   * Calcular progreso
   */
  const progress = questions.length > 0 
    ? (Object.keys(answers).length / questions.length) * 100 
    : 0;

  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;
  const isCurrentAnswered = currentAnswer !== undefined;
  const isCurrentCorrect = isCurrentAnswered && currentAnswer === currentQuestion?.correct;
  const isCurrentReviewed = currentQuestion ? reviewedQuestions.has(currentQuestion.id) : false;

  /**
   * Prevenir cierre accidental
   */
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
    isCurrentAnswered,
    isCurrentCorrect,
    isCurrentReviewed,
    canGoNext: currentIndex < questions.length - 1,
    canGoPrevious: currentIndex > 0,
    // ✅ NUEVO: Estados de autosave
    saveStatus,
    isSaving,
    isSaved,
    forceSave,
    // Acciones
    selectAnswer,
    nextQuestion,
    previousQuestion,
    goToQuestion,
    toggleReview,
    finishExam,
    resetExam
  };
}
