import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

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

  // Paletas de colores vibrantes y modernas
  const colorVariants = {
    blue:   { bg: 'bg-blue-500',   from: 'from-blue-500',   to: 'to-indigo-600',   text: 'text-white', iconBg: 'bg-white/20' },
    purple: { bg: 'bg-purple-500', from: 'from-purple-500', to: 'to-pink-600',     text: 'text-white', iconBg: 'bg-white/20' },
    green:  { bg: 'bg-green-500',  from: 'from-emerald-500',to: 'to-green-600',    text: 'text-white', iconBg: 'bg-white/20' },
    orange: { bg: 'bg-orange-500', from: 'from-orange-500', to: 'to-red-500',      text: 'text-white', iconBg: 'bg-white/20' },
    cyan:   { bg: 'bg-cyan-500',   from: 'from-cyan-500',   to: 'to-blue-500',     text: 'text-white', iconBg: 'bg-white/20' },
  };

  const theme = colorVariants[color] || colorVariants.blue;

  // Animación numérica
  useEffect(() => {
    if (!animateValue) { setDisplayValue(value); return; }
    const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^0-9.]/g, '')) : value;
    if (isNaN(numericValue)) { setDisplayValue(value); return; }

    const duration = 1000;
    const steps = 30;
    const stepDuration = duration / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += numericValue / steps;
      if (current >= numericValue) {
        setDisplayValue(numericValue);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, stepDuration);
    return () => clearInterval(timer);
  }, [value, animateValue]);

  const getFormattedValue = () => {
    if (typeof value === 'string' && value.includes('%')) return `${Math.round(displayValue)}%`;
    return typeof value === 'number' ? Math.round(displayValue) : displayValue;
  };

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={`
        relative overflow-hidden rounded-2xl shadow-lg cursor-default
        bg-gradient-to-br ${theme.from} ${theme.to}
        p-5 text-white flex items-center gap-4 ${className}
      `}
    >
      {/* 1. Contenedor de Icono (Izquierda) */}
      <div className={`
        flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner
        ${theme.iconBg} backdrop-blur-sm
      `}>
        {icon}
      </div>

      {/* 2. Datos (Derecha) */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-0.5">
          {label}
        </p>
        
        <div className="flex items-end gap-2">
          <h3 className="text-3xl font-black leading-none tracking-tight">
            {getFormattedValue()}
          </h3>
          
          {/* Trend (Opcional) */}
          {trend && (
            <span className={`text-xs font-bold mb-1 px-1.5 py-0.5 rounded flex items-center ${trend === 'up' ? 'bg-green-400/30 text-green-50' : 'bg-red-400/30 text-red-50'}`}>
              {trend === 'up' ? '↑' : '↓'} {trendValue}
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-xs font-medium opacity-70 mt-1 truncate">
            {subtitle}
          </p>
        )}
      </div>

      {/* Decoración de Fondo */}
      <div className="absolute -right-6 -bottom-6 opacity-10 text-9xl pointer-events-none select-none rotate-12">
        {icon}
      </div>
      
      {/* Brillo en Hover */}
      {isHovered && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: '200%' }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
        />
      )}
    </motion.div>
  );
}

StatsCard.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  subtitle: PropTypes.string,
  color: PropTypes.string,
  className: PropTypes.string,
  trend: PropTypes.string,
  trendValue: PropTypes.string,
  animateValue: PropTypes.bool,
  onClick: PropTypes.func
};

export default StatsCard;