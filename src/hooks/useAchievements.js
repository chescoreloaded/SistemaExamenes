import { useState, useEffect, useCallback } from 'react';
import { dbManager } from '@/lib/indexedDB';
import { 
  getAllAchievements, 
  checkAchievementCondition,
  getAchievementById 
} from '@/data/achievements';
import { useSoundContext } from '@/context/SoundContext'; // ✅ 1. Importar hook de sonido
/**
 * Hook para gestión de logros
 * Detecta automáticamente cuando se desbloquean logros
 */
export function useAchievements() {
  const [unlockedAchievements, setUnlockedAchievements] = useState([]);
  const [recentlyUnlocked, setRecentlyUnlocked] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

// ✅ 2. Llamar al hook de sonido
  const { playAchievement } = useSoundContext();

  /**
   * Cargar logros desbloqueados al montar
   */
  useEffect(() => {
    loadUnlockedAchievements();
  }, []);

  const loadUnlockedAchievements = async () => {
    try {
      setIsLoading(true);
      const unlocked = await dbManager.getUnlockedAchievements();
      setUnlockedAchievements(unlocked);
    } catch (error) {
      console.error('Error cargando logros:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verificar si un logro está desbloqueado
   */
  const isUnlocked = useCallback((achievementId) => {
    return unlockedAchievements.some(a => a.achievementId === achievementId);
  }, [unlockedAchievements]);

  /**
   * Desbloquear un logro
   */
  const unlockAchievement = useCallback(async (achievementId) => {
    // Verificar que no esté ya desbloqueado
    if (isUnlocked(achievementId)) {
      console.log('⚠️ Logro ya desbloqueado:', achievementId);
      return null;
    }

    const achievement = getAchievementById(achievementId);
    if (!achievement) {
      console.error('❌ Logro no encontrado:', achievementId);
      return null;
    }

    try {
      // Guardar en IndexedDB
      const unlockedData = {
        achievementId: achievement.id,
        name: achievement.name,
        description: achievement.description,
        category: achievement.category,
        icon: achievement.icon,
        rarity: achievement.rarity,
        xpReward: achievement.xpReward
      };

      await dbManager.unlockAchievement(unlockedData);

// ✅ 3. REPRODUCIR SONIDO AQUÍ
      playAchievement();

      // Agregar XP al usuario
      const xpResult = await dbManager.addXP(
        achievement.xpReward, 
        `Logro: ${achievement.name}`
      );

      // Actualizar estado local
      setUnlockedAchievements(prev => [...prev, unlockedData]);
      setRecentlyUnlocked({
        ...unlockedData,
        xpGained: xpResult.xpGained,
        leveledUp: xpResult.leveledUp,
        newLevel: xpResult.level
      });

      console.log('🏆 Logro desbloqueado:', achievement.name, `+${achievement.xpReward} XP`);

      // Limpiar después de 5 segundos
      setTimeout(() => {
        setRecentlyUnlocked(null);
      }, 5000);

      return unlockedData;
    } catch (error) {
      console.error('Error desbloqueando logro:', error);
      return null;
    }
  }, [isUnlocked, playAchievement]); // ✅ 4. Añadir playAchievement al array

  /**
   * Verificar múltiples logros basándose en stats actuales
   */
  const checkAchievements = useCallback(async (stats, context = {}) => {
    const allAchievements = getAllAchievements();
    const newlyUnlocked = [];

    for (const achievement of allAchievements) {
      // Skip si ya está desbloqueado
      if (isUnlocked(achievement.id)) continue;

      // Verificar condición
      const shouldUnlock = checkAchievementCondition(achievement.id, stats, context);
      
      if (shouldUnlock) {
        const unlocked = await unlockAchievement(achievement.id);
        if (unlocked) {
          newlyUnlocked.push(unlocked);
        }
      }
    }

    return newlyUnlocked;
  }, [isUnlocked, unlockAchievement]);

  /**
   * Calcular progreso de logros (cuántos desbloqueados)
   */
  const achievementProgress = {
    unlocked: unlockedAchievements.length,
    total: getAllAchievements().length,
    percentage: Math.round(
      (unlockedAchievements.length / getAllAchievements().length) * 100
    )
  };

  /**
   * Obtener logros por categoría con estado de desbloqueo
   */
  const getAchievementsByCategory = useCallback((category) => {
    const allAchievements = getAllAchievements();
    return allAchievements
      .filter(a => a.category === category)
      .map(a => ({
        ...a,
        unlocked: isUnlocked(a.id),
        unlockedAt: unlockedAchievements.find(u => u.achievementId === a.id)?.unlockedAt
      }));
  }, [unlockedAchievements, isUnlocked]);

  /**
   * Obtener todos los logros con estado
   */
  const getAllAchievementsWithStatus = useCallback(() => {
    return getAllAchievements().map(a => ({
      ...a,
      unlocked: isUnlocked(a.id),
      unlockedAt: unlockedAchievements.find(u => u.achievementId === a.id)?.unlockedAt
    }));
  }, [unlockedAchievements, isUnlocked]);

  /**
   * Limpiar notificación de logro reciente
   */
  const clearRecentlyUnlocked = useCallback(() => {
    setRecentlyUnlocked(null);
  }, []);

  return {
    // Estado
    unlockedAchievements,
    recentlyUnlocked,
    isLoading,
    achievementProgress,
    
    // Acciones
    unlockAchievement,
    checkAchievements,
    isUnlocked,
    clearRecentlyUnlocked,
    
    // Utilidades
    getAchievementsByCategory,
    getAllAchievementsWithStatus,
    refresh: loadUnlockedAchievements
  };
}

export default useAchievements;
