import { supabase } from '../lib/supabase';

export const resultsService = {
  /**
   * Guardar resultado de un examen
   */
  async save(result) {
    const { data, error } = await supabase
      .from('exam_sessions')
      .insert({
        subject_id: result.subjectId,
        mode: result.mode,
        total_questions: result.totalQuestions,
        answered_questions: result.answeredQuestions,
        correct_answers: result.correctAnswers,
        score: result.score,
        passed: result.passed,
        time_spent_seconds: result.timeSpent,
        started_at: result.startedAt,
        completed_at: result.completedAt || new Date().toISOString(),
        user_answers: result.answers,
        reviewed_questions: result.reviewedQuestions || []
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Obtener historial de resultados de una materia
   */
  async getHistory(subjectId, limit = 10) {
    const { data, error } = await supabase
      .from('exam_sessions')
      .select('*')
      .eq('subject_id', subjectId)
      .order('completed_at', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  },

  /**
   * Obtener estadísticas generales
   */
  async getStats(subjectId) {
    const { data, error } = await supabase
      .from('exam_sessions')
      .select('score, mode, passed')
      .eq('subject_id', subjectId);
    
    if (error) throw error;

    const stats = {
      totalExams: data.length,
      averageScore: 0,
      passRate: 0,
      byMode: {}
    };

    if (data.length > 0) {
      stats.averageScore = data.reduce((sum, s) => sum + s.score, 0) / data.length;
      stats.passRate = (data.filter(s => s.passed).length / data.length) * 100;
      
      data.forEach(s => {
        if (!stats.byMode[s.mode]) {
          stats.byMode[s.mode] = { count: 0, avgScore: 0 };
        }
        stats.byMode[s.mode].count++;
      });
    }

    return stats;
  }
};