import { motion } from 'framer-motion';
import { useTheme } from '@/context/ThemeContext';
import { useLanguage } from '@/context/LanguageContext';
// ✅ CORRECCIÓN: Importamos 'useSoundContext' que es como se llama en tu archivo real
import { useSoundContext } from '@/context/SoundContext';

export function HeaderControls() {
  // 1. Hook del Tema (Este arregla las gráficas)
  const { theme, toggleTheme } = useTheme();
  
  // 2. Hook del Idioma
  const { language, setLanguage, t } = useLanguage();
  
  // 3. Hook de Sonido (Usamos el nombre correcto)
  const { soundEnabled, toggleSound } = useSoundContext();

  return (
    <div className="flex items-center gap-2 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm p-1.5 rounded-full border border-gray-200/50 dark:border-gray-700/50 shadow-sm">
      
      {/* --- BOTÓN DE TEMA (LA SOLUCIÓN) --- */}
      <button
        // ✅ CLAVE: Usamos toggleTheme del Contexto, no manipulamos el DOM directamente
        onClick={toggleTheme}
        className="relative p-2 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-all text-gray-600 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
        title={t ? t('settings.theme') : 'Tema'}
        aria-label="Toggle theme"
      >
        <div className="relative w-5 h-5">
          {/* Sol (Visible en Light) */}
          <motion.span
            initial={false}
            animate={{ scale: theme === 'dark' ? 0 : 1, opacity: theme === 'dark' ? 0 : 1, rotate: theme === 'dark' ? 90 : 0 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            ☀️
          </motion.span>
          
          {/* Luna (Visible en Dark) */}
          <motion.span
            initial={false}
            animate={{ scale: theme === 'dark' ? 1 : 0, opacity: theme === 'dark' ? 1 : 0, rotate: theme === 'dark' ? 0 : -90 }}
            className="absolute inset-0 flex items-center justify-center text-indigo-400"
          >
            🌙
          </motion.span>
        </div>
      </button>

      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* --- BOTÓN DE IDIOMA --- */}
      <button
        onClick={() => setLanguage(language === 'es' ? 'en' : 'es')}
        className="p-1.5 px-2.5 rounded-full hover:bg-white dark:hover:bg-gray-700 transition-all text-sm font-bold text-gray-600 dark:text-gray-300 focus:outline-none"
        aria-label="Change language"
      >
        <motion.div
          key={language}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
        >
          {language.toUpperCase()}
        </motion.div>
      </button>

      <div className="w-px h-4 bg-gray-300 dark:bg-gray-600 mx-1" />

      {/* --- BOTÓN DE SONIDO --- */}
      <button
        onClick={toggleSound}
        className={`p-2 rounded-full transition-all focus:outline-none ${
          soundEnabled 
            ? 'text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30' 
            : 'text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
        aria-label="Toggle sound"
      >
        {soundEnabled ? '🔊' : '🔇'}
      </button>
    </div>
  );
}

export default HeaderControls;