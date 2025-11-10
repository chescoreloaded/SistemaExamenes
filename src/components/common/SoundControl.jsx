import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Componente de control de sonido con panel desplegable
 */
export function SoundControl({ 
  isMuted, 
  volume, 
  onToggleMute, 
  onVolumeChange,
  onTest,
  compact = false // ✅ Añadí prop compact si la usas en otros lados, aunque por defecto es false
}) {
  const [showPanel, setShowPanel] = useState(false);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    onVolumeChange(newVolume);
  };

  return (
    <div className="relative">
      {/* Botón principal AJUSTADO */}
      <motion.button
        onClick={() => setShowPanel(!showPanel)}
        // ✅ CAMBIO CLAVE: w-10 h-10 flex items-center justify-center (reemplaza p-3)
        // También ajusté el shadow y border para coincidir con los otros
        className="w-10 h-10 flex items-center justify-center bg-white dark:bg-gray-800 rounded-full shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 dark:border-gray-700"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Control de sonido"
      >
        <span className="text-xl"> {/* Ajusté el tamaño del icono también a text-xl */}
          {isMuted ? '🔇' : volume > 0.5 ? '🔊' : volume > 0 ? '🔉' : '🔈'}
        </span>
      </motion.button>

      {/* Panel desplegable (Sin cambios mayores, solo asegurando z-index) */}
      <AnimatePresence>
        {showPanel && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-4 w-64 border border-gray-200 dark:border-gray-700 z-50"
          >
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b border-gray-200 dark:border-gray-700">
                <h3 className="font-bold text-gray-800 dark:text-white">
                  🎵 Control de Sonido
                </h3>
                <button
                  onClick={() => setShowPanel(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  ✕
                </button>
              </div>

              {/* Mute toggle */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Silenciar
                </span>
                <button
                  onClick={onToggleMute}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isMuted 
                      ? 'bg-indigo-500' // Invertido para que coincida con UX habitual (activo = muteado)
                      : 'bg-gray-300 dark:bg-gray-600' 
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isMuted ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Volume slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    Volumen
                  </span>
                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  disabled={isMuted}
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider accent-indigo-500"
                  style={{
                    background: isMuted 
                      ? undefined 
                      : `linear-gradient(to right, #6366f1 0%, #6366f1 ${volume * 100}%, #e5e7eb ${volume * 100}%, #e5e7eb 100%)`
                  }}
                />
              </div>

              {/* Test button */}
              <button
                onClick={() => {
                  if (onTest) onTest();
                }}
                disabled={isMuted}
                className="w-full py-2 px-4 bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 dark:disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
              >
                🎵 Probar sonido
              </button>

              {/* Info */}
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Los sonidos mejoran la experiencia
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop para cerrar */}
      {showPanel && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowPanel(false)}
        />
      )}
    </div>
  );
}

SoundControl.propTypes = {
  isMuted: PropTypes.bool.isRequired,
  volume: PropTypes.number.isRequired,
  onToggleMute: PropTypes.func.isRequired,
  onVolumeChange: PropTypes.func.isRequired,
  onTest: PropTypes.func,
  compact: PropTypes.bool
};

export default SoundControl;