import { supabase } from '../lib/supabase';

export const questionsService = {
  /**
   * Obtener todas las preguntas de una materia
   */
  async getBySubject(subjectId) {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        categories (
          slug,
          name
        )
      `)
      .eq('subject_id', subjectId)
      .eq('is_active', true)
      .order('order_index');
    
    if (error) throw error;
    
    // Transformar al formato que espera la app
    return data.map(q => ({
      id: q.id,
      type: q.type,
      category: q.categories?.slug || 'general',
      difficulty: q.difficulty,
      question: q.question_text,
      options: q.options,
      correct: q.correct_index,
      explanation: q.explanation,
      points: q.points
    }));
  },

  /**
   * Obtener preguntas por categoría
   */
  async getByCategory(subjectId, categorySlug) {
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('subject_id', subjectId)
      .eq('slug', categorySlug)
      .single();
    
    if (!category) return [];

    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('category_id', category.id)
      .eq('is_active', true)
      .order('order_index');
    
    if (error) throw error;
    return data;
  },

  /**
   * Obtener estadísticas de preguntas
   */
  async getStats(subjectId) {
    const { data, error } = await supabase
      .from('questions')
      .select('difficulty, category_id')
      .eq('subject_id', subjectId)
      .eq('is_active', true);
    
    if (error) throw error;

    const stats = {
      total: data.length,
      byDifficulty: {},
      byCategory: {}
    };

    data.forEach(q => {
      stats.byDifficulty[q.difficulty] = (stats.byDifficulty[q.difficulty] || 0) + 1;
      stats.byCategory[q.category_id] = (stats.byCategory[q.category_id] || 0) + 1;
    });

    return stats;
  }
};