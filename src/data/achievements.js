/**
 * Definición de logros (achievements)
 * Cada logro tiene: id, nombre, descripción, categoría, icono, rareza, condiciones
 */

export const ACHIEVEMENT_CATEGORIES = {
  FIRST_STEPS: 'first_steps',
  MASTERY: 'mastery',
  DEDICATION: 'dedication',
  SPEED: 'speed',
  STREAK: 'streak'
};

export const ACHIEVEMENT_RARITY = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
};

export const ACHIEVEMENTS = {
  // ==========================================
  // CATEGORÍA: PRIMEROS PASOS
  // ==========================================
  first_study: {
    id: 'first_study',
    name: '¡Primera Sesión!',
    description: 'Completa tu primera sesión de estudio con flashcards',
    category: ACHIEVEMENT_CATEGORIES.FIRST_STEPS,
    icon: '📚',
    rarity: ACHIEVEMENT_RARITY.COMMON,
    xpReward: 50,
    condition: (stats) => stats.totalStudySessions >= 1
  },

  first_exam: {
    id: 'first_exam',
    name: 'Primer Examen',
    description: 'Completa tu primer examen',
    category: ACHIEVEMENT_CATEGORIES.FIRST_STEPS,
    icon: '✍️',
    rarity: ACHIEVEMENT_RARITY.COMMON,
    xpReward: 50,
    condition: (stats) => stats.totalExamsCompleted >= 1
  },

  first_perfect: {
    id: 'first_perfect',
    name: 'Primera Respuesta Perfecta',
    description: 'Responde correctamente tu primera pregunta',
    category: ACHIEVEMENT_CATEGORIES.FIRST_STEPS,
    icon: '✅',
    rarity: ACHIEVEMENT_RARITY.COMMON,
    xpReward: 25,
    condition: (stats) => stats.totalCorrectAnswers >= 1
  },

  // ==========================================
  // CATEGORÍA: MAESTRÍA
  // ==========================================
  ace_exam: {
    id: 'ace_exam',
    name: 'Examen Perfecto',
    description: 'Obtén 100% de aciertos en un examen',
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    icon: '🏆',
    rarity: ACHIEVEMENT_RARITY.RARE,
    xpReward: 200,
    condition: (stats, context) => {
      return context?.examScore === 100;
    }
  },

  perfectionist: {
    id: 'perfectionist',
    name: 'Perfeccionista',
    description: 'Obtén 100% en 5 exámenes diferentes',
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    icon: '💎',
    rarity: ACHIEVEMENT_RARITY.EPIC,
    xpReward: 500,
    condition: (stats) => stats.perfectExamsCount >= 5
  },

  knowledge_master: {
    id: 'knowledge_master',
    name: 'Maestro del Conocimiento',
    description: 'Alcanza el nivel 10',
    category: ACHIEVEMENT_CATEGORIES.MASTERY,
    icon: '🎓',
    rarity: ACHIEVEMENT_RARITY.EPIC,
    xpReward: 1000,
    condition: (stats) => stats.level >= 10
  },

  // ==========================================
  // CATEGORÍA: DEDICACIÓN
  // ==========================================
  dedicated_student: {
    id: 'dedicated_student',
    name: 'Estudiante Dedicado',
    description: 'Completa 10 sesiones de estudio',
    category: ACHIEVEMENT_CATEGORIES.DEDICATION,
    icon: '📖',
    rarity: ACHIEVEMENT_RARITY.COMMON,
    xpReward: 150,
    condition: (stats) => stats.totalStudySessions >= 10
  },

  exam_warrior: {
    id: 'exam_warrior',
    name: 'Guerrero de Exámenes',
    description: 'Completa 10 exámenes',
    category: ACHIEVEMENT_CATEGORIES.DEDICATION,
    icon: '⚔️',
    rarity: ACHIEVEMENT_RARITY.RARE,
    xpReward: 300,
    condition: (stats) => stats.totalExamsCompleted >= 10
  },

  century_club: {
    id: 'century_club',
    name: 'Club de los 100',
    description: 'Responde correctamente 100 preguntas',
    category: ACHIEVEMENT_CATEGORIES.DEDICATION,
    icon: '💯',
    rarity: ACHIEVEMENT_RARITY.RARE,
    xpReward: 400,
    condition: (stats) => stats.totalCorrectAnswers >= 100
  },

  // ==========================================
  // CATEGORÍA: RACHAS (STREAKS)
  // ==========================================
  streak_3: {
    id: 'streak_3',
    name: 'Racha de Fuego',
    description: 'Estudia 3 días consecutivos',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    icon: '🔥',
    rarity: ACHIEVEMENT_RARITY.COMMON,
    xpReward: 100,
    condition: (stats) => stats.dailyStreak >= 3
  },

  streak_7: {
    id: 'streak_7',
    name: 'Semana Perfecta',
    description: 'Estudia 7 días consecutivos',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    icon: '🌟',
    rarity: ACHIEVEMENT_RARITY.RARE,
    xpReward: 300,
    condition: (stats) => stats.dailyStreak >= 7
  },

  streak_30: {
    id: 'streak_30',
    name: 'Disciplina Legendaria',
    description: 'Estudia 30 días consecutivos',
    category: ACHIEVEMENT_CATEGORIES.STREAK,
    icon: '👑',
    rarity: ACHIEVEMENT_RARITY.LEGENDARY,
    xpReward: 1500,
    condition: (stats) => stats.dailyStreak >= 30
  }
};

/**
 * Obtener todos los logros como array
 */
export function getAllAchievements() {
  return Object.values(ACHIEVEMENTS);
}

/**
 * Obtener logros por categoría
 */
export function getAchievementsByCategory(category) {
  return getAllAchievements().filter(a => a.category === category);
}

/**
 * Obtener logro por ID
 */
export function getAchievementById(id) {
  return ACHIEVEMENTS[id] || null;
}

/**
 * Verificar si se cumple la condición de un logro
 */
export function checkAchievementCondition(achievementId, stats, context = {}) {
  const achievement = getAchievementById(achievementId);
  if (!achievement) return false;
  
  try {
    return achievement.condition(stats, context);
  } catch (error) {
    console.error(`Error checking achievement ${achievementId}:`, error);
    return false;
  }
}

/**
 * Obtener color según rareza
 */
export function getRarityColor(rarity) {
  const colors = {
    [ACHIEVEMENT_RARITY.COMMON]: {
      bg: 'from-gray-400 to-gray-600',
      border: 'border-gray-400',
      text: 'text-gray-700',
      glow: 'shadow-gray-400/50'
    },
    [ACHIEVEMENT_RARITY.RARE]: {
      bg: 'from-blue-400 to-blue-600',
      border: 'border-blue-400',
      text: 'text-blue-700',
      glow: 'shadow-blue-400/50'
    },
    [ACHIEVEMENT_RARITY.EPIC]: {
      bg: 'from-purple-400 to-purple-600',
      border: 'border-purple-400',
      text: 'text-purple-700',
      glow: 'shadow-purple-400/50'
    },
    [ACHIEVEMENT_RARITY.LEGENDARY]: {
      bg: 'from-yellow-400 to-orange-600',
      border: 'border-yellow-400',
      text: 'text-yellow-700',
      glow: 'shadow-yellow-400/50'
    }
  };
  
  return colors[rarity] || colors[ACHIEVEMENT_RARITY.COMMON];
}

/**
 * Obtener nombre de rareza en español
 */
export function getRarityLabel(rarity) {
  const labels = {
    [ACHIEVEMENT_RARITY.COMMON]: 'Común',
    [ACHIEVEMENT_RARITY.RARE]: 'Raro',
    [ACHIEVEMENT_RARITY.EPIC]: 'Épico',
    [ACHIEVEMENT_RARITY.LEGENDARY]: 'Legendario'
  };
  
  return labels[rarity] || 'Común';
}

export default ACHIEVEMENTS;
