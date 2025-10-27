import { useState, useEffect, useCallback } from 'react';
import { dbManager } from '@/lib/indexedDB';

/**
 * Hook para gestión de rachas (streaks)
 */
export function useStreak() {
  const [dailyStreak, setDailyStreak] = useState({
    current: 0,
    best: 0,
    lastUpdate: null
  });

  const [correctStreak, setCorrectStreak] = useState({
    current: 0,
    best: 0,
    lastUpdate: null
  });

  const [isLoading, setIsLoading] = useState(true);

  /**
   * Cargar rachas al montar
   */
  useEffect(() => {
    loadStreaks();
  }, []);

  const loadStreaks = async () => {
    try {
      setIsLoading(true);
      
      const daily = await dbManager.getStreak('daily');
      const correct = await dbManager.getStreak('correct_answers');
      
      setDailyStreak(daily);
      setCorrectStreak(correct);
    } catch (error) {
      console.error('Error cargando rachas:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verificar si es un nuevo día
   */
  const isNewDay = (lastUpdate) => {
    if (!lastUpdate) return true;
    
    const lastDate = new Date(lastUpdate);
    const today = new Date();
    
    return lastDate.toDateString() !== today.toDateString();
  };

  /**
   * Verificar si es día consecutivo
   */
  const isConsecutiveDay = (lastUpdate) => {
    if (!lastUpdate) return false;
    
    const lastDate = new Date(lastUpdate);
    const today = new Date();
    
    // Resetear horas para comparar solo fechas
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays === 1;
  };

  /**
   * Actualizar racha diaria
   * Se llama cuando el usuario completa una actividad (examen o estudio)
   */
  const updateDailyStreak = useCallback(async () => {
    try {
      const currentStreak = await dbManager.getStreak('daily');
      
      // Si ya actualizamos hoy, no hacer nada
      if (!isNewDay(currentStreak.lastUpdate)) {
        console.log('ℹ️ Racha ya actualizada hoy');
        return currentStreak;
      }
      
      let newCurrent = 1;
      
      // Si es día consecutivo, incrementar
      if (isConsecutiveDay(currentStreak.lastUpdate)) {
        newCurrent = currentStreak.current + 1;
        console.log('🔥 Racha diaria incrementada:', newCurrent);
      } else {
        console.log('🔥 Nueva racha diaria iniciada');
      }
      
      const updatedStreak = await dbManager.updateStreak('daily', newCurrent);
      setDailyStreak(updatedStreak);
      
      return updatedStreak;
    } catch (error) {
      console.error('Error actualizando racha diaria:', error);
      return null;
    }
  }, []);

  /**
   * Incrementar racha de respuestas correctas
   */
  const incrementCorrectStreak = useCallback(async () => {
    try {
      const currentStreak = await dbManager.getStreak('correct_answers');
      const newCurrent = currentStreak.current + 1;
      
      const updatedStreak = await dbManager.updateStreak('correct_answers', newCurrent);
      setCorrectStreak(updatedStreak);
      
      // Log especial para hitos
      if (newCurrent === 5) {
        console.log('🔥 ¡5 respuestas correctas seguidas!');
      } else if (newCurrent === 10) {
        console.log('🔥🔥 ¡10 respuestas correctas seguidas!');
      } else if (newCurrent === 20) {
        console.log('🔥🔥🔥 ¡20 respuestas correctas seguidas! ¡Increíble!');
      }
      
      return updatedStreak;
    } catch (error) {
      console.error('Error incrementando racha de correctas:', error);
      return null;
    }
  }, []);

  /**
   * Resetear racha de respuestas correctas (cuando falla)
   */
  const resetCorrectStreak = useCallback(async () => {
    try {
      const updatedStreak = await dbManager.updateStreak('correct_answers', 0);
      setCorrectStreak(updatedStreak);
      
      if (correctStreak.current >= 3) {
        console.log('💔 Racha de correctas terminada en:', correctStreak.current);
      }
      
      return updatedStreak;
    } catch (error) {
      console.error('Error reseteando racha de correctas:', error);
      return null;
    }
  }, [correctStreak.current]);

  /**
   * Manejar respuesta (incrementa o resetea según sea correcta o no)
   */
  const handleAnswer = useCallback(async (isCorrect) => {
    if (isCorrect) {
      return await incrementCorrectStreak();
    } else {
      return await resetCorrectStreak();
    }
  }, [incrementCorrectStreak, resetCorrectStreak]);

  /**
   * Obtener multiplicador de XP basado en racha actual
   */
  const getStreakMultiplier = useCallback(() => {
    const current = correctStreak.current;
    
    if (current >= 20) return 2.0;
    if (current >= 10) return 1.5;
    if (current >= 5) return 1.25;
    if (current >= 3) return 1.1;
    return 1.0;
  }, [correctStreak.current]);

  /**
   * Verificar si perdió la racha diaria (no estudió ayer)
   */
  const checkDailyStreakLoss = useCallback(async () => {
    const currentStreak = await dbManager.getStreak('daily');
    
    if (!currentStreak.lastUpdate) return false;
    
    const lastDate = new Date(currentStreak.lastUpdate);
    const today = new Date();
    
    lastDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    
    const diffTime = today - lastDate;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    // Si pasaron más de 1 día, perdió la racha
    if (diffDays > 1) {
      console.log('💔 Racha diaria perdida. Días sin estudiar:', diffDays - 1);
      await dbManager.updateStreak('daily', 0);
      setDailyStreak({
        current: 0,
        best: currentStreak.best,
        lastUpdate: null
      });
      return true;
    }
    
    return false;
  }, []);

  /**
   * Obtener días hasta perder la racha
   */
  const getDaysUntilStreakLoss = useCallback(() => {
    if (!dailyStreak.lastUpdate) return 0;
    
    const lastDate = new Date(dailyStreak.lastUpdate);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    
    lastDate.setHours(0, 0, 0, 0);
    
    const diffTime = tomorrow - lastDate;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return Math.max(0, 2 - diffDays); // Tienes hasta mañana
  }, [dailyStreak.lastUpdate]);

  /**
   * Resetear todas las rachas (útil para testing)
   */
  const resetAllStreaks = useCallback(async () => {
    await dbManager.updateStreak('daily', 0);
    await dbManager.updateStreak('correct_answers', 0);
    await loadStreaks();
    console.log('🗑️ Todas las rachas reseteadas');
  }, []);

  /**
   * Obtener mensaje motivacional según racha
   */
  const getStreakMessage = useCallback(() => {
    const current = correctStreak.current;
    
    if (current === 0) return null;
    if (current < 3) return { emoji: '✨', text: '¡Sigue así!' };
    if (current < 5) return { emoji: '🔥', text: '¡Excelente racha!' };
    if (current < 10) return { emoji: '🔥🔥', text: '¡Imparable!' };
    if (current < 20) return { emoji: '🔥🔥🔥', text: '¡Eres increíble!' };
    return { emoji: '👑', text: '¡LEGENDARIO!' };
  }, [correctStreak.current]);

  return {
    // Estado
    dailyStreak,
    correctStreak,
    isLoading,
    
    // Acciones
    updateDailyStreak,
    incrementCorrectStreak,
    resetCorrectStreak,
    handleAnswer,
    checkDailyStreakLoss,
    resetAllStreaks,
    
    // Utilidades
    getStreakMultiplier,
    getDaysUntilStreakLoss,
    getStreakMessage,
    refresh: loadStreaks
  };
}

export default useStreak;
