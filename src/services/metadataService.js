import { supabase } from '@/lib/supabase';

export async function getEnumOptions(languageCode = 'es') {
  try {
    // 1. Intentar cargar en el idioma solicitado
    let { data, error } = await supabase
      .from('enum_translations')
      .select('enum_type, enum_value, translated_value')
      .eq('language_code', languageCode);

    if (error) throw error;

    // ✅ FALLBACK: Si no hay datos y el idioma no es español, cargar español por defecto
    if ((!data || data.length === 0) && languageCode !== 'es') {
      console.warn(`⚠️ Missing enum translations for '${languageCode}', falling back to 'es'`);
      const fallback = await supabase
        .from('enum_translations')
        .select('enum_type, enum_value, translated_value')
        .eq('language_code', 'es');
        
      data = fallback.data || [];
    }

    // 3. Agrupar por tipo
    const groupedOptions = data.reduce((acc, item) => {
      if (!acc[item.enum_type]) {
        acc[item.enum_type] = [];
      }
      acc[item.enum_type].push({
        value: item.enum_value,
        label: item.translated_value
      });
      return acc;
    }, {});

    return groupedOptions;

  } catch (error) {
    console.error('Error fetching enum options:', error);
    return {}; // Retornar objeto vacío en vez de null para evitar crashes
  }
}

/**
 * Obtiene los rangos min/max para filtros numéricos (año, periodo)
 */
export async function getNumericFilterRanges() {
  try {
    const { data, error } = await supabase
      .from('subjects')
      .select('year, period')
      .eq('is_active', true)
      .eq('is_published', true);

    if (error) throw error;

    if (!data || data.length === 0) return null;

    // Extraer valores únicos y ordenarlos
    const years = [...new Set(data.map(d => d.year).filter(n => n !== null))].sort((a, b) => a - b);
    const periods = [...new Set(data.map(d => d.period).filter(n => n !== null))].sort((a, b) => a - b);

    return {
      years,
      periods
    };

  } catch (error) {
    console.error('Error fetching numeric ranges:', error);
    return { years: [], periods: [] };
  }
}