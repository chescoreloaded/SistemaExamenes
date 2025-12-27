import { useEffect, memo } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';

// ✅ Componente memoizado y optimizado para Dark Mode
export const Modal = memo(function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'md',
  showCloseButton = true 
}) {
  // Cerrar con ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              // ✅ CORRECCIÓN DARK MODE:
              // - bg-white dark:bg-gray-900 (Fondo oscuro)
              // - border-indigo-100 dark:border-gray-700 (Borde sutil)
              className={`
                bg-white dark:bg-gray-900 
                rounded-2xl shadow-2xl w-full ${sizes[size]} 
                pointer-events-auto 
                border-4 border-indigo-100 dark:border-gray-800
              `}
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 50 }}
              transition={{ type: "spring", duration: 0.5 }}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className={`
                  flex items-center justify-between p-6 
                  border-b-2 border-gray-100 dark:border-gray-800 
                  bg-gradient-to-r from-blue-50 to-indigo-50 
                  dark:from-gray-800 dark:to-gray-900
                  rounded-t-xl
                `}>
                  {/* Título adaptable */}
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    {title}
                  </h2>
                  
                  {/* Botón Cerrar adaptable */}
                  {showCloseButton && (
                    <motion.button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
                      whileHover={{ scale: 1.1, rotate: 90 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </motion.button>
                  )}
                </div>
              )}

              {/* Content */}
              {/* El texto aquí adentro heredará el color base si no se especifica, 
                  pero es mejor asegurar que los hijos manejen su propio color o agregar dark:text-gray-200 aquí */}
              <div className="p-6 text-gray-700 dark:text-gray-300">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.isOpen === nextProps.isOpen &&
    prevProps.title === nextProps.title &&
    prevProps.size === nextProps.size &&
    prevProps.children === nextProps.children // Añadido children a la comparación por seguridad
  );
});

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.node, // Cambiado a node por si pasas componentes en el título
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  showCloseButton: PropTypes.bool
};

Modal.displayName = 'Modal';

export default Modal;