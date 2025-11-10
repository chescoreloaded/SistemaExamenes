import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from './Navbar';
import { HeaderControls } from './HeaderControls';
import { useLanguage } from '@/context/LanguageContext';
import { PageTransition } from '../common/PageTransition';

export default function MainLayout() {
  const { t } = useLanguage();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* ✅ HEADER GLOBAL COMÚN */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Logo / Título */}
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl mr-2">🚀</span>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent leading-tight">
                  {t('app.title')}
                </h1>
                <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                  {t('app.subtitle')}
                </p>
              </div>
            </div>

            {/* Navegación Central */}
            <div className="flex-1 flex justify-center md:px-4">
              <Navbar />
            </div>
            
            {/* Controles Globales */}
            <div className="flex-shrink-0 flex justify-end">
              <HeaderControls languageReadOnly={false} />
            </div>

          </div>
        </div>
      </header>

      {/* ✅ CONTENIDO DE LA PÁGINA (Con transición) */}
      <main>
        {/* Usamos key={location.pathname} para forzar la animación al cambiar de ruta hija */}
        <PageTransition type="fade" key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
    </div>
  );
}