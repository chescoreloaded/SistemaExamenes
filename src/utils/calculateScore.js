/**
 * Calcular resultados del examen
 */
export function calculateResults(questions, answers) {
  const total = questions.length;
  const answered = Object.keys(answers).length;
  let correct = 0;
  
  const byCategory = {};
  
  questions.forEach(question => {
    const userAnswer = answers[question.id];
    const isCorrect = userAnswer === question.correct;
    
    if (isCorrect) {
      correct++;
    }
    
    // Estadísticas por categoría
    if (!byCategory[question.category]) {
      byCategory[question.category] = {
        total: 0,
        answered: 0,
        correct: 0
      };
    }
    
    byCategory[question.category].total++;
    
    if (userAnswer !== undefined) {
      byCategory[question.category].answered++;
      if (isCorrect) {
        byCategory[question.category].correct++;
      }
    }
  });
  
  const score = total > 0 ? (correct / total) * 100 : 0;
  
  return {
    totalQuestions: total,
    answeredQuestions: answered,
    unansweredQuestions: total - answered,
    correctAnswers: correct,
    incorrectAnswers: answered - correct,
    score: Math.round(score * 100) / 100,
    byCategory
  };
}