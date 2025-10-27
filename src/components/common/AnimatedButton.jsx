import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Botón animado con micro-interactions
 */
export function AnimatedButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className = '',
  ...props
}) {
  const baseStyles = 'font-semibold rounded-lg transition-all duration-200 relative overflow-hidden';
  
  const variants = {
    primary: 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl dark:from-indigo-500 dark:to-purple-500',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-lg hover:shadow-xl',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl',
    outline: 'border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50 dark:border-indigo-400 dark:text-indigo-400 dark:hover:bg-indigo-900/20',
    ghost: 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const disabledStyles = 'opacity-50 cursor-not-allowed';

  return (
    <motion.button
      onClick={disabled || loading ? undefined : onClick}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled || loading ? disabledStyles : ''}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      whileHover={disabled || loading ? {} : { scale: 1.02 }}
      whileTap={disabled || loading ? {} : { scale: 0.98 }}
      disabled={disabled || loading}
      {...props}
    >
      {/* Ripple effect */}
      {!disabled && !loading && (
        <motion.span
          className="absolute inset-0 bg-white/20"
          initial={{ scale: 0, opacity: 0 }}
          whileTap={{ 
            scale: 2, 
            opacity: [0, 0.3, 0],
            transition: { duration: 0.5 }
          }}
        />
      )}

      {/* Content */}
      <span className="relative flex items-center justify-center gap-2">
        {loading && (
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
          />
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span>{icon}</span>
        )}
        
        {children}
        
        {!loading && icon && iconPosition === 'right' && (
          <span>{icon}</span>
        )}
      </span>
    </motion.button>
  );
}

/**
 * Botón con efecto de hover 3D
 */
export function Button3D({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  const baseStyles = 'font-bold rounded-lg transition-all duration-200 relative transform';
  
  const variants = {
    primary: 'bg-indigo-600 text-white shadow-[0_6px_0_0_#4338ca] active:shadow-[0_2px_0_0_#4338ca] active:translate-y-1',
    success: 'bg-green-500 text-white shadow-[0_6px_0_0_#16a34a] active:shadow-[0_2px_0_0_#16a34a] active:translate-y-1',
    danger: 'bg-red-500 text-white shadow-[0_6px_0_0_#dc2626] active:shadow-[0_2px_0_0_#dc2626] active:translate-y-1'
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      className={`
        ${baseStyles}
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      whileHover={disabled ? {} : { y: -2 }}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * Botón con pulso
 */
export function PulseButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      className={`
        relative font-semibold rounded-lg
        ${variant === 'primary' ? 'bg-indigo-600 text-white' : ''}
        ${variant === 'success' ? 'bg-green-500 text-white' : ''}
        ${size === 'sm' ? 'px-4 py-2 text-sm' : ''}
        ${size === 'md' ? 'px-6 py-3 text-base' : ''}
        ${size === 'lg' ? 'px-8 py-4 text-lg' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      whileTap={{ scale: 0.95 }}
      disabled={disabled}
      {...props}
    >
      {/* Pulso animado */}
      {!disabled && (
        <motion.span
          className={`absolute inset-0 rounded-lg ${
            variant === 'primary' ? 'bg-indigo-600' : 'bg-green-500'
          }`}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.5, 0, 0.5]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      )}
      
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}

/**
 * Botón flotante (FAB)
 */
export function FloatingButton({
  children,
  onClick,
  position = 'bottom-right',
  className = '',
  ...props
}) {
  const positions = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  };

  return (
    <motion.button
      onClick={onClick}
      className={`
        fixed ${positions[position]} z-50
        w-16 h-16 rounded-full
        bg-gradient-to-br from-indigo-500 to-purple-600
        text-white text-2xl
        shadow-2xl hover:shadow-3xl
        flex items-center justify-center
        ${className}
      `}
      whileHover={{ scale: 1.1, rotate: 90 }}
      whileTap={{ scale: 0.9 }}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

/**
 * Botón con iconos intercambiables
 */
export function IconButton({
  icon,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  ariaLabel,
  className = '',
  ...props
}) {
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200',
    ghost: 'hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300'
  };

  const sizes = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg'
  };

  return (
    <motion.button
      onClick={disabled ? undefined : onClick}
      className={`
        rounded-lg flex items-center justify-center
        transition-all duration-200
        ${variants[variant]}
        ${sizes[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      whileHover={disabled ? {} : { scale: 1.1 }}
      whileTap={disabled ? {} : { scale: 0.9 }}
      aria-label={ariaLabel}
      disabled={disabled}
      {...props}
    >
      {icon}
    </motion.button>
  );
}

// PropTypes
AnimatedButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'outline', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  fullWidth: PropTypes.bool,
  className: PropTypes.string
};

Button3D.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'success', 'danger']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  className: PropTypes.string
};

PulseButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'success']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  className: PropTypes.string
};

FloatingButton.propTypes = {
  children: PropTypes.node.isRequired,
  onClick: PropTypes.func.isRequired,
  position: PropTypes.oneOf(['bottom-right', 'bottom-left', 'top-right', 'top-left']),
  className: PropTypes.string
};

IconButton.propTypes = {
  icon: PropTypes.node.isRequired,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  ariaLabel: PropTypes.string,
  className: PropTypes.string
};

export default AnimatedButton;
