/**
 * Sistema de cálculo de XP
 * Determina cuánto XP gana el usuario por diferentes acciones
 */

// XP base por acción
export const XP_VALUES = {
  CORRECT_ANSWER: 10,
  WRONG_ANSWER: 2, // XP de consolación por intentarlo
  COMPLETE_EXAM: 50,
  COMPLETE_STUDY_SESSION: 30,
  PERFECT_EXAM: 100, // Bonus por 100%
  UNLOCK_ACHIEVEMENT: 0 // El achievement ya da su propio XP
};

// Multiplicadores por dificultad
export const DIFFICULTY_MULTIPLIERS = {
  basico: 1.0,
  intermedio: 1.5,
  avanzado: 2.0
};

// Multiplicadores por racha
export const STREAK_MULTIPLIERS = {
  0: 1.0,   // Sin racha
  3: 1.1,   // 3+ respuestas correctas seguidas
  5: 1.25,  // 5+ respuestas correctas seguidas
  10: 1.5,  // 10+ respuestas correctas seguidas
  20: 2.0   // 20+ respuestas correctas seguidas (wow!)
};

/**
 * Calcular XP por respuesta correcta
 */
export function calculateAnswerXP(isCorrect, difficulty = 'basico', currentStreak = 0) {
  const baseXP = isCorrect ? XP_VALUES.CORRECT_ANSWER : XP_VALUES.WRONG_ANSWER;
  
  // Aplicar multiplicador de dificultad
  const difficultyMultiplier = DIFFICULTY_MULTIPLIERS[difficulty] || 1.0;
  
  // Aplicar multiplicador de racha (solo para correctas)
  let streakMultiplier = 1.0;
  if (isCorrect) {
    if (currentStreak >= 20) streakMultiplier = STREAK_MULTIPLIERS[20];
    else if (currentStreak >= 10) streakMultiplier = STREAK_MULTIPLIERS[10];
    else if (currentStreak >= 5) streakMultiplier = STREAK_MULTIPLIERS[5];
    else if (currentStreak >= 3) streakMultiplier = STREAK_MULTIPLIERS[3];
  }
  
  const totalXP = Math.round(baseXP * difficultyMultiplier * streakMultiplier);
  
  return {
    baseXP,
    difficultyMultiplier,
    streakMultiplier,
    totalXP,
    bonusFromDifficulty: Math.round(baseXP * (difficultyMultiplier - 1)),
    bonusFromStreak: Math.round(baseXP * difficultyMultiplier * (streakMultiplier - 1))
  };
}

/**
 * Calcular XP por completar examen
 */
export function calculateExamCompletionXP(results) {
  const { 
    score, 
    totalQuestions, 
    correctCount,
    timeSpent,
    mode 
  } = results;
  
  let totalXP = XP_VALUES.COMPLETE_EXAM;
  
  // Bonus por puntuación alta
  if (score === 100) {
    totalXP += XP_VALUES.PERFECT_EXAM;
  } else if (score >= 90) {
    totalXP += 50; // Casi perfecto
  } else if (score >= 80) {
    totalXP += 25; // Muy bien
  }
  
  // Bonus por cantidad de preguntas
  const questionBonus = Math.floor(totalQuestions / 10) * 10; // 10 XP por cada 10 preguntas
  totalXP += questionBonus;
  
  // Bonus por velocidad (solo si score >= 70%)
  if (score >= 70 && timeSpent) {
    const minutesSpent = Math.floor(timeSpent / 60);
    const questionsPerMinute = totalQuestions / minutesSpent;
    
    if (questionsPerMinute >= 2) {
      totalXP += 30; // Muy rápido
    } else if (questionsPerMinute >= 1) {
      totalXP += 15; // Rápido
    }
  }
  
  // En modo práctica, menos XP (75%)
  if (mode === 'practice') {
    totalXP = Math.round(totalXP * 0.75);
  }
  
  return {
    totalXP,
    breakdown: {
      base: XP_VALUES.COMPLETE_EXAM,
      scoreBonus: totalXP - XP_VALUES.COMPLETE_EXAM - questionBonus,
      questionBonus,
      modeMultiplier: mode === 'practice' ? 0.75 : 1.0
    }
  };
}

/**
 * Calcular XP por completar sesión de estudio
 */
export function calculateStudySessionXP(stats) {
  const {
    totalCards,
    studiedCards,
    timeSpent
  } = stats;
  
  let totalXP = XP_VALUES.COMPLETE_STUDY_SESSION;
  
  // Bonus por cantidad de tarjetas estudiadas
  const cardsBonus = studiedCards * 2; // 2 XP por tarjeta estudiada
  totalXP += cardsBonus;
  
  // Bonus por completar todas las tarjetas
  if (studiedCards === totalCards) {
    totalXP += 50; // Completaste todas!
  }
  
  // Bonus por tiempo dedicado (máximo 30 minutos considerados)
  if (timeSpent) {
    const minutesSpent = Math.min(Math.floor(timeSpent / 60), 30);
    const timeBonus = minutesSpent * 2; // 2 XP por minuto
    totalXP += timeBonus;
  }
  
  return {
    totalXP,
    breakdown: {
      base: XP_VALUES.COMPLETE_STUDY_SESSION,
      cardsBonus,
      completionBonus: studiedCards === totalCards ? 50 : 0,
      timeBonus: timeSpent ? Math.min(Math.floor(timeSpent / 60), 30) * 2 : 0
    }
  };
}

/**
 * Calcular nivel y progreso basado en XP total
 */
export function calculateLevel(totalXP) {
  // Fórmula: Cada nivel requiere level * 100 XP
  let level = 1;
  let xpNeeded = 0;
  let currentLevelXP = totalXP;

  while (currentLevelXP >= level * 100) {
    currentLevelXP -= level * 100;
    xpNeeded += level * 100;
    level++;
  }

  const xpForNextLevel = level * 100;
  const progressPercentage = (currentLevelXP / xpForNextLevel) * 100;

  return { 
    level, 
    currentLevelXP, 
    xpForNextLevel,
    totalXPForNextLevel: xpNeeded + xpForNextLevel,
    progressPercentage: Math.round(progressPercentage)
  };
}

/**
 * Obtener título según nivel
 */
export function getLevelTitle(level) {
  if (level >= 50) return { title: 'Gran Maestro', icon: '👑', color: 'text-yellow-500' };
  if (level >= 40) return { title: 'Leyenda', icon: '🌟', color: 'text-orange-500' };
  if (level >= 30) return { title: 'Sabio', icon: '🧙', color: 'text-purple-500' };
  if (level >= 20) return { title: 'Experto', icon: '🎓', color: 'text-blue-500' };
  if (level >= 10) return { title: 'Avanzado', icon: '📚', color: 'text-green-500' };
  if (level >= 5) return { title: 'Aprendiz', icon: '📖', color: 'text-indigo-500' };
  return { title: 'Novato', icon: '🌱', color: 'text-gray-500' };
}

/**
 * Formatear XP para display (con separadores de miles)
 */
export function formatXP(xp) {
  return xp.toLocaleString('es-ES');
}

/**
 * Calcular XP total ganado en una sesión
 */
export function calculateSessionXP(sessionData) {
  const { type, ...data } = sessionData;
  
  if (type === 'exam') {
    return calculateExamCompletionXP(data);
  } else if (type === 'study') {
    return calculateStudySessionXP(data);
  }
  
  return { totalXP: 0, breakdown: {} };
}

export default {
  calculateAnswerXP,
  calculateExamCompletionXP,
  calculateStudySessionXP,
  calculateLevel,
  getLevelTitle,
  formatXP,
  calculateSessionXP,
  XP_VALUES,
  DIFFICULTY_MULTIPLIERS,
  STREAK_MULTIPLIERS
};
