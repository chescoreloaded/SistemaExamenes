import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export default function StudyProgress({ 
  current,        // Índice actual (1-based)
  total,          // Total de tarjetas
  studied,        // ✅ NUEVO: Cantidad de tarjetas estudiadas
  subjectName 
}) {
  // Calcular progreso basado en estudiadas
  const progress = total > 0 ? (studied / total) * 100 : 0;

  return (
    <motion.div 
      className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg border-b-4 border-white/20 sticky top-0 z-40"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100 }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Subject info */}
          <div>
            <h1 className="text-xl font-bold">{subjectName}</h1>
            <p className="text-sm text-white/90 font-medium">
              📚 Modo Estudio
            </p>
          </div>
          
          {/* Progress info */}
          <div className="text-right">
            <div className="text-2xl font-bold">
              Tarjeta {current} / {total}
            </div>
            <div className="text-sm text-white/90 font-medium">
              {/* ✅ CAMBIO: Mostrar tarjetas estudiadas */}
              {studied} estudiadas • {Math.round(progress)}% completado
            </div>
          </div>
        </div>
        
        {/* Progress bar basado en tarjetas estudiadas */}
        <div className="mt-3 bg-white/20 rounded-full h-2.5 overflow-hidden shadow-inner">
          <motion.div 
            className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 h-full rounded-full shadow-lg"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
}

StudyProgress.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  studied: PropTypes.number.isRequired, // ✅ NUEVO
  subjectName: PropTypes.string.isRequired
};