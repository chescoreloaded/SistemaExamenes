import { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from './Navbar';
import { HeaderControls } from './HeaderControls';
import { Logo } from '../common/Logo';
import { PageTransition } from '../common/PageTransition';

export default function MainLayout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    // ✅ ARREGLO DE OVERFLOW (Problema 1 y 7)
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 overflow-x-hidden">
      {/* ✅ HEADER GLOBAL */}\
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* ✅ ARREGLO DE LAYOUT (Problema 1 y 8) */}
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo (Izquierda) */}
            <div className="flex-shrink-0">
              <Logo />
            </div>

            {/* Navbar Desktop (Centro) */}
            <div className="hidden md:flex absolute left-1/2 transform -translate-x-1/2">
              <Navbar />
            </div>
            
            {/* Controles y Hamburguesa (Derecha) */}
            <div className="flex items-center gap-2 md:gap-4">
              {/* Controles Desktop */}
              <div className="hidden md:flex items-center gap-4">
                <HeaderControls />
              </div>

              {/* Controles Móvil (más pequeños) */}
              <div className="flex md:hidden">
                <HeaderControls className="scale-90" />
              </div>

              {/* Botón Hamburguesa (Solo Móvil) */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="flex md:hidden p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors ml-1" // `ml-1` da espacio
                aria-label="Toggle menu"
              >
                <div className="w-6 h-6 flex flex-col justify-center gap-1.5">
                  <motion.span
                    animate={isMobileMenuOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                    className="w-full h-0.5 bg-current rounded-full origin-center transition-transform"
                  />
                  <motion.span
                    animate={isMobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                    className="w-full h-0.5 bg-current rounded-full transition-opacity"
                  />
                  <motion.span
                    animate={isMobileMenuOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                    className="w-full h-0.5 bg-current rounded-full origin-center transition-transform"
                  />
                </div>
              </button>
            </div>

          </div>
        </div>

        {/* ✅ MOBILE MENU (Desplegable) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="md:hidden border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-6 space-y-1">
                <Navbar mobile onItemClick={() => setIsMobileMenuOpen(false)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ✅ CONTENIDO PRINCIPAL */}
      <main className="relative z-0">
        <PageTransition type="fade" key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}