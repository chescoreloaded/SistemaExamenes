import { useState, useEffect, useCallback, useMemo } from 'react'; // <-- Add useMemo here
import { dbManager } from '@/lib/indexedDB';
import { 
  calculateLevel, 
  getLevelTitle,
  formatXP,
  calculateAnswerXP,
  calculateExamCompletionXP,
  calculateStudySessionXP
} from '@/utils/xpCalculator';
import { useSoundContext } from '@/context/SoundContext'; // Importar hook de sonido

/**
 * Hook para gestión de puntos y XP
 */
export function usePoints() {
  const [points, setPoints] = useState({
    totalXP: 0,
    level: 1,
    currentLevelXP: 0,
    xpForNextLevel: 100,
    progressPercentage: 0,
    totalCorrectAnswers: 0,
    totalWrongAnswers: 0,
    totalExamsCompleted: 0,
    totalStudySessions: 0,
    perfectExamsCount: 0,
    dailyStreak: 0, // Asegúrate de que este campo existe en IndexedDB o inicialízalo
    title: 'Novato', // Título inicial
    icon: '🌱', // Icono inicial
    color: 'text-gray-500', // Color inicial
    lastUpdated: null
  });

  const [isLoading, setIsLoading] = useState(true);
  const [recentXPGain, setRecentXPGain] = useState(null);

  // Hook de sonido para Level Up
  const { playLevelUp } = useSoundContext();

  /**
   * Cargar puntos del usuario
   */
  useEffect(() => {
    loadPoints();
  }, []);

  const loadPoints = async () => {
    try {
      setIsLoading(true);
      const userPoints = await dbManager.getUserPoints();
      
      // Calcular nivel y progreso
      const levelData = calculateLevel(userPoints.totalXP);
      const titleData = getLevelTitle(levelData.level);
      
      setPoints({
        ...userPoints,
        ...levelData,
        ...titleData
      });
    } catch (error) {
      console.error('Error cargando puntos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Agregar XP (Función central)
   */
  const addXP = useCallback(async (amount, reason = '') => {
    if (amount <= 0) return null; // No agregar 0 XP

    try {
      const currentPointsData = await dbManager.getUserPoints(); // Datos antes de añadir XP
      const result = await dbManager.addXP(amount, reason); // Guardar en DB (devuelve { leveledUp, level })
      
      // Reproducir sonido SIEMPRE que addXP devuelva leveledUp: true
      if (result && result.leveledUp) {
        playLevelUp(); 
      }

      // Actualizar estado local DESPUÉS de guardar y reproducir sonido
      await loadPoints(); // Recarga los datos completos desde DB
      
      // Mostrar notificación temporal de XP ganado
      setRecentXPGain({
        amount,
        reason,
        leveledUp: result ? result.leveledUp : false,
        newLevel: result ? result.level : currentPointsData.level // Usar nivel resultante o el anterior
      });

      // Limpiar después de 3 segundos
      const timer = setTimeout(() => {
        setRecentXPGain(null);
      }, 3000);

      // Guardar timer para limpiarlo si el componente se desmonta
      // (Esto requiere un useRef si quieres ser muy preciso, pero para 3s es aceptable así)
      
      console.log(`✨ +${amount} XP ${reason ? `(${reason})` : ''}`);

      return result; // Devolver el resultado de dbManager.addXP { xpGained, totalXP, level, leveledUp }
    } catch (error) {
      console.error('Error agregando XP:', error);
      setRecentXPGain(null); // Limpiar notificación en caso de error
      return null;
    }
  }, [loadPoints, playLevelUp]); // Dependencias: loadPoints y playLevelUp

  /**
   * Agregar XP por respuesta
   */
  const addAnswerXP = useCallback(async (isCorrect, difficulty = 'basico', currentStreak = 0) => {
    const xpData = calculateAnswerXP(isCorrect, difficulty, currentStreak);
    
    // Actualizar contadores (antes de añadir XP para tener los datos correctos)
    const currentPoints = await dbManager.getUserPoints(); // Obtener datos más recientes
    const updatedPoints = {
      ...currentPoints, // Usar datos frescos
      totalCorrectAnswers: currentPoints.totalCorrectAnswers + (isCorrect ? 1 : 0),
      totalWrongAnswers: currentPoints.totalWrongAnswers + (!isCorrect ? 1 : 0)
    };
    await dbManager.updateUserPoints(updatedPoints);
    
    // Agregar XP y obtener el resultado (que incluye 'leveledUp')
    const result = await addXP(xpData.totalXP, isCorrect ? 'Respuesta correcta' : 'Respuesta incorrecta');
    
    // Retornar una combinación de ambos objetos
    return { ...xpData, ...result };

  }, [addXP]); // Solo depende de addXP

  /**
   * Agregar XP por completar examen
   */
  const addExamXP = useCallback(async (examResults) => {
    if (!examResults) return null;
    const xpData = calculateExamCompletionXP(examResults);
    
    // Actualizar contadores (solo si es modo examen real)
    if (examResults.mode === 'exam') {
      const currentPoints = await dbManager.getUserPoints();
      const updatedPoints = {
        ...currentPoints,
        totalExamsCompleted: currentPoints.totalExamsCompleted + 1,
        perfectExamsCount: examResults.score === 100 
          ? currentPoints.perfectExamsCount + 1 
          : currentPoints.perfectExamsCount
      };
      await dbManager.updateUserPoints(updatedPoints);
    }
    
    // Agregar XP (devuelve leveledUp)
    const result = await addXP(xpData.totalXP, 'Examen completado');
    
    return { ...xpData, ...result };
  }, [addXP]);

  /**
   * Agregar XP por sesión de estudio
   */
  const addStudyXP = useCallback(async (studyStats) => {
    if (!studyStats) return null;
    const xpData = calculateStudySessionXP(studyStats);
    
    // Actualizar contadores
    const currentPoints = await dbManager.getUserPoints();
    const updatedPoints = {
      ...currentPoints,
      totalStudySessions: currentPoints.totalStudySessions + 1
    };
    await dbManager.updateUserPoints(updatedPoints);
    
    // Agregar XP
    const result = await addXP(xpData.totalXP, 'Sesión de estudio completada');
    
    return { ...xpData, ...result };
  }, [addXP]);

  /**
   * Actualizar racha diaria (solo actualiza el campo en userPoints)
   */
  const updateDailyStreak = useCallback(async (streakCount) => {
    const currentPoints = await dbManager.getUserPoints();
    const updatedPoints = {
      ...currentPoints,
      dailyStreak: streakCount
    };
    await dbManager.updateUserPoints(updatedPoints);
    // No es necesario llamar a loadPoints aquí si solo cambia la racha
    setPoints(prev => ({ ...prev, dailyStreak: streakCount })); 
  }, []); // Sin dependencias complejas

  /**
   * Resetear puntos
   */
  const resetPoints = useCallback(async () => {
    await dbManager.resetGamification(); // Usar la función de reset que borra todo
    await loadPoints(); // Recargar el estado inicial
    console.log('🗑️ Puntos y gamificación reseteados');
  }, [loadPoints]); // Depende de loadPoints

  /**
   * Calcular tasa de aciertos
   */
  const accuracy = points.totalCorrectAnswers + points.totalWrongAnswers > 0
    ? Math.round(
        (points.totalCorrectAnswers / 
        (points.totalCorrectAnswers + points.totalWrongAnswers)) * 100
      )
    : 0;

  /**
   * Obtener stats formateados (calculados a partir del estado 'points')
   */
  const formattedStats = useMemo(() => {
    const levelData = calculateLevel(points.totalXP);
    const titleData = getLevelTitle(levelData.level);
    return {
      totalXP: formatXP(points.totalXP),
      level: levelData.level,
      title: titleData.title,
      icon: titleData.icon,
      color: titleData.color,
      progressPercentage: levelData.progressPercentage,
      currentLevelXP: formatXP(levelData.currentLevelXP),
      xpForNextLevel: formatXP(levelData.xpForNextLevel),
      accuracy,
      totalAnswers: points.totalCorrectAnswers + points.totalWrongAnswers,
      totalExams: points.totalExamsCompleted,
      totalStudySessions: points.totalStudySessions,
      perfectExams: points.perfectExamsCount,
      dailyStreak: points.dailyStreak
    };
  }, [points, accuracy]); // Recalcular solo si 'points' o 'accuracy' cambian

  /**
   * Limpiar notificación de XP reciente
   */
  const clearRecentXPGain = useCallback(() => {
    setRecentXPGain(null);
  }, []);

  return {
    // Estado
    points, // El estado crudo con todos los datos
    formattedStats, // Datos formateados para la UI
    isLoading,
    recentXPGain, // Para la notificación
    
    // Acciones
    addXP, // Función base (raramente usada directamente)
    addAnswerXP, // Para respuestas
    addExamXP, // Para fin de examen
    addStudyXP, // Para fin de estudio
    updateDailyStreak, // Para actualizar racha en UI
    resetPoints, // Para testing
    clearRecentXPGain, // Para cerrar notificación
    
    // Utilidades
    refresh: loadPoints // Para recargar manualmente si es necesario
  };
}

export default usePoints; // Mantener export default si otros archivos lo esperan