import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useEffect, useRef } from 'react'; // ✅ 1. Importar hooks
import { useSoundContext } from '@/context/SoundContext'; // ✅ 2. Importar contexto

/**
 * Transiciones de página predefinidas
 */
const transitions = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.3 }
  },
  
  slideRight: {
    initial: { x: '-100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '100%', opacity: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  
  slideLeft: {
    initial: { x: '100%', opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: '-100%', opacity: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  
  slideUp: {
    initial: { y: '100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '-100%', opacity: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  
  slideDown: {
    initial: { y: '-100%', opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: '100%', opacity: 0 },
    transition: { type: 'spring', stiffness: 300, damping: 30 }
  },
  
  scale: {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0 },
    transition: { duration: 0.3 }
  },
  
  rotate: {
    initial: { rotate: -90, opacity: 0 },
    animate: { rotate: 0, opacity: 1 },
    exit: { rotate: 90, opacity: 0 },
    transition: { duration: 0.4 }
  },
  
  blur: {
    initial: { filter: 'blur(10px)', opacity: 0 },
    animate: { filter: 'blur(0px)', opacity: 1 },
    exit: { filter: 'blur(10px)', opacity: 0 },
    transition: { duration: 0.3 }
  }
};

/**
 * Wrapper para transiciones de página
 */
export function PageTransition({ 
  children, 
  type = 'fade',
  className = ''
}) {
  const location = useLocation();
  const transition = transitions[type] || transitions.fade;
  const { playPageTransition } = useSoundContext();
  const isInitialLoad = useRef(true); // Para no sonar en la primera carga
useEffect(() => {
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
    } else {
      // Solo reproducir si no es la carga inicial
      playPageTransition();
    }
    // 'playPageTransition' no debe estar en el array de dependencias
    // para evitar que el efecto se redisare si el hook de sonido cambia.
  }, [location.pathname]); // Disparar solo cuando la ruta cambie

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={transition.initial}
        animate={transition.animate}
        exit={transition.exit}
        transition={transition.transition}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Transición con efecto de cortina
 */
export function CurtainTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} className="relative">
        {/* Cortina superior */}
        <motion.div
          className="fixed top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-indigo-600 to-purple-600 z-50"
          initial={{ y: 0 }}
          animate={{ y: '-100%' }}
          exit={{ y: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />
        
        {/* Cortina inferior */}
        <motion.div
          className="fixed bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-indigo-600 to-purple-600 z-50"
          initial={{ y: 0 }}
          animate={{ y: '100%' }}
          exit={{ y: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        />

        {/* Contenido */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Transición con efecto de revelado circular
 */
export function CircleRevealTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={location.pathname} className="relative">
        {/* Círculo de revelado */}
        <motion.div
          className="fixed inset-0 bg-indigo-600 z-50 rounded-full"
          style={{
            clipPath: 'circle(0% at 50% 50%)'
          }}
          initial={{ clipPath: 'circle(150% at 50% 50%)' }}
          animate={{ clipPath: 'circle(0% at 50% 50%)' }}
          exit={{ clipPath: 'circle(150% at 50% 50%)' }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
        />

        {/* Contenido */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.3 }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Transición con efecto de flip 3D
 */
export function FlipTransition({ children }) {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        exit={{ rotateY: -90, opacity: 0 }}
        transition={{ duration: 0.5 }}
        style={{ 
          transformStyle: 'preserve-3d',
          perspective: 1000 
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/**
 * Stagger children - anima elementos hijos secuencialmente
 */
export function StaggerChildren({ 
  children, 
  staggerDelay = 0.1,
  className = ''
}) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3 }
    }
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className={className}
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div key={index} variants={itemVariants}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={itemVariants}>
          {children}
        </motion.div>
      )}
    </motion.div>
  );
}

/**
 * Fade in cuando entra en viewport
 */
export function FadeInWhenVisible({ children, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Hover scale effect
 */
export function ScaleOnHover({ children, scale = 1.05, className = '' }) {
  return (
    <motion.div
      whileHover={{ scale }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Shake animation (para errores)
 */
export function ShakeAnimation({ children, trigger, className = '' }) {
  return (
    <motion.div
      animate={trigger ? {
        x: [0, -10, 10, -10, 10, 0],
        transition: { duration: 0.4 }
      } : {}}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/**
 * Bounce animation
 */
export function BounceAnimation({ children, className = '' }) {
  return (
    <motion.div
      animate={{
        y: [0, -20, 0]
      }}
      transition={{
        duration: 0.6,
        repeat: Infinity,
        repeatDelay: 2
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// PropTypes
PageTransition.propTypes = {
  children: PropTypes.node.isRequired,
  type: PropTypes.oneOf([
    'fade', 'slideRight', 'slideLeft', 'slideUp', 'slideDown', 
    'scale', 'rotate', 'blur'
  ]),
  className: PropTypes.string
};

CurtainTransition.propTypes = {
  children: PropTypes.node.isRequired
};

CircleRevealTransition.propTypes = {
  children: PropTypes.node.isRequired
};

FlipTransition.propTypes = {
  children: PropTypes.node.isRequired
};

StaggerChildren.propTypes = {
  children: PropTypes.node.isRequired,
  staggerDelay: PropTypes.number,
  className: PropTypes.string
};

FadeInWhenVisible.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

ScaleOnHover.propTypes = {
  children: PropTypes.node.isRequired,
  scale: PropTypes.number,
  className: PropTypes.string
};

ShakeAnimation.propTypes = {
  children: PropTypes.node.isRequired,
  trigger: PropTypes.bool,
  className: PropTypes.string
};

BounceAnimation.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string
};

export default PageTransition;
