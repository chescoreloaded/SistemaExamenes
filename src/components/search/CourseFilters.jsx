import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useLanguage } from '@/context/LanguageContext';
import { getEnumOptions, getNumericFilterRanges } from '@/services/metadataService';
import { motion } from 'framer-motion';

export function CourseFilters({ onFilterChange, className = '' }) {
  const { language, t } = useLanguage();
  
  // Estado para TODAS las opciones
  const [options, setOptions] = useState({
    academic_level: [],
    difficulty_level: [],
    year: [],   // ✅ Nuevo
    period: []  // ✅ Nuevo
  });
  
  // Estado de los filtros seleccionados
  const [filters, setFilters] = useState({
    academic_level: '',
    difficulty_level: '',
    year: '',   // ✅ Nuevo
    period: ''  // ✅ Nuevo
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const loadData = async () => {
      setLoading(true);
      // ✅ Cargar ENUMs y Rangos Numéricos en paralelo
      const [enums, ranges] = await Promise.all([
        getEnumOptions(language),
        getNumericFilterRanges()
      ]);

      if (isMounted) {
        setOptions({
          ...enums,
          // Transformar arrays de números [1, 2] a objetos { value: 1, label: '1' } para el select
          year: (ranges?.years || []).map(y => ({ value: y, label: y.toString() })),
          period: (ranges?.periods || []).map(p => ({ value: p, label: p.toString() }))
        });
        setLoading(false);
      }
    };
    loadData();
    return () => { isMounted = false; };
  }, [language]);

  const handleChange = (key, value) => {
    // Convertir a número si es year/period, sino dejar como string
    const finalValue = (key === 'year' || key === 'period') && value !== '' ? parseInt(value) : value;
    const newFilters = { ...filters, [key]: finalValue };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Función helper para renderizar selects
  const renderSelect = (key, label, icon) => (
    <div className="flex-1 min-w-[160px] lg:max-w-[250px]"> {/* Ajusté anchos para que quepan 4 */}
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 ml-1 truncate">
        {icon} {label}
      </label>
      <div className="relative">
        <select
          value={filters[key]}
          onChange={(e) => handleChange(key, e.target.value)}
          disabled={loading}
          className="w-full p-3 pr-10 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-xl appearance-none cursor-pointer focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all duration-200 text-gray-700 dark:text-gray-200 font-medium disabled:opacity-50"
        >
          <option value="">{loading ? t('common.loading') : t('common.filters.allOptions')}</option>
          {options[key]?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-gray-400">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800/50 p-4 lg:p-5 rounded-2xl border border-gray-100 dark:border-gray-700/50 shadow-sm backdrop-blur-sm ${className}`}
    >
      <div className="flex flex-wrap gap-4">
        {renderSelect('academic_level', t('common.filters.academicLevel'), '🎓')}
        {renderSelect('year', t('common.filters.year'), '📅')}
        {renderSelect('period', t('common.filters.period'), '🗓️')}
        {renderSelect('difficulty_level', t('common.filters.difficulty'), '⭐')}
      </div>
    </motion.div>
  );
}

CourseFilters.propTypes = {
  onFilterChange: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default CourseFilters;