import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export function ProgressBar({ 
  current, 
  total, 
  showPercentage = true,
  variant = 'default',
  height = 'md'
}) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  const variants = {
    default: 'from-blue-500 via-indigo-500 to-purple-500',
    success: 'from-green-500 via-emerald-500 to-teal-500',
    warning: 'from-yellow-400 via-orange-400 to-red-400',
    danger: 'from-red-500 via-pink-500 to-rose-500'
  };

  const heights = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4'
  };

  return (
    <div className="w-full">
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${heights[height]} shadow-inner`}>
        <motion.div
          className={`h-full bg-gradient-to-r ${variants[variant]} rounded-full shadow-md`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
      {showPercentage && (
        <motion.p 
          className="text-sm text-gray-600 mt-1 text-center font-semibold"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {percentage}%
        </motion.p>
      )}
    </div>
  );
}

ProgressBar.propTypes = {
  current: PropTypes.number.isRequired,
  total: PropTypes.number.isRequired,
  showPercentage: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'success', 'warning', 'danger']),
  height: PropTypes.oneOf(['sm', 'md', 'lg', 'xl'])
};