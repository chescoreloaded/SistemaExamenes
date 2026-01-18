import { motion, AnimatePresence } from 'framer-motion';
import { useMemo } from 'react';

// Subcomponente de Trofeo (Loot Box)
const LootDisplay = ({ streak, difficulty }) => {
  // El cofre mejora visualmente según la racha
  const lootTier = streak >= 10 ? 'legendary' : streak >= 5 ? 'epic' : 'common';
  
  const getLootIcon = () => {
    switch(lootTier) {
        case 'legendary': return '💎'; // O tu imagen de trofeo nivel Dios
        case 'epic': return '👑';      // Trofeo oro
        default: return '📦';          // Caja común
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-16">
       <motion.div 
         key={lootTier}
         initial={{ scale: 0.8 }}
         animate={{ scale: 1, rotate: lootTier === 'legendary' ? [0, -10, 10, 0] : 0 }}
         transition={{ type: "spring" }}
         className="text-3xl filter drop-shadow-lg cursor-help"
         title="Tu recompensa potencial si apruebas"
       >
         {getLootIcon()}
       </motion.div>
       <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">Loot</span>
    </div>
  );
};

// Subcomponente de Nivel
const LevelDisplay = ({ level = 12 }) => (
  <div className="flex flex-col items-center justify-center w-16">
    <div className="relative">
        {/* Hexágono o Círculo de nivel */}
        <div className="w-10 h-10 bg-indigo-600 rounded-lg rotate-45 border-2 border-indigo-400 shadow-lg flex items-center justify-center overflow-hidden">
            <div className="-rotate-45 font-bold text-white text-sm">{level}</div>
        </div>
        {/* Badge pequeño */}
        <div className="absolute -bottom-1 -right-1 bg-yellow-400 text-[8px] font-black text-yellow-900 px-1 rounded-sm border border-white">
            LVL
        </div>
    </div>
  </div>
);

// Barra de Racha Mejorada (Con efecto de Fuego CSS)
const FireBar = ({ streak }) => {
    const maxStreak = 5; // Cap visual
    const fillPercent = Math.min((streak / maxStreak) * 100, 100);
    const isOnFire = streak >= 5;

    return (
        <div className="flex-1 flex flex-col items-center px-4 max-w-[200px]">
            {/* Texto Dinámico */}
            <div className="h-5 mb-1 flex items-center">
                <AnimatePresence mode="wait">
                    <motion.span 
                        key={streak}
                        initial={{ y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className={`text-xs font-black uppercase tracking-widest ${isOnFire ? 'text-orange-500' : 'text-gray-400'}`}
                    >
                        {isOnFire ? '🔥 ¡EN LLAMAS!' : `${streak} SEGUIDAS`}
                    </motion.span>
                </AnimatePresence>
            </div>

            {/* La Barra Contenedora */}
            <div className="w-full h-3 bg-gray-800 rounded-full border border-gray-700 relative overflow-hidden shadow-inner">
                {/* El Relleno Líquido */}
                <motion.div 
                    className={`h-full absolute left-0 top-0 rounded-full ${
                        isOnFire 
                        ? 'bg-gradient-to-r from-orange-500 via-red-500 to-yellow-400' 
                        : 'bg-gradient-to-r from-blue-500 to-indigo-500'
                    }`}
                    initial={{ width: '0%' }}
                    animate={{ width: `${fillPercent}%` }}
                    transition={{ type: "spring", stiffness: 100, damping: 20 }}
                >
                    {/* Efecto de Brillo/Partículas si está en llamas */}
                    {isOnFire && (
                        <motion.div 
                            className="absolute inset-0 bg-white/30"
                            animate={{ x: ['-100%', '100%'] }}
                            transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
                        />
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export const GamificationHUD = ({ streak, level, difficulty }) => {
  return (
    <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-lg mx-auto bg-gray-900/50 backdrop-blur-md border border-white/10 rounded-2xl p-2 flex items-center justify-between shadow-xl mb-6"
    >
        <LevelDisplay level={level} />
        
        {/* Divisor vertical sutil */}
        <div className="w-px h-8 bg-white/10" />
        
        <FireBar streak={streak} />
        
        {/* Divisor vertical sutil */}
        <div className="w-px h-8 bg-white/10" />
        
        <LootDisplay streak={streak} difficulty={difficulty} />
    </motion.div>
  );
};