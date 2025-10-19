/**
 * Mezclar array usando Fisher-Yates shuffle
 */
export function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Mezclar opciones de una pregunta y actualizar índice correcto
 */
export function shuffleOptions(options, correctIndex) {
  const correctAnswer = options[correctIndex];
  const shuffled = shuffleArray(options);
  const newCorrectIndex = shuffled.indexOf(correctAnswer);
  
  return {
    options: shuffled,
    correctIndex: newCorrectIndex
  };
}