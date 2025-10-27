import { useEffect, useState } from 'react';

/**
 * Hook para gestionar modo oscuro
 * ✅ Versión optimizada sin logs excesivos
 */
export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    if (saved !== null) {
      return JSON.parse(saved);
    }
    
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return true;
    }
    
    return false;
  });

  // Aplicar clase 'dark' al html
  useEffect(() => {
    const root = document.documentElement || document.querySelector('html') || document.body.parentElement;
    
    if (!root) {
      console.error('❌ useDarkMode: No se pudo acceder al elemento raíz');
      return;
    }

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    
    localStorage.setItem('darkMode', JSON.stringify(isDark));
    root.style.colorScheme = isDark ? 'dark' : 'light';
    
  }, [isDark]);

  // Escuchar cambios en preferencia del sistema
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      const saved = localStorage.getItem('darkMode');
      if (saved === null) {
        setIsDark(e.matches);
      }
    };
    
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, []);

  const toggle = () => setIsDark(prev => !prev);
  const enable = () => setIsDark(true);
  const disable = () => setIsDark(false);

  return {
    isDark,
    toggle,
    enable,
    disable
  };
}

export default useDarkMode;