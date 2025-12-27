import { Logo } from '@/components/common/Logo';
import { HeaderControls } from '@/components/layout/HeaderControls';

/**
 * Cabecera unificada para modos inmersivos.
 * @param {Object} props
 * @param {React.ReactNode} [props.leftSlot] - Reemplaza el Logo.
 * @param {boolean} [props.showControls=true] - ✅ NUEVO: Permite ocultar los controles por defecto (Sonido/Tema/Idioma).
 * @param {React.ReactNode} [props.children] - Elementos extra (ej. Botón Salir, Menú Engranaje).
 */
export default function ImmersiveHeader({ leftSlot, showControls = true, children }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/50 dark:border-gray-800/50 supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Slot Izquierdo: Logo o contenido personalizado */}
          <div className="flex-1 min-w-0">
            {leftSlot || <Logo />}
          </div>

          {/* Slot Derecho */}
          <div className="flex-shrink-0 flex items-center gap-2 md:gap-4 ml-2">
            {/* ✅ Solo mostramos los controles si showControls es true */}
            {showControls && <HeaderControls className="scale-90 sm:scale-100" />}
            
            {/* Renderizamos los hijos (Botones extra, menús propios) */}
            {children && (
              <>
                {/* Separador vertical si hay controles previos */}
                {showControls && <div className="h-6 w-px bg-gray-300 dark:bg-gray-600 hidden sm:block" />}
                <div className="flex items-center gap-2">
                  {children}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}