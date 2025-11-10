import { NavLink } from 'react-router-dom';
import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';

export function Navbar() {
  const { t } = useLanguage();

  const navItems = [
    { path: '/', label: t('navigation.home'), icon: '📚' },
    { path: '/explorer', label: t('navigation.explorer'), icon: '🧭' },
    { path: '/analytics', label: t('navigation.analytics'), icon: '📊' }
  ];

  return (
    <nav className="flex items-center gap-1 bg-gray-100/50 dark:bg-gray-800/50 p-1 rounded-xl border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-sm">
      {navItems.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) => `
            relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2
            ${isActive 
              ? 'text-indigo-700 dark:text-indigo-300' 
              : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-white/50 dark:hover:bg-gray-700/50'
            }
          `}
        >
          {({ isActive }) => (
            <>
              {isActive && (
                <motion.div
                  layoutId="nav-pill"
                  className="absolute inset-0 bg-white dark:bg-gray-700 shadow-sm rounded-lg"
                  initial={false}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <span className="relative z-10">{item.icon}</span>
              <span className="relative z-10">{item.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
}