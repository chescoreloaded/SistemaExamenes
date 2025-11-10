import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * StatsCard - Card de estadística con animación y dark mode
 * Muestra un valor principal, label, icono y valor secundario opcional
 */
export function StatsCard({
  icon,
  label,
  value,
  subtitle,
  trend,
  trendValue,
  color = 'blue',
  animateValue = true,
  onClick,
  className = ''
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Colores por tipo
  const colorVariants = {
    blue: {
      gradient: 'from-blue-500 to-indigo-500 dark:from-blue-600 dark:to-indigo-600',
      hover: 'hover:from-blue-600 hover:to-indigo-600 dark:hover:from-blue-700 dark:hover:to-indigo-700',
      glow: 'shadow-blue-500/50 dark:shadow-blue-600/30'
    },
    purple: {
      gradient: 'from-purple-500 to-pink-500 dark:from-purple-600 dark:to-pink-600',
      hover: 'hover:from-purple-600 hover:to-pink-600 dark:hover:from-purple-700 dark:hover:to-pink-700',
      glow: 'shadow-purple-500/50 dark:shadow-purple-600/30'
    },
    green: {
      gradient: 'from-green-500 to-emerald-500 dark:from-green-600 dark:to-emerald-600',
      hover: 'hover:from-green-600 hover:to-emerald-600 dark:hover:from-green-700 dark:hover:to-emerald-700',
      glow: 'shadow-green-500/50 dark:shadow-green-600/30'
    },
    orange: {
      gradient: 'from-orange-500 to-red-500 dark:from-orange-600 dark:to-red-600',
      hover: 'hover:from-orange-600 hover:to-red-600 dark:hover:from-orange-700 dark:hover:to-red-700',
      glow: 'shadow-orange-500/50 dark:shadow-orange-600/30'
    },
    cyan: {
      gradient: 'from-cyan-500 to-blue-500 dark:from-cyan-600 dark:to-blue-600',
      hover: 'hover:from-cyan-600 hover:to-blue-600 dark:hover:from-cyan-700 dark:hover:to-blue-700',
      glow: 'shadow-cyan-500/50 dark:shadow-cyan-600/30'
    },
    yellow: {
      gradient: 'from-yellow-500 to-orange-500 dark:from-yellow-600 dark:to-orange-600',
      hover: 'hover:from-yellow-600 hover:to-orange-600 dark:hover:from-yellow-700 dark:hover:to-orange-700',
      glow: 'shadow-yellow-500/50 dark:shadow-yellow-600/30'
    }
  };

  const colors = colorVariants[color] || colorVariants.blue;

  // Animación de counter para números
  useEffect(() => {
    if (!animateValue) {
      setDisplayValue(value);
      return;
    }

    // Extraer número del valor (puede ser "85%" o 85)
    const numericValue = typeof value === 'string' 
      ? parseFloat(value.replace(/[^0-9.]/g, '')) 
      : value;

    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    // Animar desde 0 hasta el valor
    const duration = 1000; // 1 segundo
    const steps = 30;
    const increment = numericValue / steps;
    const stepDuration = duration / steps;

    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value, animateValue]);

  // Formatear valor para display
  const getFormattedValue = () => {
    if (typeof value === 'string' && value.includes('%')) {
      return `${Math.round(displayValue)}%`;
    }
    return typeof value === 'number' ? Math.round(displayValue) : displayValue;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03, y: -5 }}
      transition={{ duration: 0.3 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`
        relative overflow-hidden
        bg-gradient-to-br ${colors.gradient}
        ${colors.hover}
        rounded-2xl shadow-xl ${isHovered ? colors.glow : ''}
        p-6 text-white
        transition-all duration-300
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
          backgroundSize: '24px 24px'
        }} />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          animate={isHovered ? { rotate: [0, -10, 10, -10, 0], scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 0.5 }}
          className="text-5xl mb-3"
        >
          {icon}
        </motion.div>

        {/* Label */}
        <p className="text-sm font-medium opacity-90 mb-2">
          {label}
        </p>

        {/* Value */}
        <div className="flex items-baseline gap-2">
          <motion.p
            key={displayValue}
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-4xl font-bold"
          >
            {getFormattedValue()}
          </motion.p>

          {/* Trend Indicator */}
          {trend && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className={`text-sm font-semibold flex items-center gap-1 ${
                trend === 'up' 
                  ? 'text-green-200' 
                  : trend === 'down' 
                  ? 'text-red-200' 
                  : 'text-white/70'
              }`}
            >
              {trend === 'up' && '↑'}
              {trend === 'down' && '↓'}
              {trendValue}
            </motion.span>
          )}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-xs opacity-75 mt-2"
          >
            {subtitle}
          </motion.p>
        )}
      </div>

      {/* Shine Effect on Hover */}
      {isHovered && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          style={{ transform: 'skewX(-20deg)' }}
        />
      )}
    </motion.div>
  );
}

StatsCard.propTypes = {
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  trend: PropTypes.oneOf(['up', 'down', 'neutral']),
  trendValue: PropTypes.string,
  color: PropTypes.oneOf(['blue', 'purple', 'green', 'orange', 'cyan', 'yellow']),
  animateValue: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string
};

export default StatsCard;