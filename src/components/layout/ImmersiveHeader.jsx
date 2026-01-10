import { Logo } from '@/components/common/Logo';
import { HeaderControls } from '@/components/layout/HeaderControls';

/**
 * Cabecera unificada para modos inmersivos.
 * Ahora soporta 'centerSlot' para centrar elementos (ej. Timer) sin empujar el resto.
 */
export default function ImmersiveHeader({ leftSlot, centerSlot, showControls = true, children }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-between h-16 md:h-20">
          
          {/* 1. SLOT IZQUIERDO (Título/Logo) - Z-Index alto para clicks */}
          <div className="flex-1 min-w-0 flex items-center z-20 mr-4">
            {leftSlot || <Logo />}
          </div>

          {/* 2. SLOT CENTRAL (Absoluto para centrado matemático perfecto) */}
          {centerSlot && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center justify-center z-10 pointer-events-none">
              {/* pointer-events-auto si el centro tuviera botones, pero para texto/timer es mejor none */}
              {centerSlot}
            </div>
          )}

          {/* 3. SLOT DERECHO (Controles) - Z-Index alto */}
          <div className="flex-shrink-0 flex items-center justify-end gap-1 md:gap-2 z-20 ml-auto">
            {/* Controles por defecto (Tema/Sonido) */}
            {showControls && <HeaderControls className="scale-90 sm:scale-100" />}
            
            {/* Separador vertical si hay controles previos */}
            {showControls && children && (
              <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 mx-2 hidden sm:block" />
            )}

            {/* Hijos personalizados (Botones extra, Menú) */}
            <div className="flex items-center gap-1">
              {children}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}