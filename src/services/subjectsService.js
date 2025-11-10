import { supabase } from '@/lib/supabase';

/**
 * Helper para manejar fallbacks de idioma
 */
async function fetchWithFallback(tableName, translationTable, language, queryBuilder) {
  // 1. Intento principal con el idioma solicitado
  let { data, error } = await queryBuilder(
    supabase.from(tableName).select(`*, translation:${translationTable}!inner(*)`)
  ).eq(`${translationTable}.language_code`, language);

  // 2. Si no hay error pero tampoco datos, y el idioma no es español, intentar fallback a 'es'
  if (!error && (!data || data.length === 0) && language !== 'es') {
    console.warn(`⚠️ No translations found for ${tableName} in '${language}'. Falling back to 'es'.`);
    const fallbackResult = await queryBuilder(
      supabase.from(tableName).select(`*, translation:${translationTable}!inner(*)`)
    ).eq(`${translationTable}.language_code`, 'es');
    
    data = fallbackResult.data;
    error = fallbackResult.error;
  }

  return { data, error };
}

export async function getSubjects(language = 'es') {
  try {
    // Usamos el helper para la query base
    const { data, error } = await fetchWithFallback(
      'subjects',
      'subject_translations',
      language,
      (query) => query
        .eq('is_active', true)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
    );

    if (error) throw error;

    return (data || []).map(subject => ({
      ...subject,
      name: subject.translation[0]?.name || 'Sin nombre',
      description: subject.translation[0]?.description || '',
      institution: subject.translation[0]?.institution || ''
    }));

  } catch (error) {
    console.error('Error loading subjects:', error);
    return [];
  }
}

export async function getSubject(slugOrId, language = 'es') {
  try {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);
    
    // 1. Obtener Subject con fallback
    let { data: subject, error: subjectError } = await fetchWithFallback(
      'subjects',
      'subject_translations',
      language,
      (query) => query.eq(isUUID ? 'id' : 'slug', slugOrId).single()
    );

    if (subjectError) throw subjectError;
    if (!subject) return null;

    // 2. Obtener Categorías con fallback (usando el mismo idioma que resultó para subject)
    // Determinamos qué idioma se usó finalmente para mantener coherencia
    const effectiveLanguage = subject.translation[0]?.language_code || language;

    const { data: categories, error: catError } = await supabase
      .from('categories')
      .select(`*, translation:category_translations!inner(*)`)
      .eq('subject_id', subject.id)
      .eq('category_translations.language_code', effectiveLanguage);

    if (catError) console.warn('Error loading categories:', catError); // No bloqueante

    const formattedCategories = (categories || []).map(cat => ({
      ...cat,
      name: cat.translation[0]?.name || 'Sin categoría',
      description: cat.translation[0]?.description || ''
    }));

    return {
      ...subject,
      name: subject.translation[0]?.name || 'Sin nombre',
      description: subject.translation[0]?.description || '',
      institution: subject.translation[0]?.institution || '',
      curriculum: subject.translation[0]?.curriculum || '',
      instructor: subject.translation[0]?.instructor || '',
      categories: formattedCategories
    };

  } catch (error) {
    console.error('Error loading subject:', error);
    return null;
  }
}

export async function getQuestions(subjectId, language = 'es') {
  try {
    const { data, error } = await fetchWithFallback(
      'questions',
      'question_translations',
      language,
      (query) => query
        .eq('subject_id', subjectId)
        .eq('is_active', true)
        .order('order_index', { ascending: true })
    );

    if (error) throw error;

    return (data || []).map(q => ({
      ...q,
      question: q.translation[0]?.question_text || '',
      options: q.translation[0]?.options || [],
      explanation: q.translation[0]?.explanation || '',
      hint: q.translation[0]?.hint || '',
      correct: q.correct_index
    }));

  } catch (error) {
    console.error('Error loading questions:', error);
    return [];
  }
}

export async function getFlashcards(subjectId, language = 'es') {
  try {
    const { data, error } = await fetchWithFallback(
      'flashcards',
      'flashcard_translations',
      language,
      (query) => query
        .eq('subject_id', subjectId)
        .eq('is_active', true)
        .order('order_index', { ascending: true })
    );

    if (error) throw error;

    return (data || []).map(fc => ({
      ...fc,
      front: fc.translation[0]?.front_text || '',
      front_emoji: fc.translation[0]?.front_emoji || '❓',
      back: fc.translation[0]?.back_answer || '',
      back_explanation: fc.translation[0]?.back_explanation || '',
      back_mnemonic: fc.translation[0]?.back_mnemonic || ''
    }));

  } catch (error) {
    console.error('Error loading flashcards:', error);
    return [];
  }
}