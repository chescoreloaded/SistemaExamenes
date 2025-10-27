import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

export function Card({ children, className = '', hover = true }) {
  return (
    <motion.div
      className={`bg-white rounded-xl shadow-lg border-2 border-gray-100 overflow-hidden ${className}`}
      whileHover={hover ? { 
        y: -8, 
        scale: 1.02,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
      } : {}}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

Card.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  hover: PropTypes.bool
};

export default Card;