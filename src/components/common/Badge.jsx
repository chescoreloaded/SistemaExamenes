import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export function Badge({ children, variant = 'default', className = '' }) {
  const variants = {
    default: 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 border border-gray-300',
    primary: 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md',
    success: 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md',
    danger: 'bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-md',
    warning: 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-md',
    info: 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md'
  };

  return (
    <motion.span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${variants[variant]} ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['default', 'primary', 'success', 'danger', 'warning', 'info']),
  className: PropTypes.string
};

export default Badge;