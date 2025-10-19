import { supabase } from '../lib/supabase';

export const subjectsService = {
  /**
   * Obtener todas las materias con sus categorías
   */
  async getAll() {
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        categories (
          id,
          slug,
          name,
          weight,
          order_index
        )
      `)
      .order('name');
    
    if (error) throw error;
    return data;
  },

  /**
   * Obtener una materia por ID o slug
   */
  async getById(id) {
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        categories (
          id,
          slug,
          name,
          weight,
          order_index
        )
      `)
      .or(`id.eq.${id},slug.eq.${id}`)
      .single();
    
    if (error) throw error;
    return data;
  },

  /**
   * Obtener configuración completa de una materia
   */
  async getConfig(subjectId) {
    const subject = await this.getById(subjectId);
    
    return {
      id: subject.slug,
      name: subject.name,
      description: subject.description,
      icon: subject.icon,
      theme: subject.theme,
      settings: {
        timeLimit: subject.time_limit,
        passingScore: subject.passing_score,
        randomizeQuestions: subject.randomize_questions,
        randomizeOptions: subject.randomize_options,
        instantFeedback: subject.instant_feedback,
        showCorrectAnswer: subject.show_correct_answer,
        showExplanations: subject.show_explanations,
        allowReview: subject.allow_review
      },
      categories: subject.categories
    };
  }
};