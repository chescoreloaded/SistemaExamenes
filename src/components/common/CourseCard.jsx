import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useSoundContext } from '@/context/SoundContext';
import { useLanguage } from '@/context/LanguageContext';

export default function CourseCard({ subject, stats = null }) {
  const navigate = useNavigate();
  const { playClick } = useSoundContext();
  const { t } = useLanguage();

  const handleClick = () => {
    playClick();
    navigate(`/course/${subject.id}`);
  };

  // Normalizar dificultad para traducción (a minúsculas)
  const difficultyKey = subject.difficulty_level?.toLowerCase() || 'basic';
  const difficultyLabel = t(`common.difficulty.${difficultyKey}`);

  // Color base vibrante (fallback si no hay color en BD)
  const cardColor = subject.color || '#6366F1'; // Indigo vibrante por defecto

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full relative overflow-hidden rounded-2xl shadow-lg cursor-pointer group"
      onClick={handleClick}
      style={{ 
        backgroundColor: cardColor,
        boxShadow: `0 10px 30px -10px ${cardColor}AA` // Sombra coloreada brillante
      }}
    >
      {/* ✨ EFECTO GLOSSY / LACA */}
      {/* Una banda semitransparente que cruza la tarjeta en hover */}
<div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden">
   <div className="absolute top-0 -left-[150%] w-[80%] h-full bg-gradient-to-r from-transparent via-white/25 to-transparent transform -skew-x-25 transition-all duration-[2500ms] ease-in-out group-hover:left-[150%]" />
</div>

      {/* Patrón de fondo sutil para textura (opcional) */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-white to-transparent" />

      <div className="relative z-10 p-6 h-full flex flex-col text-white">
        {/* Header: Icono y Dificultad */}
        <div className="flex justify-between items-start mb-4">
          <div className="text-5xl filter drop-shadow-md transform group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
            {subject.icon || '📘'}
          </div>
          {subject.difficulty_level && (
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase bg-white/20 backdrop-blur-md border border-white/30 shadow-sm">
              {difficultyLabel}
            </span>
          )}
        </div>

        {/* Título y Descripción */}
        <div className="flex-1">
          <h3 className="text-2xl font-extrabold mb-2 leading-tight filter drop-shadow-sm">
            {subject.name}
          </h3>
          <p className="text-white/80 text-sm line-clamp-3 leading-relaxed font-medium">
            {subject.description}
          </p>
        </div>

        {/* Footer: Stats en Píldoras Translúcidas */}
        <div className="mt-6 flex flex-wrap gap-2">
          {subject.base_xp && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm text-xs font-bold text-white/90">
              <span>⭐</span> {subject.base_xp} XP
            </div>
          )}
          {subject.estimated_hours && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-black/20 backdrop-blur-sm text-xs font-bold text-white/90">
              <span>⏱️</span> {subject.estimated_hours}h
            </div>
          )}
          {/* Indicador si ya lo empezó */}
          {stats?.totalAttempts > 0 && (
            <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-xs font-bold" style={{ color: cardColor }}>
              <span>🔄</span> {Math.round(stats.bestScore)}%
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}