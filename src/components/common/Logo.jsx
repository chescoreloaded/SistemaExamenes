// src/components/common/Logo.jsx
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export function Logo({ className = '' }) {
  return (
    <Link to="/" className={`flex items-center gap-2 group ${className}`}>
      <motion.div
        whileHover={{ rotate: 180 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className="text-3xl"
      >
        ⚛️ {/* Placeholder del isotipo, cambiable por SVG luego */}
      </motion.div>
      <div className="flex flex-col">
        <span className="text-2xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 group-hover:to-indigo-500 transition-all duration-500">
          InovaCode
        </span>
        {/* Opcional: Tagline pequeño solo en desktop */}
        {/* <span className="text-[0.65rem] font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest hidden sm:block ml-0.5">
          Learning Platform
        </span> */}
      </div>
    </Link>
  );
}