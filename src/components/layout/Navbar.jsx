// src/components/layout/Navbar.jsx
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

export function Navbar({ mobile = false, onItemClick }) {
  const { t } = useLanguage();
  const location = useLocation();

  const navItems = [
    { path: '/', label: t('navigation.home'), icon: '🏠' }, // Iconos más estándar
    { path: '/explorer', label: t('navigation.explorer'), icon: '🧭' },
    { path: '/analytics', label: t('navigation.analytics'), icon: '📊' }
  ];

  if (mobile) {
    return (
      <nav className="flex flex-col py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            onClick={onItemClick}
            className={({ isActive }) => `
              px-4 py-3 rounded-lg text-base font-medium flex items-center gap-3 transition-colors
              ${isActive 
                ? 'bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400' 
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }
            `}
          >
            <span className="text-xl">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
    );
  }

  // Desktop Version
  return (
    <nav className="hidden md:flex items-center gap-1 bg-white/50 dark:bg-gray-800/50 p-1.5 rounded-full border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-md shadow-sm">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={`
              relative px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 z-10
              ${isActive ? 'text-indigo-600 dark:text-indigo-300' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'}
            `}
          >
            {isActive && (
              <motion.div
                layoutId="desktop-nav-pill"
                className="absolute inset-0 bg-indigo-50 dark:bg-indigo-900/30 rounded-full -z-10"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}