import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export function Loading({ fullScreen = false, text = 'Cargando...' }) {
  const container = fullScreen 
    ? 'fixed inset-0 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center z-50' 
    : 'flex items-center justify-center p-8';

  return (
    <div className={container}>
      <div className="text-center">
        {/* Spinner animado con gradiente */}
        <div className="relative w-24 h-24 mx-auto mb-6">
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            style={{
              clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)'
            }}
          />
          <div className="absolute inset-2 rounded-full bg-white" />
          
          {/* Emoji central animado */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center text-4xl"
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 10, -10, 0]
            }}
            transition={{ 
              duration: 2, 
              repeat: Infinity,
              ease: "easeInOut"
            }}
          >
            📚
          </motion.div>
        </div>

        {/* Texto con animación */}
        <motion.p 
          className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          {text}
        </motion.p>

        {/* Puntos animados */}
        <div className="flex justify-center gap-2 mt-4">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"
              animate={{ 
                y: [0, -10, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{ 
                duration: 0.6, 
                repeat: Infinity,
                delay: i * 0.2
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

Loading.propTypes = {
  fullScreen: PropTypes.bool,
  text: PropTypes.string
};

export default Loading;