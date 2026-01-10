import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSoundContext } from '@/context/SoundContext';
import { useLanguage } from '@/context/LanguageContext';

export default function CourseCard({ subject, stats = null }) {
  const navigate = useNavigate();
  const { playClick } = useSoundContext();
  const { t } = useLanguage();

  const handleClick = () => {
    playClick(); // El nuevo useSound manejará el debounce
    navigate(`/course/${subject.id}`);
  };

  // ✅ FIX: Traducción y Mapeo Seguro
  // El backend puede enviar 'beginner', 'principiante', 'BEGINNER', etc.
  // Mapeamos todo a keys que sabemos que existen en translations.js
  const mapDifficulty = (raw) => {
    if (!raw) return 'basic';
    const lower = raw.toLowerCase();
    
    const mapping = {
      'beginner': 'basic', // Si no tienes key 'beginner', usa 'basic'
      'principiante': 'basic',
      'intro': 'basic',
      'basic': 'basic',
      'intermediate': 'intermediate',
      'intermedio': 'intermediate',
      'advanced': 'advanced',
      'avanzado': 'advanced'
    };

    return mapping[lower] || 'basic';
  };

  const difficultyKey = mapDifficulty(subject.difficulty_level);
  
  // Intenta traducir. Si falla, mostrará la key, pero al menos está mapeada.
  // IMPORTANTE: Asegúrate de tener "basic", "intermediate", "advanced" en tu archivo translations.js
  const difficultyLabel = t(`common.difficulty.${difficultyKey}`);

  // Color base vibrante (fallback si no hay color en BD)
  const cardColor = subject.color || '#6366F1'; 

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full relative overflow-hidden rounded-2xl shadow-lg cursor-pointer group flex flex-col"
      onClick={handleClick}
      style={{ 
        backgroundColor: cardColor,
        boxShadow: `0 10px 30px -10px ${cardColor}AA`
      }}
    >
      {/* Efecto Glossy */}
      <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
         <div className="absolute top-0 -left-[150%] w-[80%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent transform -skew-x-25 transition-all duration-1000 ease-in-out group-hover:left-[150%]" />
      </div>

      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />

      {/* ✅ CORRECCIÓN PADDING: Menos padding en móvil (p-5), normal en desktop (md:p-6) */}
      <div className="relative z-10 p-5 md:p-6 h-full flex flex-col text-white">
        
        {/* Header: Icono y Dificultad */}
        <div className="flex justify-between items-start mb-4">
          {/* Icono responsivo */}
          <div className="text-4xl md:text-5xl filter drop-shadow-md transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            {subject.icon || '📘'}
          </div>
          {subject.difficulty_level && (
            <span className="px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase bg-white/20 backdrop-blur-md border border-white/30 shadow-sm tracking-wider">
              {difficultyLabel}
            </span>
          )}
        </div>

        {/* Título y Descripción */}
        <div className="flex-1">
          <h3 className="text-xl md:text-2xl font-extrabold mb-2 leading-tight filter drop-shadow-sm">
            {subject.name}
          </h3>
          <p className="text-white/80 text-sm line-clamp-3 leading-relaxed font-medium">
            {subject.description}
          </p>
        </div>

        {/* Footer: Stats */}
        <div className="mt-6 flex flex-wrap gap-2">
          {subject.base_xp && (
            <div className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 rounded-lg bg-black/20 backdrop-blur-sm text-xs font-bold text-white/90">
              <span>⭐</span> {subject.base_xp} XP
            </div>
          )}
          {subject.estimated_hours && (
            <div className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 rounded-lg bg-black/20 backdrop-blur-sm text-xs font-bold text-white/90">
              <span>⏱️</span> {subject.estimated_hours}h
            </div>
          )}
          {stats?.totalAttempts > 0 && (
            <div className="flex items-center gap-1 px-2 py-1 md:px-3 md:py-1.5 rounded-lg bg-white text-xs font-bold" style={{ color: cardColor }}>
              <span>🔄</span> {Math.round(stats.bestScore)}%
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}