import { useState, useEffect, useCallback, useRef } from 'react';
import { getSubject, getQuestions } from '../services/subjectsService';
import { resultsService } from '../services/resultsService';
import { shuffleArray, shuffleOptions } from '../utils/shuffle';
import { calculateResults } from '../utils/calculateScore';
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

  useEffect(() => {
    const recoverProgress = async () => {
      if (questions.length === 0 || isFinished) return;
      
      console.log('🔍 Buscando progreso guardado para:', sessionId.current);
      const recovered = await recover();
      
      if (recovered && !isFinished) {
        console.log('🔄 Recuperando progreso...', recovered);
        setCurrentIndex(recovered.currentIndex || 0);
        setAnswers(recovered.answers || {});
        setReviewedQuestions(new Set(recovered.reviewedQuestions || []));
        setTimeRemaining(recovered.timeRemaining || 0);
        setTimerRunning(recovered.timerRunning || false);
        if (recovered.startTime) startTime.current = new Date(recovered.startTime);
      }
    };

    if (sessionId.current && questions.length > 0) {
      recoverProgress();
    }
  }, [questions.length]);

  useEffect(() => {
    if (timerRunning && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            setTimerRunning(false);
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
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerRunning, timeRemaining]);

  useEffect(() => {
    loadExam();
  }, [subjectId, language]);

  const loadExam = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const subjectData = await getSubject(subjectId, language);
      
      if (!subjectData) {
        throw new Error('No se pudo cargar la información de la materia');
      }

      const loadedConfig = {
        name: subjectData.name,
        icon: subjectData.icon,
        settings: {
          timeLimit: subjectData.time_limit,
          passingScore: subjectData.passing_score,
          randomizeQuestions: subjectData.randomize_questions,
          randomizeOptions: subjectData.randomize_options
        }
      };
      setConfig(loadedConfig);

      let loadedQuestions = await getQuestions(subjectId, language);

      if (!loadedQuestions || loadedQuestions.length === 0) {
        throw new Error('No hay preguntas disponibles para esta materia en el idioma seleccionado');
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
      
      if (!startTime.current) startTime.current = new Date();

      if (mode === 'exam' && loadedConfig.settings.timeLimit > 0) {
        setTimeRemaining(loadedConfig.settings.timeLimit * 60);
        setTimerRunning(true);
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error cargando examen:', err);
      setError(err.message);
      setIsLoading(false);
    }
  };

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

      if (mode === 'exam') {
        try {
          console.log('✅ Resultados listos para guardar');
          await dbManager.deleteExamSession(sessionId.current);
        } catch (saveError) {
          console.error('Error guardando resultados:', saveError);
        }
      } else {
        await dbManager.deleteExamSession(sessionId.current);
      }

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
    loadExam();
  }, [loadExam]);

  const progress = questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0;
  const currentQuestion = questions[currentIndex];
  const currentAnswer = currentQuestion ? answers[currentQuestion.id] : undefined;

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