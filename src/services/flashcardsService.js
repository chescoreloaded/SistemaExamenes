import { supabase } from '../lib/supabase';

export const flashcardsService = {
  /**
   * Obtener todas las flashcards de una materia
   */
  async getBySubject(subjectId) {
    const { data, error } = await supabase
      .from('flashcards')
      .select(`
        *,
        categories (
          slug,
          name
        )
      `)
      .eq('subject_id', subjectId)
      .order('order_index');
    
    if (error) throw error;
    
    // Transformar al formato que espera la app
    return data.map(card => ({
      id: card.id,
      category: card.categories?.slug || 'general',
      difficulty: card.difficulty,
      front: {
        text: card.front_text,
        emoji: card.front_emoji
      },
      back: {
        answer: card.back_answer,
        explanation: card.back_explanation,
        mnemonic: card.back_mnemonic
      },
      tags: card.tags || []
    }));
  },

  /**
   * Obtener flashcards por categoría
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
      .from('flashcards')
      .select('*')
      .eq('category_id', category.id)
      .order('order_index');
    
    if (error) throw error;
    return data;
  }
};