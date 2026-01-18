import { motion, AnimatePresence } from 'framer-motion';

export const StreakRail = ({ streak = 0 }) => {
  // Capamos la racha visual a 5 para el loop de UI (aunque internamente siga contando)
  const activeNodes = Math.min(streak, 5);
  const isOnFire = streak >= 5;

  return (
    <div className="flex flex-col items-center gap-1">
      
      {/* Texto de Racha (Solo aparece si hay racha) */}
      <div className="h-6 flex items-end justify-center overflow-hidden">
         <AnimatePresence mode="wait">
            {streak > 1 && (
                <motion.span 
                    key={streak}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    className={`text-xs font-black uppercase tracking-widest ${
                        isOnFire ? 'text-orange-500 drop-shadow-sm' : 'text-indigo-400'
                    }`}
                >
                    {isOnFire ? '¡EN LLAMAS!' : 'RACHA'} {streak}
                </motion.span>
            )}
         </AnimatePresence>
      </div>

      {/* Riel de Nodos */}
      <div className="flex gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-inner relative overflow-hidden">
        
        {/* Efecto de Fondo cuando está en llamas */}
        {isOnFire && (
            <motion.div 
                layoutId="fire-bg"
                className="absolute inset-0 bg-gradient-to-r from-orange-400/20 to-red-500/20 blur-sm"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1, repeat: Infinity }}
            />
        )}

        {[1, 2, 3, 4, 5].map((index) => {
          const isActive = index <= activeNodes;
          
          // Definir color según la intensidad
          let activeColor = "bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]"; // Default Blue
          if (index > 2) activeColor = "bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.6)]"; // Hot
          if (index === 5) activeColor = "bg-red-600 shadow-[0_0_20px_rgba(220,38,38,0.8)]"; // Fire

          return (
            <div key={index} className="relative w-8 h-2 rounded-full bg-gray-300 dark:bg-gray-700 overflow-hidden">
                {/* Relleno Animado */}
                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '0%' }}
                            exit={{ x: '100%', opacity: 0 }} // Al fallar, se va volando
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className={`absolute inset-0 w-full h-full ${activeColor}`}
                        >
                            {/* Brillo interno */}
                            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/40 to-transparent" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
};